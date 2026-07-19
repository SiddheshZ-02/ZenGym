import {
  cancelReminder,
  requestNotificationPermissions,
  scheduleDayReminder,
} from "@/services/ReminderServices";
import { supabase } from "@/services/supabaseClient";
import { Alert, Linking } from "react-native";
import { create } from "zustand";

const getAuthStore = () => require("./authStore").useAuthStore;

export interface WorkoutReminderSetting {
  id: number;
  user_id: string;
  is_enabled: boolean;
  reminder_time: string | null; // "18:00:00"
  notification_ids: Record<string, string>; // { Monday: "abc-id", Wednesday: "def-id" }
}

interface NotificationState {
  setting: WorkoutReminderSetting | null;
  loading: boolean;
  error: string | null;
  fetchReminderSetting: () => Promise<void>;
  enableReminder: (
    hour: number,
    minute: number,
    activeDays: string[],
  ) => Promise<boolean>;
  disableReminder: () => Promise<void>;
  syncReminderDays: (activeDays: string[]) => Promise<void>;
  clearReminderSetting: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  setting: null,
  loading: false,
  error: null,

  fetchReminderSetting: async () => {
    const user = getAuthStore().getState().user;
    if (!user) {
      set({ setting: null, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("workout_reminder_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      set({
        setting: data
          ? { ...data, notification_ids: data.notification_ids || {} }
          : null,
        loading: false,
      });
    } catch (error: any) {
      console.error("Error fetching reminder setting:", error);
      set({
        error: error.message ?? "Failed to load reminder",
        loading: false,
      });
    }
  },

  enableReminder: async (
    hour: number,
    minute: number,
    activeDays: string[],
  ) => {
    const user = getAuthStore().getState().user;
    if (!user) return false;
    if (activeDays.length === 0) return false;

    const permissionStatus = await requestNotificationPermissions();
    if (permissionStatus === "denied") {
      Alert.alert(
        "Permission Needed",
        "Notifications are disabled. Please enable them in Settings to receive workout reminders.",
        [
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ],
      );
      return false;
    }

    // cancel any previously scheduled notifications first
    const existing = get().setting;
    if (existing?.notification_ids) {
      await Promise.all(
        Object.values(existing.notification_ids).map((id) =>
          cancelReminder(id),
        ),
      );
    }

    // schedule one notification per active day
    const notification_ids: Record<string, string> = {};
    for (const day of activeDays) {
      const id = await scheduleDayReminder(day, hour, minute);
      if (id) notification_ids[day] = id;
    }

    if (Object.keys(notification_ids).length === 0) {
      Alert.alert("Unable to Schedule", "We could not create your reminders.");
      return false;
    }

    const reminder_time = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:00`;

    const payload = {
      user_id: user.id,
      is_enabled: true,
      reminder_time,
      notification_ids,
    };

    const { error } = await supabase
      .from("workout_reminder_settings")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      console.error("Error saving reminder setting:", error);
      Alert.alert("Save Failed", "We scheduled it, but couldn't save it.");
      return false;
    }

    await get().fetchReminderSetting();
    return true;
  },

  disableReminder: async () => {
    const user = getAuthStore().getState().user;
    if (!user) return;

    const existing = get().setting;
    if (existing?.notification_ids) {
      await Promise.all(
        Object.values(existing.notification_ids).map((id) =>
          cancelReminder(id),
        ),
      );
    }

    const { error } = await supabase
      .from("workout_reminder_settings")
      .update({ is_enabled: false, notification_ids: {} })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error disabling reminder:", error);
      Alert.alert("Update Failed", "We could not turn off your reminder.");
      return;
    }

    await get().fetchReminderSetting();
  },

  // Call this whenever workoutList's set of active days changes,
  // so a currently-enabled reminder stays in sync (e.g. user adds/removes a day)
  syncReminderDays: async (activeDays: string[]) => {
    const existing = get().setting;
    if (!existing?.is_enabled || !existing.reminder_time) return;

    const currentDays = Object.keys(existing.notification_ids || {});
    const sameSet =
      currentDays.length === activeDays.length &&
      currentDays.every((d) => activeDays.includes(d));
    if (sameSet) return; // nothing changed

    if (activeDays.length === 0) {
      // no workout days left at all -> turn off
      await get().disableReminder();
      return;
    }

    const [hourStr, minuteStr] = existing.reminder_time.split(":");
    await get().enableReminder(
      parseInt(hourStr, 10),
      parseInt(minuteStr, 10),
      activeDays,
    );
  },

  clearReminderSetting: () =>
    set({ setting: null, loading: false, error: null }),
}));
