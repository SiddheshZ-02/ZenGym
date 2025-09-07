import { View, Text } from "react-native";
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface exercisesListType {
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

interface ContextType {
  exercisesList: exercisesListType[];
  setExercisesList: React.Dispatch<React.SetStateAction<exercisesListType[]>>;
}

const MyContext = createContext<ContextType | undefined>(undefined);

const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [exercisesList, setExercisesList] = useState<exercisesListType[]>([]);

  useEffect(() => {
    const loadSavedWorkouts = async () => {
      try {
        const savedWorkouts = await AsyncStorage.getItem("WorkoutList");
        if (savedWorkouts) {
          setExercisesList(JSON.parse(savedWorkouts));
        }
      } catch (error) {
        console.error("Error loading saved workouts:", error);
      }
    };
    loadSavedWorkouts();
  }, []);


  useEffect(() => {
    const saveWorkouts = async () => {
      try {
        await AsyncStorage.setItem("WorkoutList", JSON.stringify(exercisesList));
      } catch (error) {
        console.error("Error saving workouts:", error);
      }
    };
    saveWorkouts();
  }, [exercisesList]);

  return (
    <MyContext.Provider value={{ exercisesList, setExercisesList }}>
      {children}
    </MyContext.Provider>
  );
};

export default ContextProvider;
export const useAppContext = () => {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within a ContextProvider");
  }
  return context;
};
