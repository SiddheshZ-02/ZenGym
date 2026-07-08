import { supabase } from "@/services/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthError, Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Lazy import to avoid require cycle
const getDataStore = () => require("./dataStore").useDataStore;

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  initializeAuth: () => () => void;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      loading: false,
      error: null,
      initialized: false,

      initializeAuth: () => {
        supabase.auth
          .getSession()
          .then(({ data: { session } }) => {
            set({ session, user: session?.user ?? null, initialized: true });
            if (session?.user) {
              getDataStore().getState().fetchWorkoutList();
            }
          })
          .catch((error) => {
            console.error("Auth initialization error:", error);
            set({ initialized: true });
          });

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user ?? null, initialized: true });
          if (session?.user) {
            getDataStore().getState().fetchWorkoutList();
          } else {
            getDataStore().setState({ workoutList: [] });
          }
        });

        return () => subscription.unsubscribe();
      },

      signUp: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: "zengym://auth-callback" },
          });
          if (error) set({ error: error.message });
          return { error };
        } finally {
          set({ loading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) set({ error: error.message });
          return { error };
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error("Sign out error:", error);
            set({ error: error.message });
          }
          set({ session: null, user: null });
        } catch (error) {
          console.error("Sign out error:", error);
        } finally {
          set({ loading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ session: state.session, user: state.user }),
    },
  ),
);
