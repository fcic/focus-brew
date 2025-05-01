import { type NotificationSettings } from "@/components/settings/notification-settings";

const LOCAL_STORAGE_KEY = "focusbrew_notification_settings";

export const getNotificationSettings = (): NotificationSettings => {
  if (typeof window === "undefined") {
    return {
      enabled: false,
      habitReminders: true,
      pomodoroNotifications: true,
    };
  }

  const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
  return savedSettings
    ? JSON.parse(savedSettings)
    : {
        enabled: false,
        habitReminders: true,
        pomodoroNotifications: true,
      };
};

// Check if browser supports notifications
export const isBrowserNotificationSupported = (): boolean => {
  return typeof window !== "undefined" && "Notification" in window;
};

export const sendNotification = async (
  title: string,
  options?: NotificationOptions
) => {
  const settings = getNotificationSettings();

  if (!settings.enabled || !isBrowserNotificationSupported()) return;

  try {
    // Check if we have permission
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
    }

    // Create and show the notification
    const notification = new Notification(title, {
      icon: "/icon.png",
      badge: "/icon.png",
      ...options,
    });

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto close after 10 seconds
    setTimeout(() => notification.close(), 10000);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export const sendHabitReminder = async (
  habitName: string,
  frequency: string
) => {
  const settings = getNotificationSettings();
  if (
    !settings.enabled ||
    !settings.habitReminders ||
    !isBrowserNotificationSupported()
  )
    return;

  await sendNotification(`Time to complete: ${habitName}`, {
    body: `Don't forget to complete your ${frequency.toLowerCase()} habit.`,
    tag: `habit-${habitName}`,
  });
};

export const sendPomodoroNotification = async (
  type: "work" | "break" | "longBreak",
  duration: number
) => {
  const settings = getNotificationSettings();
  if (
    !settings.enabled ||
    !settings.pomodoroNotifications ||
    !isBrowserNotificationSupported()
  )
    return;

  const messages = {
    work: {
      title: "Pomodoro Complete!",
      body: `Great work! Time for a ${duration} minute break.`,
    },
    break: {
      title: "Break Complete!",
      body: "Time to get back to work!",
    },
    longBreak: {
      title: "Long Break Complete!",
      body: "Ready to start a new pomodoro session?",
    },
  };

  const { title, body } = messages[type];
  await sendNotification(title, {
    body,
    tag: "pomodoro",
  });
};
