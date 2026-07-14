import { supabase } from "@/services/supabaseClient";
import { Alert } from "react-native";
import { create } from "zustand";

// Lazy import to avoid require cycle
const getAuthStore = () => require("./authStore").useAuthStore;

export interface BodyPartType {
  id: number;
  name: string;
  image_url?: string;
  // For backwards compatibility with local images
  image?: any;
}

export interface ExerciseType {
  id: number;
  name: string;
  gif_url?: string;
  gifUrl?: any;
  category?: string;
  difficulty?: string;
  equipment?: string;
  description?: string;
  target?: string;
  instructions?: string[];
  body_part?: string;
  bodyPart?: string;
  secondary_muscles?: string[];
  secondaryMuscles?: any;
}

export interface WorkoutExerciseType {
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
}

interface DataState {
  bodyParts: BodyPartType[];
  exercises: ExerciseType[];
  workoutList: WorkoutExerciseType[];
  loading: boolean;
  workoutLoading: boolean;
  error: string | null;
  fetchBodyParts: () => Promise<void>;
  fetchExercises: (bodyPart?: string) => Promise<void>;
  fetchExerciseById: (id: number) => Promise<ExerciseType | null>;
  fetchWorkoutList: () => Promise<void>;
  addExerciseToWorkout: (exercise: ExerciseType) => Promise<void>;
  removeExerciseFromWorkout: (exerciseId: number) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  bodyParts: [],
  exercises: [],
  workoutList: [],
  loading: false,
  workoutLoading: false,
  error: null,

  fetchBodyParts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("body_parts")
        .select("*")
        .order("name");

      if (error) throw error;
      set({ bodyParts: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error fetching body parts:", error);
      Alert.alert(
        "Network Error",
        "Failed to load data. Please check your internet connection.",
      );
    }
  },

  fetchExercises: async (bodyPartName?: string) => {
    set({ loading: true, error: null });
    try {
      let query = supabase.from("exercises").select("*");

      if (bodyPartName) {
        query = query.eq("body_part", bodyPartName);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      set({ exercises: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error fetching exercises:", error);
      Alert.alert(
        "Network Error",
        "Failed to load exercises. Please check your internet connection.",
      );
    }
  },

  fetchExerciseById: async (id: number) => {
    // First check if we already have it in state
    const existingExercise = get().exercises.find((e) => e.id === id);
    if (existingExercise) return existingExercise;

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      set({ loading: false });
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error("Error fetching exercise:", error);
      Alert.alert(
        "Network Error",
        "Failed to load exercise details. Please check your internet connection.",
      );
      return null;
    }
  },

  fetchWorkoutList: async () => {
    const user = getAuthStore().getState().user;
    if (!user) {
      set({ workoutList: [] });
      return;
    }

    set({ workoutLoading: true });
    try {
      const { data, error } = await supabase
        .from("user_workouts")
        .select(
          `
          exercise_id,
          exercises!inner (
            id,
            name,
            gif_url,
            category,
            difficulty,
            equipment,
            description,
            target,
            instructions,
            body_part
          )
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedData = data.map((item: any) => ({
        id: item.exercises.id,
        name: item.exercises.name,
        gifUrl: item.exercises.gif_url,
        category: item.exercises.category || "",
        difficulty: item.exercises.difficulty || "",
        equipment: item.exercises.equipment || "",
        description: item.exercises.description || "",
        target: item.exercises.target || "",
        instructions: Array.isArray(item.exercises.instructions)
          ? item.exercises.instructions
          : [],
        bodyPart: item.exercises.body_part || "",
      }));

      set({ workoutList: mappedData, workoutLoading: false });
    } catch (error) {
      console.error("Error fetching workout list:", error);
      set({ workoutLoading: false });
      Alert.alert(
        "Network Error",
        "Failed to load your workouts. Please check your internet connection.",
      );
    }
  },

  addExerciseToWorkout: async (exercise: ExerciseType) => {
    const user = getAuthStore().getState().user;
    if (!user) return;

    try {
      const { error } = await supabase.from("user_workouts").insert({
        user_id: user.id,
        exercise_id: exercise.id,
      });

      if (error) throw error;
      await get().fetchWorkoutList();
    } catch (error) {
      console.error("Error adding exercise to workout:", error);
      Alert.alert(
        "Network Error",
        "Failed to add exercise to workout. Please check your internet connection.",
      );
    }
  },

  removeExerciseFromWorkout: async (exerciseId: number) => {
    const user = getAuthStore().getState().user;
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_workouts")
        .delete()
        .eq("user_id", user.id)
        .eq("exercise_id", exerciseId);

      if (error) throw error;
      await get().fetchWorkoutList();
    } catch (error) {
      console.error("Error removing exercise from workout:", error);
      Alert.alert(
        "Network Error",
        "Failed to remove exercise from workout. Please check your internet connection.",
      );
    }
  },
}));
