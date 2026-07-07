import { createThemedStyles } from "@/constants/responsive";
import { useAuthStore } from "@/store/authStore";
import { useDataStore } from "@/store/dataStore";
import { showToast } from "@/utils/toast";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LegendList } from "@legendapp/list";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const useStyles = createThemedStyles((_, responsive) => {
  const { spacing, radius, fontSizes, ms, wp, containerMaxWidth } = responsive;
  const imageSize = wp(80);

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
    },
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
    rowCard: {
      flexDirection: "row",
      backgroundColor: "#1a1a1a",
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
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
    },
  });
});

const WorkoutListsScreen = () => {
  const { workoutList, removeExerciseFromWorkout, workoutLoading } =
    useDataStore();
  const { signOut } = useAuthStore();
  const router = useRouter();
  const styles = useStyles();
  const workoutCount = workoutList.length;

  const handleLogout = async () => {
    await signOut();
    showToast("success", "Logged out successfully!");
    router.replace("/Screen/Auth/LoginScreen");
  };

  const removeWorkout = async (id: number) => {
    await removeExerciseFromWorkout(id);
    showToast("info", "Exercise removed from workout list!");
  };

  const navigateToExerciseDetails = (exerciseId: number) => {
    router.push({
      pathname: "/Screen/ExerciseDetails/ExerciseDetailsScreen",
      params: { exercisesDetails: exerciseId.toString() },
    });
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
        {(item.category || item.difficulty) && (
          <Text style={styles.rowMeta}>
            {[item.category, item.difficulty].filter(Boolean).join(" - ")}
          </Text>
        )}
        {!!item.target && (
          <Text style={styles.rowTarget}>Target: {item.target}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeWorkout(item.id)}
      >
        <AntDesign name="delete" size={24} color="#FF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
          <LegendList
            data={workoutList}
            renderItem={renderWorkoutItem}
            recycleItems
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default WorkoutListsScreen;
