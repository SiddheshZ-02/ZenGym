import AntDesign from "@expo/vector-icons/AntDesign";
import { ImageBackground } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExerciseArray } from "@/utils/ExerciseData";
import { useAppContext } from "@/Context/ContextProvider";

interface exercisesInfo {
  id: number;
  name: string;
  gifUrl: any;
  category: string;
  difficulty: string;
  equipment: string;
  description: string;
  target: string;
  instructions: string[];
  bodyPart: string;
  secondaryMuscles?: any;
}

const { height, width } = Dimensions.get("window");

const exercisesDetails = () => {
  const [info, setInfo] = useState<exercisesInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const { exercisesDetails } = useLocalSearchParams();
  const { exercisesList, setExercisesList } = useAppContext();
 

  const exercisesFilter = () => {
    const filterexe = ExerciseArray?.find((item) => {
      return item.id === Number(exercisesDetails);
    });
    setInfo(filterexe ?? null);
  };

  const handleAddExercises = () => {
    if (info) {
      if (exercisesList.some((item: exercisesInfo) => item.id === info.id)) {
        Alert.alert(
          "Already Added",
         
        );
      } else {
        setExercisesList([...exercisesList, info]);
        Alert.alert(
          "Added to Workout List",
        );
      }
    }
  };

  const isExerciseInList = info ? exercisesList.some((item: exercisesInfo) => item.id === info.id) : false;

  useEffect(() => {
    if (exercisesDetails) {
      exercisesFilter();
    }
  }, [exercisesDetails]);

  return loading ? (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#32CD32" />
    </View>
  ) : (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <SafeAreaView />
      <View
        style={{
          paddingInline: 10,
          flexDirection: "row",
          gap: 5,
          width: width * 0.85,
        }}
      >
        <TouchableOpacity
          style={{ marginBlock: 10 }}
          onPress={() =>
            router.push({
              pathname: "/BodyPart/[name]",
              params: { name: info ? info.bodyPart : "" },
            })
          }
        >
          <AntDesign name="leftcircle" size={50} color="#32CD32" />
        </TouchableOpacity>

        <View style={{ width: width * 0.65 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: 700,
              textAlign: "center",
              backgroundColor: "#32CD32",
              padding: 10,
              borderRadius: 50,
              marginBlock: 10,
              textTransform: "capitalize",
            }}
            numberOfLines={1}
          >
            {info?.name}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleAddExercises}
          style={{ 
            marginBlock: 10,
            opacity: isExerciseInList ? 0.5 : 1,
          }}
          disabled={isExerciseInList}
        >
          <AntDesign 
            name={isExerciseInList ? "checkcircle" : "pluscircle"} 
            size={50} 
            color={isExerciseInList ? "#4CAF50" : "#32CD32"} 
          />
        </TouchableOpacity>
      </View>

    

      <View
        style={{
          height: 380,
          overflow: "hidden",
          borderRadius: 40,
        }}
      >
        <ImageBackground
          source={{uri:info?.gifUrl}}
          style={{ height: 380, width: width, position: "fixed" }}
        />
      </View>

      <ScrollView style={{ flex: 1, paddingInline: 10 }}>
        <View style={{ gap: 10, marginBottom: 80 }}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: 600,
              color: "#32CD32",
              textAlign: "center",
              textTransform: "capitalize",
            }}
          >
            {info?.name}
          </Text>

          <Text style={{ fontSize: 18, color: "white" }}>
            <Text style={{ fontSize: 20, fontWeight: 600 }}>Category: </Text>
            {info?.category}
          </Text>

          <Text style={{ fontSize: 18, color: "white" }}>
            <Text style={{ fontSize: 20, fontWeight: 600 }}>Difficulty: </Text>
            {info?.difficulty}
          </Text>

          <Text style={{ fontSize: 18, color: "white" }}>
            <Text style={{ fontSize: 20, fontWeight: 600 }}>Equipment: </Text>
            {info?.equipment}
          </Text>

          <Text style={{ fontSize: 18, color: "white" }}>
            <Text style={{ fontSize: 20, fontWeight: 600 }}>
              Description :
            </Text>
            {info?.description}
          </Text>

          <Text style={{ fontSize: 18, color: "white" }}>
            <Text style={{ fontSize: 20, fontWeight: 600 }}>Target : </Text>
            {info?.target}
          </Text>

          <Text style={{ fontSize: 18, color: "white" }}>
            <Text style={{ fontSize: 20, fontWeight: 600 }}>
              Instructions:
            </Text>
            {info?.instructions}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default exercisesDetails;
