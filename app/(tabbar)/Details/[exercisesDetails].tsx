import { ExerciseType, useDataStore } from "@/store/DataStore";
import { showToast } from "@/utils/toast";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height, width } = Dimensions.get("window");

const ExercisesDetails = () => {
  const [info, setInfo] = useState<ExerciseType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const { exercisesDetails } = useLocalSearchParams();
  const { workoutList, addExerciseToWorkout, fetchExerciseById } =
    useDataStore();

  const loadExercise = async () => {
    if (!exercisesDetails) return;
    setLoading(true);
    try {
      const id = Number(exercisesDetails);
      const exercise = await fetchExerciseById(id);
      setInfo(exercise);
    } catch (error) {
      console.error("Error loading exercise:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercise();
  }, [exercisesDetails]);

  const handleAddExercises = async () => {
    if (info) {
      if (workoutList.some((item) => item.id === info.id)) {
        showToast("info", "This exercise is already in your workout list!");
      } else {
        await addExerciseToWorkout(info);
        showToast("success", "Exercise has been added successfully!");
      }
    }
  };

  const isExerciseInList = info
    ? workoutList.some((item: any) => item.id === info.id)
    : false;

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  if (!info) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <Text style={{ color: "white", fontSize: 18 }}>
          Exercise not found!
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: "#32CD32",
            borderRadius: 10,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "black", fontWeight: "bold" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <SafeAreaView />
      <View
        style={{
          paddingHorizontal: 10,
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity style={{ padding: 5 }} onPress={() => router.back()}>
          <AntDesign name="left-circle" size={40} color="#32CD32" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              textAlign: "center",
              backgroundColor: "#32CD32",
              padding: 10,
              borderRadius: 50,
              marginVertical: 10,
              textTransform: "capitalize",
              color: "black",
            }}
            numberOfLines={2}
          >
            {info.name}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleAddExercises}
          style={{
            padding: 5,
            opacity: isExerciseInList ? 0.5 : 1,
          }}
          disabled={isExerciseInList}
        >
          <MaterialIcons
            name={isExerciseInList ? "check-circle" : "add-circle-outline"}
            size={40}
            color={isExerciseInList ? "#4CAF50" : "#32CD32"}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          height: 380,
          overflow: "hidden",
          borderRadius: 40,
          marginHorizontal: 10,
        }}
      >
        <Image
          source={
            info.gif_url ||
            "https://placehold.co/380x380/32CD32/000?text=" +
              encodeURIComponent(info.name)
          }
          style={{ height: 380, width: "100%" }}
          contentFit="cover"
          autoplay={true}
        />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 15, marginTop: 20 }}>
        <View style={{ gap: 15, marginBottom: 100 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#32CD32",
              textAlign: "center",
              textTransform: "capitalize",
            }}
          >
            {info.name}
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "center",
            }}
          >
            {info.category && (
              <View
                style={{
                  backgroundColor: "#2a2a2a",
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: "#fff" }}>
                  Category:{" "}
                  <Text style={{ color: "#32CD32", fontWeight: "600" }}>
                    {info.category}
                  </Text>
                </Text>
              </View>
            )}
            {info.difficulty && (
              <View
                style={{
                  backgroundColor: "#2a2a2a",
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: "#fff" }}>
                  Difficulty:{" "}
                  <Text style={{ color: "#32CD32", fontWeight: "600" }}>
                    {info.difficulty}
                  </Text>
                </Text>
              </View>
            )}
            {info.target && (
              <View
                style={{
                  backgroundColor: "#2a2a2a",
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: "#fff" }}>
                  Target:{" "}
                  <Text style={{ color: "#32CD32", fontWeight: "600" }}>
                    {info.target}
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {info.equipment && (
            <View
              style={{
                backgroundColor: "#1a1a1a",
                padding: 15,
                borderRadius: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#32CD32",
                  marginBottom: 8,
                }}
              >
                Equipment Needed
              </Text>
              <Text style={{ fontSize: 16, color: "white" }}>
                {info.equipment}
              </Text>
            </View>
          )}

          {info.description && (
            <View
              style={{
                backgroundColor: "#1a1a1a",
                padding: 15,
                borderRadius: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#32CD32",
                  marginBottom: 8,
                }}
              >
                Description
              </Text>
              <Text style={{ fontSize: 16, color: "white", lineHeight: 24 }}>
                {info.description}
              </Text>
            </View>
          )}

          {info.instructions && Array.isArray(info.instructions) && (
            <View
              style={{
                backgroundColor: "#1a1a1a",
                padding: 15,
                borderRadius: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#32CD32",
                  marginBottom: 12,
                }}
              >
                Instructions
              </Text>
              {info.instructions.map((instruction, index) => (
                <View
                  key={index}
                  style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#32CD32",
                      fontWeight: "bold",
                      minWidth: 20,
                    }}
                  >
                    {index + 1}.
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: "white",
                      flex: 1,
                      lineHeight: 24,
                    }}
                  >
                    {instruction}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ExercisesDetails;
