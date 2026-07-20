import { createThemedStyles } from "@/constants/responsive";
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
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TimePickerModal from "@/components/TimePickerModal";
import PremiumUnlockModal from "@/components/PremiumUnlockModal";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const PLACEHOLDER_IMG = "https://placehold.co/80x80/32CD32/000?text=Ex";
const BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

const isPremiumWorkout = (workout: any) => {
  const diff = workout.difficulty?.toLowerCase();
  return diff === "intermediate" || diff === "advanced";
};

/* ------------------------------------------------------------------ */
/* Countdown Timer                                                     */
/* ------------------------------------------------------------------ */
const CountdownTimer = memo(({ expiry }: { expiry: number }) => {
  const [timeLeft, setTimeLeft] = useState(expiry - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = expiry - Date.now();
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) clearInterval(interval);
    }, 30000);

    return () => clearInterval(interval);
  }, [expiry]);

  const formatted = formatRemaining(timeLeft);
  return <Text style={countdownStyles.text}>{formatted}</Text>;
});
CountdownTimer.displayName = "CountdownTimer";

const countdownStyles = StyleSheet.create({
  text: { color: "#32CD32", fontWeight: "700", fontSize: 13 },
});

function formatRemaining(ms: number) {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/* ------------------------------------------------------------------ */
/* Workout Row Item — memoized so unrelated state changes             */
/* (e.g. reminder toggle, other items unlocking) don't re-render it   */
/* ------------------------------------------------------------------ */
type WorkoutItemProps = {
  item: any;
  unlocked: boolean;
  premium: boolean;
  expiry?: number;
  onPress: (item: any) => void;
  onDelete: (id: number) => void;
  styles: ReturnType<typeof useStyles>;
};

const WorkoutItem = memo(
  ({ item, unlocked, premium, expiry, onPress, onDelete, styles }: WorkoutItemProps) => {
    const handlePress = useCallback(() => onPress(item), [onPress, item]);
    const handleDelete = useCallback(() => onDelete(item.id), [onDelete, item.id]);

    const imageSource = item.gif_url || item.gifUrl
      ? { uri: (item.gif_url || item.gifUrl) as string }
      : PLACEHOLDER_IMG;

    if (premium) {
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePress}
          style={styles.premiumCardWrap}
        >
          <LinearGradient
            colors={["#0a1f0a", "#173617", "#112b11"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumCard}
          >
            <View style={styles.rowImageWrapPremium}>
              <Image
                source={imageSource}
                style={styles.rowImagePremium}
                autoplay={false}
                contentFit="cover"
                placeholder={{ blurhash: BLURHASH }}
                transition={200}
                recyclingKey={String(item.id)}
              />
            </View>

            <View style={styles.flex1}>
              <View style={styles.premiumTitleRow}>
                <Text style={styles.rowName} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.premiumBadgeRow}>
                  <MaterialCommunityIcons name="crown" size={18} color="#32CD32" />
                  <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                </View>
              </View>

              {!!item.target && (
                <Text style={styles.rowTarget}>Target: {item.target}</Text>
              )}
            </View>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <MaterialIcons name="delete-outline" size={24} color="#fff" />
            </TouchableOpacity>

            {unlocked && expiry && (
              <View style={styles.countdownWrap}>
                <CountdownTimer expiry={expiry} />
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.rowCard} onPress={handlePress}>
        <View style={styles.rowImageWrap}>
          <Image
            source={imageSource}
            style={styles.rowImage}
            autoplay={false}
            contentFit="cover"
            placeholder={{ blurhash: BLURHASH }}
            transition={200}
            recyclingKey={String(item.id)}
          />
        </View>

        <View style={styles.flex1}>
          <Text style={styles.rowName} numberOfLines={2}>
            {item.name}
          </Text>
          {!!item.target && (
            <Text style={styles.rowTarget}>Target: {item.target}</Text>
          )}
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <MaterialIcons name="delete-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  },
);
WorkoutItem.displayName = "WorkoutItem";

/* ------------------------------------------------------------------ */
/* Section Header — memoized                                          */
/* ------------------------------------------------------------------ */
const SectionHeader = memo(
  ({
    day,
    count,
    expanded,
    onToggle,
    styles,
  }: {
    day: string;
    count: number;
    expanded: boolean;
    onToggle: (day: string) => void;
    styles: ReturnType<typeof useStyles>;
  }) => {
    const handleToggle = useCallback(() => onToggle(day), [onToggle, day]);
    return (
      <View style={styles.accordionHeader}>
        <Text style={styles.accordionTitle}>
          {day} ({count})
        </Text>
        <TouchableOpacity onPress={handleToggle} hitSlop={8}>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={24}
            color="#32CD32"
          />
        </TouchableOpacity>
      </View>
    );
  },
);
SectionHeader.displayName = "SectionHeader";

/* ------------------------------------------------------------------ */
/* Main Screen                                                         */
/* ------------------------------------------------------------------ */
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

  const [refreshing, setRefreshing] = useState(false);
  // Default all days expanded on first mount so behaviour matches before;
  // change to {} if you'd rather start collapsed.
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [unlockMap, setUnlockMap] = useState<Record<number, number>>({});
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [selectedPremiumWorkout, setSelectedPremiumWorkout] = useState<any>(null);

  const workoutCount = workoutList.length;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("premium_unlocks");
        if (raw) setUnlockMap(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to load unlocks:", e);
      }
    })();
  }, []);

  useEffect(() => {
    fetchReminderSetting();
    return () => clearReminderSetting();
  }, [fetchReminderSetting, clearReminderSetting]);

  const activeDays = useMemo(() => {
    const daysSet = new Set<string>();
    workoutList.forEach((w) => {
      if (w.dayOfWeek && DAYS_OF_WEEK.includes(w.dayOfWeek)) daysSet.add(w.dayOfWeek);
    });
    return DAYS_OF_WEEK.filter((day) => daysSet.has(day));
  }, [workoutList]);

  useEffect(() => {
    if (setting?.is_enabled) syncReminderDays(activeDays);
    // syncReminderDays intentionally omitted if it's stable from the store;
    // keep it in deps only if it's memoized on the store side.
  }, [activeDays, setting?.is_enabled, syncReminderDays]);

  // Grouped + flattened into SectionList sections. Memoized so this heavy
  // grouping only recomputes when workoutList actually changes.
  const groupedWorkouts = useMemo(() => {
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
  }, [workoutList]);

  const sections = useMemo(() => {
    const order = ["Unassigned", ...DAYS_OF_WEEK];
    return order
      .filter((day) => groupedWorkouts[day]?.length > 0)
      .map((day) => ({
        title: day,
        data: expandedDays[day] ? groupedWorkouts[day] : [],
        fullCount: groupedWorkouts[day].length,
      }));
  }, [groupedWorkouts, expandedDays]);

  const isUnlocked = useCallback(
    (id: number) => {
      const expiry = unlockMap[id];
      return !!expiry && expiry > Date.now();
    },
    [unlockMap],
  );

  const handlePremiumPress = useCallback(
    (workout: any) => {
      if (isUnlocked(workout.id)) {
        router.push({
          pathname: "/Screen/ExerciseDetails/ExerciseDetailsScreen",
          params: { exercisesDetails: workout.id.toString() },
        });
      } else {
        setSelectedPremiumWorkout(workout);
        setPremiumModalVisible(true);
      }
    },
    [isUnlocked, router],
  );

  const startUnlock = useCallback(async (workout: any) => {
    const expiry = Date.now() + 60 * 60 * 1000; // 1 hour access
    setUnlockMap((prev) => {
      const next = { ...prev, [workout.id]: expiry };
      AsyncStorage.setItem("premium_unlocks", JSON.stringify(next)).catch((e) =>
        console.error("Failed to persist unlocks:", e),
      );
      return next;
    });
    setPremiumModalVisible(false);
    showToast("success", "Premium workout unlocked for 1 hour!");
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchWorkoutList(), fetchReminderSetting()]);
    setRefreshing(false);
  }, [fetchWorkoutList, fetchReminderSetting]);

  const handleLogout = useCallback(async () => {
    await signOut();
    showToast("success", "Logged out successfully!");
    router.replace("/Screen/Auth/LoginScreen");
  }, [signOut, router]);

  const removeWorkout = useCallback(
    async (id: number) => {
      await removeExerciseFromWorkout(id);
      showToast("success", "Exercise removed from workout list!");
    },
    [removeExerciseFromWorkout],
  );

  const navigateToExerciseDetails = useCallback(
    (item: any) => {
      const premium = isPremiumWorkout(item);
      if (premium) {
        handlePremiumPress(item);
        return;
      }
      router.push({
        pathname: "/Screen/ExerciseDetails/ExerciseDetailsScreen",
        params: { exercisesDetails: item.id.toString() },
      });
    },
    [handlePremiumPress, router],
  );

  const toggleAccordion = useCallback((day: string) => {
    setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  }, []);

  const openDayPicker = useCallback((exercise: any) => {
    setSelectedExercise(exercise);
    setModalVisible(true);
  }, []);

  const selectDay = useCallback(
    async (day: string) => {
      if (selectedExercise) {
        await setExerciseDay(selectedExercise.id, day);
        showToast("success", `Exercise assigned to ${day}!`);
      }
      setModalVisible(false);
      setSelectedExercise(null);
    },
    [selectedExercise, setExerciseDay],
  );

  const isReminderOn = setting?.is_enabled ?? false;

  const handleReminderToggle = useCallback(
    async (value: boolean) => {
      if (activeDays.length === 0) return;
      if (value) {
        setShowTimePicker(true);
      } else {
        await disableReminder();
        showToast("success", "Workout reminders turned off");
      }
    },
    [activeDays, disableReminder],
  );

  const handleTimeConfirm = useCallback(
    async (hour: number, minute: number) => {
      const success = await enableReminder(hour, minute, activeDays);
      if (success) {
        showToast("success", "Workout reminders activated!");
      } else {
        showToast("error", "Couldn't set reminder. Check notification permissions.");
      }
      setShowTimePicker(false);
    },
    [enableReminder, activeDays],
  );

  const closePremiumModal = useCallback(() => setPremiumModalVisible(false), []);
  const closeDayModal = useCallback(() => setModalVisible(false), []);
  const closeTimePicker = useCallback(() => setShowTimePicker(false), []);
  const onWatchPremium = useCallback(() => {
    if (selectedPremiumWorkout) startUnlock(selectedPremiumWorkout);
  }, [selectedPremiumWorkout, startUnlock]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const premium = isPremiumWorkout(item);
      const unlocked = premium && isUnlocked(item.id);
      return (
        <View style={styles.itemSpacing}>
          <WorkoutItem
            item={item}
            premium={premium}
            unlocked={unlocked}
            expiry={unlockMap[item.id]}
            onPress={navigateToExerciseDetails}
            onDelete={removeWorkout}
            styles={styles}
          />
        </View>
      );
    },
    [isUnlocked, unlockMap, navigateToExerciseDetails, removeWorkout, styles],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: (typeof sections)[number] }) => (
      <SectionHeader
        day={section.title}
        count={section.fullCount}
        expanded={!!expandedDays[section.title]}
        onToggle={toggleAccordion}
        styles={styles}
      />
    ),
    [expandedDays, toggleAccordion, styles],
  );

  const keyExtractor = useCallback((item: any) => String(item.id), []);

  const activeDaysLabel = useMemo(() => activeDays.join(", "), [activeDays]);

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

        {activeDays.length > 0 && (
          <View style={styles.reminderBar}>
            <View style={styles.reminderBarLeft}>
              <Ionicons
                name={isReminderOn ? "notifications" : "notifications-outline"}
                size={20}
                color="#32CD32"
              />
              <View style={styles.reminderTextWrap}>
                <Text style={styles.reminderBarTitle}>Workout Reminders</Text>
                <Text style={styles.reminderBarSubtitle}>
                  {isReminderOn && setting?.reminder_time
                    ? `On at ${formatTime(setting.reminder_time)} · ${activeDays.length} ${activeDays.length === 1 ? "day" : "days"}`
                    : `Get notified on your ${activeDays.length} workout ${activeDays.length === 1 ? "day" : "days"}`}
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
              Add exercises from the body parts section to build your workout list
            </Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#32CD32"]}
              />
            }
            showsVerticalScrollIndicator={false}
            // --- Smoothness / perf tuning ---
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews
            stickySectionHeadersEnabled={false}
          />
        )}
      </View>

      <PremiumUnlockModal
        visible={premiumModalVisible}
        onRequestClose={closePremiumModal}
        onWatch={onWatchPremium}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeDayModal}
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
            <TouchableOpacity style={styles.closeModalButton} onPress={closeDayModal}>
              <Text style={styles.closeModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showTimePicker && (
        <TimePickerModal
          visible={showTimePicker}
          dayOfWeek={activeDaysLabel}
          onConfirm={handleTimeConfirm}
          onCancel={closeTimePicker}
        />
      )}
    </SafeAreaView>
  );
};

const useStyles = createThemedStyles((_, responsive) => {
  const { spacing, radius, fontSizes, wp, ms, containerMaxWidth } = responsive;
  const imageSize = wp(50);

  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#000" },
    screen: { flex: 1, backgroundColor: "#000" },
    flex1: { flex: 1 },
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
    title: { fontSize: fontSizes.xl, fontWeight: "bold", color: "#32CD32" },
    subtitle: { fontSize: fontSizes.md, color: "#999", marginTop: spacing.xs },
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
    },
    reminderBarLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    reminderTextWrap: { marginLeft: 10 },
    reminderBarTitle: { color: "#fff", fontWeight: "600", fontSize: fontSizes.md },
    reminderBarSubtitle: { color: "#999", fontSize: fontSizes.xs, marginTop: 2 },

    loadingState: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
      fontSize: fontSizes.lg,
      fontWeight: "600",
      color: "#fff",
      marginTop: spacing.lg,
    },
    emptyText: {
      fontSize: fontSizes.md,
      color: "#999",
      marginTop: spacing.sm,
      textAlign: "center",
      lineHeight: ms(24),
    },

    listContent: { padding: spacing.md, paddingBottom: spacing.xxl },
    itemSpacing: { marginBottom: 8 },

    accordionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#1a1a1a",
      padding: spacing.md,
      borderRadius: radius.lg,
      marginBottom: spacing.sm,
    },
    accordionTitle: { fontSize: fontSizes.lg, fontWeight: "bold", color: "#fff" },

    rowCard: {
      flexDirection: "row",
      backgroundColor: "#2a2a2a",
      borderRadius: radius.lg,
      padding: spacing.sm,
      alignItems: "center",
    },

    premiumCardWrap: {
      borderRadius: radius.lg,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(50, 205, 50, 0.6)",
      shadowColor: "#32CD32",
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 6,
    },
    premiumCard: { flexDirection: "row", alignItems: "center", padding: spacing.sm },
    premiumTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    premiumBadgeRow: { flexDirection: "row", alignItems: "center" },
    countdownWrap: { position: "absolute", right: 70, bottom: 12 },

    rowImageWrap: {
      width: imageSize,
      height: imageSize,
      borderRadius: radius.md,
      overflow: "hidden",
      marginRight: spacing.md,
    },
    rowImageWrapPremium: {
      width: imageSize,
      height: imageSize,
      borderRadius: radius.md,
      overflow: "hidden",
      marginRight: spacing.md,
      backgroundColor: "#fff",
      padding: 4,
    },
    rowImage: { width: "100%", height: "100%", backgroundColor: "#1a1a1a" },
    rowImagePremium: { width: "100%", height: "100%", borderRadius: radius.sm },

    rowName: {
      fontSize: fontSizes.lg,
      fontWeight: "600",
      color: "#fff",
      marginBottom: spacing.xxs,
      flex: 1,
    },
    rowTarget: { fontSize: fontSizes.sm, color: "#999", width: "70%" },
    premiumBadgeText: {
      fontSize: fontSizes.xs,
      fontWeight: "800",
      color: "#32CD32",
      marginLeft: 4,
    },
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
  });
});

function formatTime(time: string) {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

export default WorkoutListsScreen;