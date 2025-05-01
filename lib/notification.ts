export interface NotificationSettings {
  enabled: boolean;
  habitReminders: boolean;
  pomodoroNotifications: boolean;
}

// Add this function to get notification settings from localStorage
export const getNotificationSettings = (): NotificationSettings => {
  if (typeof window === "undefined") {
    return {
      enabled: false,
      habitReminders: false,
      pomodoroNotifications: false,
    };
  }

  try {
    const savedSettings = localStorage.getItem("notification_settings");
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error("Failed to parse notification settings:", error);
  }

  // Default settings if nothing is saved
  return {
    enabled: false,
    habitReminders: true,
    pomodoroNotifications: true,
  };
};

// Add this function to save notification settings
export const saveNotificationSettings = (
  settings: NotificationSettings
): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("notification_settings", JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save notification settings:", error);
  }
};

export const isBrowserNotificationSupported = (): boolean => {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
};

export const sendNotification = async (
  title: string,
  options?: NotificationOptions
) => {
  const settings = getNotificationSettings();

  if (!settings.enabled || !isBrowserNotificationSupported()) return;

  try {
    // Check if we already have permission
    if (Notification.permission === "granted") {
      // Create and show the notification
      showNotification(title, options);
    }
    // If permission status is not determined yet
    else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        showNotification(title, options);
      }
    }
    // If permission is denied, we don't do anything
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

// Helper function to show the notification
const showNotification = (title: string, options?: NotificationOptions) => {
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

  const frequencyText = frequency.toLowerCase();
  const body = `Don't forget to complete your ${frequencyText} habit.`;

  await sendNotification(`Time to complete: ${habitName}`, {
    body,
    tag: `habit-${habitName}`,
    data: { type: "habit", habitName, frequency },
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
    data: { type: "pomodoro", pomodoroType: type, duration },
    requireInteraction: type === "work", // Make work notifications require interaction
  });
};

export const checkNotificationPermission = async (): Promise<boolean> => {
  if (!isBrowserNotificationSupported()) return false;

  if (Notification.permission === "granted") return true;

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};
