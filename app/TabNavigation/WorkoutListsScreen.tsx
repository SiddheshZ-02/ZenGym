import { createThemedStyles, getResWidth } from "@/constants/responsive";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { showToast } from "@/utils/toast";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const { signOut } = useAuthStore();
  const router = useRouter();
  const styles = useStyles();
  const workoutCount = workoutList.length;
  const [refreshing, setRefreshing] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  // Group workouts by day of week
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
      <StatusBar backgroundColor="#32CD32" barStyle="dark-content" />

      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
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
            {/* Unassigned workouts first */}
            {groupedWorkouts.Unassigned.length > 0 && (
              <View style={styles.unassignedSection}>
                {renderAccordion("Unassigned", groupedWorkouts.Unassigned)}
              </View>
            )}
            {/* Then each day of the week */}
            {DAYS_OF_WEEK.map((day) =>
              renderAccordion(day, groupedWorkouts[day]),
            )}
          </ScrollView>
        )}
      </View>

      {/* Day Picker Modal */}
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
    </SafeAreaView>
  );
};

const useStyles = createThemedStyles((_, responsive) => {
  const { spacing, radius, fontSizes, ms, wp, containerMaxWidth } = responsive;
  const imageSize = wp(50);

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#000",
    },
    screen: {
      flex: 1,
      backgroundColor: "#000",
    },
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
    headerSpacer: {
      width: ms(60),
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
    },
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
      // marginBottom: spacing.sm,
    },
    accordionItem: {
      // flexDirection: "row",
      // justifyContent: "space-between",
      // alignItems: "center",
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
    accordionContent: {
      marginBottom: spacing.md,
    },
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
    rowImage: {
      width: "100%",
      height: "100%",
      backgroundColor: "#1a1a1a",
    },
    rowName: {
      fontSize: fontSizes.lg,
      fontWeight: "600",
      color: "#fff",
      marginBottom: spacing.xxs,
    },
    rowMeta: {
      fontSize: fontSizes.sm,
      color: "#32CD32",
      marginBottom: spacing.xxs,
    },
    rowTarget: {
      fontSize: fontSizes.sm,
      color: "#999",
    },
    deleteButton: {
      padding: spacing.xs,
      backgroundColor: "red",
      borderRadius: radius.lg,
      marginLeft: spacing.xs,
    },
    editDayButton: {
      padding: spacing.xs,
      backgroundColor: "#32CD32",
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
    dayButtonText: {
      fontSize: fontSizes.md,
      color: "#fff",
    },
    closeModalButton: {
      padding: spacing.md,
      backgroundColor: "#444",
      borderRadius: radius.md,
      marginTop: spacing.md,
      alignItems: "center",
    },
    closeModalButtonText: {
      fontSize: fontSizes.md,
      color: "#fff",
    },
    unassignedSection: {
      marginBottom: spacing.md,
    },
  });
});

export default WorkoutListsScreen;
