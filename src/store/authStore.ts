import { supabase } from "@/services/supabaseClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { AuthError, Session, User } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
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
const getNotificationStore = () => require("./notificationStore").useNotificationStore;

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
  deleteAccount: () => Promise<{ error: string | null }>;
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
                getNotificationStore().getState().fetchReminders();
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
              getNotificationStore().getState().fetchReminders();
            } catch (e) {
              console.error("Error in auth state change:", e);
            }
          } else {
            try {
              getDataStore().setState({ workoutList: [] });
              getProfileStore().getState().clearProfile();
              getNotificationStore().getState().clearReminders();
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
                queryParams: {
                  prompt: "select_account", // This forces the account picker on web
                },
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
            // Clear any existing sign-in to force account picker
            try {
              await GoogleSignin.signOut();
            } catch (e) {
              // Ignore errors if no user was signed in
            }
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
          // Sign out of Google first if we're on native
          if (Platform.OS !== "web") {
            try {
              // Try to sign out of Google, ignore any errors
              await GoogleSignin.signOut();
            } catch (googleErr) {
              console.error("Google sign out error (ignoring):", googleErr);
            }
          }

          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error("Sign out error:", error);
            set({ error: error.message });
          }
          set({ session: null, user: null });
          getProfileStore().getState().clearProfile();
          getNotificationStore().getState().clearReminders();
        } catch (error) {
          console.error("Sign out error:", error);
        } finally {
          set({ loading: false });
        }
      },

      deleteAccount: async () => {
        const user = get().user;
        if (!user) {
          return { error: "You must be logged in to delete your account" };
        }
        set({ loading: true, error: null });
        try {
          // Delete user workouts
          await supabase.from("user_workouts").delete().eq("user_id", user.id);

          // Delete user profile
          await supabase.from("profiles").delete().eq("user_id", user.id);

          // Delete all files in user's storage folder
          try {
            const { data: files } = await supabase.storage
              .from("avatars")
              .list(user.id);

            if (files && files.length > 0) {
              const filePaths = files.map((file) => `${user.id}/${file.name}`);
              await supabase.storage.from("avatars").remove(filePaths);
            }
          } catch (storageError) {
            console.error("Storage deletion error:", storageError);
            // Continue even if storage deletion fails
          }

          // Sign out the user
          await get().signOut();

          return { error: null };
        } catch (error: any) {
          console.error("Delete account error:", error);
          return { error: error.message || "Failed to delete account" };
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
