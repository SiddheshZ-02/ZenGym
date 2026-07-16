import { Platform } from "react-native";

type NotificationsModule = typeof import("expo-notifications");

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (!notificationsModulePromise) {
    notificationsModulePromise = import("expo-notifications")
      .then((Notifications) => {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        return Notifications;
      })
      .catch((error) => {
        console.warn("expo-notifications is unavailable in this runtime:", error);
        return null;
      });
  }

  return notificationsModulePromise;
}

const dayNameToWeekday: Record<string, number> = {
  Sunday: 1,
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
  Friday: 6,
  Saturday: 7,
};

export async function requestNotificationPermissions() {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Workout Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#32CD32",
    });
  }

  return true;
}

export async function scheduleDayReminder(
  dayOfWeek: string,
  hour: number,
  minute: number,
) {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return null;

  const weekday = dayNameToWeekday[dayOfWeek];
  if (!weekday) return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Workout Reminder",
        body: `Time for your ${dayOfWeek} workout!`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday,
        hour,
        minute,
        repeats: true,
      },
    });

    return id;
  } catch (error) {
    console.warn("Failed to schedule reminder notification:", error);
    return null;
  }
}

export async function cancelReminder(notificationId: string) {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.warn("Failed to cancel reminder notification:", error);
  }
}
