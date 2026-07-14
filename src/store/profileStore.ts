import { supabase } from "@/services/supabaseClient";
import { Alert } from "react-native";
import { create } from "zustand";

const getAuthStore = () => require("./authStore").useAuthStore;

export interface Profile {
  id: number;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  created_at?: string;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateUsername: (username: string) => Promise<{ error: string | null }>;
  uploadAvatar: (uri: string) => Promise<{ error: string | null }>;
  clearProfile: () => void;
}

const AVATAR_BUCKET = "avatars";

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  uploading: false,
  error: null,

  fetchProfile: async () => {
    const user = getAuthStore().getState().user;
    if (!user) {
      set({ profile: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, username, avatar_url, created_at")
        .eq("user_id", user.id)
        .single(); // Profile is guaranteed to exist by Supabase trigger

      if (error) throw error;
      set({ profile: data, loading: false });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      set({ error: error.message, loading: false });
      Alert.alert("Network Error", "Failed to load profile. Please check your internet connection.");
    }
  },

  updateUsername: async (username: string) => {
    const user = getAuthStore().getState().user;
    const trimmed = username.trim();
    if (!user || !trimmed) {
      return { error: "Username cannot be empty" };
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ username: trimmed })
        .eq("user_id", user.id)
        .select("id, user_id, username, avatar_url, created_at")
        .single();

      if (error) throw error;
      set({ profile: data, loading: false });
      return { error: null };
    } catch (error: any) {
      console.error("Error updating username:", error);
      set({ error: error.message, loading: false });
      Alert.alert("Network Error", "Failed to update username. Please check your internet connection.");
      return { error: error.message };
    }
  },

  uploadAvatar: async (uri: string) => {
    const user = getAuthStore().getState().user;
    if (!user) {
      return { error: "You must be logged in to update your avatar" };
    }

    set({ uploading: true, error: null });
    try {
      const filePath = `${user.id}/avatar.jpg`;
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(filePath, arrayBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        if (uploadError.message?.includes("Bucket not found")) {
          throw new Error(
            'Storage bucket "avatars" not found. Create it in Supabase Dashboard → Storage.',
          );
        }
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id)
        .select("id, user_id, username, avatar_url, created_at")
        .single();

      if (updateError) throw updateError;
      set({ profile: data, uploading: false });
      return { error: null };
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      set({ error: error.message, uploading: false });
      Alert.alert("Network Error", "Failed to upload avatar. Please check your internet connection.");
      return { error: error.message };
    }
  },

  clearProfile: () =>
    set({ profile: null, loading: false, uploading: false, error: null }),
}));
