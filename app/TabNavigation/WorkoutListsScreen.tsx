import { createThemedStyles, getResWidth } from "@/constants/responsive";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { useNotificationStore } from "@/store/notificationStore";
import { showToast } from "@/utils/toast";
import {
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TimePickerModal from "@/components/TimePickerModal";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const WorkoutListsScreen = () => {
  const {
    workoutList,
    removeExerciseFromWorkout,
    workoutLoading,
    fetchWorkoutList,
    setExerciseDay,
  } = useDataStore();
  const {
    setting,
    fetchReminderSetting,
    enableReminder,
    disableReminder,
    syncReminderDays,
    clearReminderSetting,
  } = useNotificationStore();
  const { signOut } = useAuthStore();
  const router = useRouter();
  const styles = useStyles();
  const workoutCount = workoutList.length;
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    fetchReminderSetting();
    return () => clearReminderSetting();
  }, [fetchReminderSetting, clearReminderSetting]);

  // Days that actually have at least one workout assigned
const activeDays = useMemo(() => {
  const daysSet = new Set<string>();
  workoutList.forEach((w) => {
    if (w.dayOfWeek && DAYS_OF_WEEK.includes(w.dayOfWeek)) {
      daysSet.add(w.dayOfWeek);
    }
  });
  return DAYS_OF_WEEK.filter((day) => daysSet.has(day));
}, [workoutList]);;

  const activeDaysKey = activeDays.slice().sort().join(",");

  // Keep an already-enabled reminder in sync if the user adds/removes days
  useEffect(() => {
    if (setting?.is_enabled) {
      syncReminderDays(activeDays);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDaysKey]);

  const groupWorkoutsByDay = () => {
    const grouped: Record<string, any[]> = { Unassigned: [] };
    DAYS_OF_WEEK.forEach((day) => (grouped[day] = []));

    workoutList.forEach((workout) => {
      if (workout.dayOfWeek && DAYS_OF_WEEK.includes(workout.dayOfWeek)) {
        grouped[workout.dayOfWeek].push(workout);
      } else {
        grouped.Unassigned.push(workout);
      }
    });

    return grouped;
  };

  const groupedWorkouts = groupWorkoutsByDay();

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWorkoutList();
    await fetchReminderSetting();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await signOut();
    showToast("success", "Logged out successfully!");
    router.replace("/Screen/Auth/LoginScreen");
  };

  const removeWorkout = async (id: number) => {
    await removeExerciseFromWorkout(id);
    showToast("success", "Exercise removed from workout list!");
  };

  const navigateToExerciseDetails = (exerciseId: number) => {
    router.push({
      pathname: "/Screen/ExerciseDetails/ExerciseDetailsScreen",
      params: { exercisesDetails: exerciseId.toString() },
    });
  };

  const toggleAccordion = (day: string) => {
    setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const openDayPicker = (exercise: any) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  };

  const selectDay = async (day: string) => {
    if (selectedExercise) {
      await setExerciseDay(selectedExercise.id, day);
      showToast("success", `Exercise assigned to ${day}!`);
    }
    setModalVisible(false);
    setSelectedExercise(null);
  };

  const isReminderOn = setting?.is_enabled ?? false;

  const handleReminderToggle = async (value: boolean) => {
    if (activeDays.length === 0) return; // safety guard, toggle shouldn't even render
    if (value) {
      setShowTimePicker(true); // permission is requested on confirm, inside enableReminder
    } else {
      await disableReminder();
      showToast("success", "Workout reminders turned off");
    }
  };

  const handleTimeConfirm = async (hour: number, minute: number) => {
    const success = await enableReminder(hour, minute, activeDays);
    if (success) {
      showToast("success", "Workout reminders activated!");
    } else {
      showToast("error", "Couldn't set reminder. Check notification permissions.");
    }
    setShowTimePicker(false);
  };

  const renderWorkoutItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.rowCard}
      onPress={() => navigateToExerciseDetails(item.id)}
    >
      <View style={styles.rowImageWrap}>
        <Image
          source={
            item.gif_url || item.gifUrl
              ? { uri: (item.gif_url || item.gifUrl) as string }
              : "https://placehold.co/80x80/32CD32/000?text=Ex"
          }
          style={styles.rowImage}
          autoplay={false}
          contentFit="cover"
          placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
          transition={200}
          cachePolicy="memory-disk"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.rowName} numberOfLines={2}>
          {item.name}
        </Text>
        {!!item.target && (
          <Text style={styles.rowTarget}>Target: {item.target}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeWorkout(item.id)}
      >
        <MaterialIcons name="delete-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAccordion = (day: string, workouts: any[]) => {
    if (workouts.length === 0 && day !== "Unassigned") return null;

    return (
      <View key={day}>
        <View style={styles.accordionItem}>
          <View style={styles.accordionHeader}>
            <Text style={styles.accordionTitle}>
              {day} ({workouts.length})
            </Text>
            <TouchableOpacity onPress={() => toggleAccordion(day)}>
              <Ionicons
                name={expandedDays[day] ? "chevron-up" : "chevron-down"}
                size={24}
                color="#32CD32"
              />
            </TouchableOpacity>
          </View>

          {expandedDays[day] && (
            <View style={styles.accordionContent}>
              {workouts.map((item) => (
                <View key={item.id}>{renderWorkoutItem({ item })}</View>
              ))}
              {workouts.length === 0 && (
                <Text
                  style={{ color: "#666", textAlign: "center", padding: 20 }}
                >
                  No workouts for {day}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => router.push("/Screen/Plans/PlansScreen")}
          >
            <FontAwesome5 name="crown" size={28} color="#EFBF04" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.title}>My Workout List</Text>
            <Text style={styles.subtitle}>
              {workoutCount} {workoutCount === 1 ? "workout" : "workouts"}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <AntDesign name="logout" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>

        {/* Single reminder toggle — only shown when there's at least one day with workouts */}
        {activeDays.length > 0 && (
          <View style={styles.reminderBar}>
            <View style={styles.reminderBarLeft}>
              <Ionicons
                name={isReminderOn ? "notifications" : "notifications-outline"}
                size={20}
                color="#32CD32"
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.reminderBarTitle}>Workout Reminders</Text>
                <Text style={styles.reminderBarSubtitle}>
                  {isReminderOn && setting?.reminder_time
                    ? `On at ${formatTime(setting.reminder_time)} · ${activeDays.length} ${
                        activeDays.length === 1 ? "day" : "days"
                      }`
                    : `Get notified on your ${activeDays.length} workout ${
                        activeDays.length === 1 ? "day" : "days"
                      }`}
                </Text>
              </View>
            </View>
            <Switch
              value={isReminderOn}
              onValueChange={handleReminderToggle}
              trackColor={{ false: "#444", true: "#2a5c2a" }}
              thumbColor={isReminderOn ? "#32CD32" : "#888"}
            />
          </View>
        )}

        {workoutLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#32CD32" />
          </View>
        ) : workoutCount === 0 ? (
          <View style={styles.emptyState}>
            <AntDesign name="inbox" size={80} color="#666" />
            <Text style={styles.emptyTitle}>No workouts added yet</Text>
            <Text style={styles.emptyText}>
              Add exercises from the body parts section to build your workout
              list
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#32CD32"]}
                tintColor="#32CD32"
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {groupedWorkouts.Unassigned.length > 0 && (
              <View style={styles.unassignedSection}>
                {renderAccordion("Unassigned", groupedWorkouts.Unassigned)}
              </View>
            )}
            {DAYS_OF_WEEK.map((day) =>
              renderAccordion(day, groupedWorkouts[day]),
            )}
          </ScrollView>
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Day</Text>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day}
                style={styles.dayButton}
                onPress={() => selectDay(day)}
              >
                <Text style={styles.dayButtonText}>{day}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showTimePicker && (
        <TimePickerModal
          visible={showTimePicker}
        dayOfWeek={activeDays.join(", ")}
          onConfirm={handleTimeConfirm}
          onCancel={() => setShowTimePicker(false)}
        />
      )}
    </SafeAreaView>
  );
};

function formatTime(time: string) {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

const useStyles = createThemedStyles((_, responsive) => {
  const { spacing, radius, fontSizes, ms, wp, containerMaxWidth } = responsive;
  const imageSize = wp(50);

  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#000" },
    screen: { flex: 1, backgroundColor: "#000" },
    header: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: "#333",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      maxWidth: containerMaxWidth,
      width: "100%",
      alignSelf: "center",
    },
    headerCenter: { flex: 1, alignItems: "center" },
    title: {
      fontSize: fontSizes.xl,
      fontWeight: "bold",
      color: "#32CD32",
      textAlign: "center",
    },
    subtitle: {
      fontSize: fontSizes.md,
      color: "#999",
      textAlign: "center",
      marginTop: spacing.xs,
    },
    logoutButton: {
      padding: spacing.sm,
      backgroundColor: "#2a2a2a",
      borderRadius: radius.md,
    },
    reminderBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#1a1a1a",
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      maxWidth: containerMaxWidth,
      width: `calc(100% - ${spacing.md * 2}px)` as any,
      alignSelf: "center",
    },
    reminderBarLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    reminderBarTitle: {
      color: "#fff",
      fontWeight: "600",
      fontSize: fontSizes.md,
    },
    reminderBarSubtitle: {
      color: "#999",
      fontSize: fontSizes.xs,
      marginTop: 2,
    },
    loadingState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000",
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.xl,
      backgroundColor: "#000",
    },
    emptyTitle: {
      fontSize: fontSizes.lg,
      fontWeight: "600",
      color: "#fff",
      marginTop: spacing.lg,
      textAlign: "center",
    },
    emptyText: {
      fontSize: fontSizes.md,
      color: "#999",
      marginTop: spacing.sm,
      textAlign: "center",
      lineHeight: ms(24),
    },
    listContent: {
      padding: spacing.md,
      paddingBottom: spacing.xxl,
      alignSelf: "center",
      width: "100%",
      maxWidth: containerMaxWidth,
    },
    accordionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#1a1a1a",
      padding: spacing.md,
      borderRadius: radius.lg,
    },
    accordionItem: {
      backgroundColor: "#1a1a1a",
      padding: spacing.sm,
      borderRadius: radius.lg,
      marginBottom: spacing.sm,
    },
    accordionTitle: {
      fontSize: fontSizes.lg,
      fontWeight: "bold",
      color: "#fff",
    },
    accordionContent: { marginBottom: spacing.md },
    rowCard: {
      flexDirection: "row",
      backgroundColor: "#2a2a2a",
      borderRadius: radius.lg,
      padding: spacing.sm,
      marginBottom: spacing.sm,
      alignItems: "center",
    },
    rowImageWrap: {
      width: imageSize,
      height: imageSize,
      borderRadius: radius.md,
      overflow: "hidden",
      marginRight: spacing.md,
    },
    rowImage: { width: "100%", height: "100%", backgroundColor: "#1a1a1a" },
    rowName: {
      fontSize: fontSizes.lg,
      fontWeight: "600",
      color: "#fff",
      marginBottom: spacing.xxs,
    },
    rowTarget: { fontSize: fontSizes.sm, color: "#999" },
    deleteButton: {
      padding: spacing.xs,
      backgroundColor: "red",
      borderRadius: radius.lg,
      marginLeft: spacing.xs,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: "#1a1a1a",
      borderRadius: radius.lg,
      padding: spacing.xl,
      width: "85%",
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: fontSizes.xl,
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center",
      marginBottom: spacing.lg,
    },
    dayButton: {
      padding: spacing.md,
      backgroundColor: "#2a2a2a",
      borderRadius: radius.md,
      marginBottom: spacing.sm,
      alignItems: "center",
    },
    dayButtonText: { fontSize: fontSizes.md, color: "#fff" },
    closeModalButton: {
      padding: spacing.md,
      backgroundColor: "#444",
      borderRadius: radius.md,
      marginTop: spacing.md,
      alignItems: "center",
    },
    closeModalButtonText: { fontSize: fontSizes.md, color: "#fff" },
    unassignedSection: { marginBottom: spacing.md },
  });
});

export default WorkoutListsScreen;