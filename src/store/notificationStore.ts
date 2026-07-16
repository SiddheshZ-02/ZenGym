import {
  cancelReminder,
  requestNotificationPermissions,
  scheduleDayReminder,
} from "@/services/ReminderServices";
import { supabase } from "@/services/supabaseClient";
import { Alert } from "react-native";
import { create } from "zustand";

const getAuthStore = () => require("./authStore").useAuthStore;

export interface WorkoutReminderType {
  id: number;
  user_id: string;
  day_of_week: string;
  reminder_time: string;
  is_enabled: boolean;
  notification_id: string | null;
  created_at?: string;
}

interface NotificationState {
  reminders: WorkoutReminderType[];
  loading: boolean;
  error: string | null;
  fetchReminders: () => Promise<void>;
  toggleDayReminder: (
    dayOfWeek: string,
    hour: number,
    minute: number,
  ) => Promise<boolean>;
  disableDayReminder: (dayOfWeek: string) => Promise<void>;
  clearReminders: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  reminders: [],
  loading: false,
  error: null,

  fetchReminders: async () => {
    const user = getAuthStore().getState().user;
    if (!user) {
      set({ reminders: [], loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("workout_reminders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ reminders: (data ?? []) as WorkoutReminderType[], loading: false });
    } catch (error: any) {
      console.error("Error fetching reminders:", error);
      set({ error: error.message ?? "Failed to load reminders", loading: false });
    }
  },

  toggleDayReminder: async (dayOfWeek: string, hour: number, minute: number) => {
    const user = getAuthStore().getState().user;
    if (!user) return false;

    const granted = await requestNotificationPermissions();
    if (!granted) {
      Alert.alert(
        "Permission Needed",
        "Please enable notifications in your settings to get workout reminders.",
      );
      return false;
    }

    const existing = get().reminders.find((r) => r.day_of_week === dayOfWeek);
    if (existing?.notification_id) {
      await cancelReminder(existing.notification_id);
    }

    const notificationId = await scheduleDayReminder(dayOfWeek, hour, minute);
    if (!notificationId) {
      Alert.alert(
        "Unable to Schedule",
        "We could not create the reminder notification. Please try again.",
      );
      return false;
    }

    const reminder_time = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:00`;

    const { data: existingRows, error: fetchError } = await supabase
      .from("workout_reminders")
      .select("id")
      .eq("user_id", user.id)
      .eq("day_of_week", dayOfWeek)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Error checking existing reminder:", fetchError);
      Alert.alert(
        "Save Failed",
        "We scheduled the notification, but could not check your saved reminder.",
      );
      return false;
    }

    const reminderPayload = {
      user_id: user.id,
      day_of_week: dayOfWeek,
      reminder_time,
      is_enabled: true,
      notification_id: notificationId,
    };

    const existingReminder = existingRows?.[0];
    const { error } = existingReminder?.id
      ? await supabase
          .from("workout_reminders")
          .update(reminderPayload)
          .eq("id", existingReminder.id)
      : await supabase.from("workout_reminders").insert(reminderPayload);

    if (error) {
      console.error("Error saving reminder:", error);
      Alert.alert(
        "Save Failed",
        "We scheduled the notification, but could not save it to your account.",
      );
      return false;
    }

    await get().fetchReminders();
    return true;
  },

  disableDayReminder: async (dayOfWeek: string) => {
    const user = getAuthStore().getState().user;
    if (!user) return;

    const existing = get().reminders.find((r) => r.day_of_week === dayOfWeek);
    if (existing?.notification_id) {
      await cancelReminder(existing.notification_id);
    }

    const { error } = await supabase
      .from("workout_reminders")
      .update({ is_enabled: false, notification_id: null })
      .eq("user_id", user.id)
      .eq("day_of_week", dayOfWeek);

    if (error) {
      console.error("Error disabling reminder:", error);
      Alert.alert(
        "Update Failed",
        "We could not turn off this reminder right now.",
      );
      return;
    }

    await get().fetchReminders();
  },

  clearReminders: () =>
    set({ reminders: [], loading: false, error: null }),
}));
