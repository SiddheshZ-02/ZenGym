import { useAuthStore } from "@/store/AuthStore";
import { useDataStore } from "@/store/DataStore";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LegendList } from "@legendapp/list";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Dimensions, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast } from "@/utils/toast";

const { width, height } = Dimensions.get("window");

const WorkoutLists = () => {
  const { workoutList, removeExerciseFromWorkout, workoutLoading } = useDataStore();
  const { signOut } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    showToast("success", "Logged out successfully!");
    router.replace("/login");
  };

  const removeWorkout = async (id: number) => {
    await removeExerciseFromWorkout(id);
    showToast("info", "Exercise removed from workout list!");
  };

  const navigateToExerciseDetails = (exerciseId: number) => {
    router.push({
      pathname: "/Details/[exercisesDetails]",
      params: { exercisesDetails: exerciseId.toString() },
    });
  };

  const renderWorkoutItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        backgroundColor: "#1a1a1a",
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        alignItems: "center",
      }}
      onPress={() => navigateToExerciseDetails(item.id)}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 10,
          overflow: "hidden",
          marginRight: 15,
        }}
      >
        <Image
          source={
            item.gif_url ||
            item.gifUrl ||
            "https://placehold.co/80x80/32CD32/000?text=Ex"
          }
          style={{ width: "100%", height: "100%" }}
          autoplay={false}
          contentFit="cover"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#fff",
            marginBottom: 5,
          }}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text style={{ fontSize: 14, color: "#32CD32", marginBottom: 3 }}>
          {item.category} • {item.difficulty}
        </Text>
        <Text style={{ fontSize: 14, color: "#999" }}>
          Target: {item.target}
        </Text>
      </View>

      <TouchableOpacity
        style={{ padding: 8 }}
        onPress={() => removeWorkout(item.id)}
      >
        <AntDesign name="delete" size={24} color="#FF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <SafeAreaView />

      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 15,
          borderBottomWidth: 1,
          borderBottomColor: "#333",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ width: 60 }} />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#32CD32",
              textAlign: "center",
            }}
          >
            My Workout List
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#999",
              textAlign: "center",
              marginTop: 5,
            }}
          >
            {workoutList.length}{" "}
            {workoutList.length === 1 ? "workout" : "workouts"}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            padding: 8,
            backgroundColor: "#2a2a2a",
            borderRadius: 10,
          }}
          onPress={handleLogout}
        >
          <AntDesign name="logout" size={24} color="#ff4444" />
        </TouchableOpacity>
      </View>

      {workoutLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#32CD32" />
        </View>
      ) : workoutList.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
          }}
        >
          <AntDesign name="inbox" size={80} color="#666" />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#fff",
              marginTop: 20,
              textAlign: "center",
            }}
          >
            No workouts added yet
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#999",
              marginTop: 10,
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            Add exercises from the body parts section to build your workout list
          </Text>
        </View>
      ) : (
        <LegendList
          data={workoutList}
          renderItem={renderWorkoutItem}
          recycleItems
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 15 }}
        />
      )}
    </View>
  );
};

export default WorkoutLists;
