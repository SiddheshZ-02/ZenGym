import { supabase } from "@/services/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { AuthError, Session, User } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import { Linking, Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  scopes: [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ],
});

// Lazy import to avoid require cycle
const getDataStore = () => require("./dataStore").useDataStore;
const getProfileStore = () => require("./profileStore").useProfileStore;

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
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
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
        // Initialize auth safely
        const init = async () => {
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            set({ session, user: session?.user ?? null, initialized: true });
            if (session?.user) {
              try {
                getDataStore().getState().fetchWorkoutList();
                getProfileStore().getState().fetchProfile();
              } catch (e) {
                console.error("Error initializing data/profile:", e);
              }
            }
          } catch (error) {
            console.error("Auth initialization error:", error);
            set({ initialized: true });
          }
        };
        init();

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user ?? null, initialized: true });
          if (session?.user) {
            try {
              getDataStore().getState().fetchWorkoutList();
              getProfileStore().getState().fetchProfile();
            } catch (e) {
              console.error("Error in auth state change:", e);
            }
          } else {
            try {
              getDataStore().setState({ workoutList: [] });
              getProfileStore().getState().clearProfile();
            } catch (e) {
              console.error("Error clearing data:", e);
            }
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

      signInWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
          if (Platform.OS === "web") {
            // Web OAuth flow

            const { data, error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: "zengym://auth-callback",
                skipBrowserRedirect: true,
              },
            });

            if (error) {
              set({ error: error.message });
              return { error };
            }

            if (data?.url) {
              const result = await WebBrowser.openAuthSessionAsync(
                data.url,
                "zengym://auth-callback",
              );

              if (result.type === "success" && result.url) {
                const { error } = await supabase.auth.exchangeCodeForSession(
                  new URL(result.url).searchParams.get("code") || "",
                );
                if (error) {
                  set({ error: error.message });
                  return { error };
                }
              } else {
                return { error: { message: "Sign-in cancelled" } as AuthError };
              }
            }
          } else {
            // Native Google Sign-In
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            if (!userInfo.data?.idToken) {
              return {
                error: { message: "No ID token received" } as AuthError,
              };
            }

            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: userInfo.data.idToken,
            });

            if (error) {
              set({ error: error.message });
              return { error };
            }
          }
          return { error: null };
        } catch (err: any) {
          let errorMessage = "Something went wrong";
          if (err.code === statusCodes.SIGN_IN_CANCELLED) {
            errorMessage = "Sign-in cancelled";
          } else if (err.code === statusCodes.IN_PROGRESS) {
            errorMessage = "Sign-in in progress";
          } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            errorMessage = "Play services not available";
          } else if (err.message) {
            errorMessage = err.message;
          }
          const error = { message: errorMessage } as AuthError;
          set({ error: error.message });
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
          getProfileStore().getState().clearProfile();
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
