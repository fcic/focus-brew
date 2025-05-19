"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  isBrowserNotificationSupported,
  getNotificationSettings,
  saveNotificationSettings,
  NotificationSettings as NotificationSettingsType,
  sendNotification,
  checkNotificationPermission,
  resetNotificationSettings,
  sendPomodoroNotification,
} from "@/lib/notification";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsType>({
    enabled: true,
    habitReminders: true,
    pomodoroNotifications: true,
  });
  const [notificationsSupported, setNotificationsSupported] = useState(true);
  const [loading, setLoading] = useState(false);

  // Check if the browser supports notifications
  useEffect(() => {
    setNotificationsSupported(isBrowserNotificationSupported());
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = getNotificationSettings();

    // If the saved settings have notifications disabled, but this is the first load,
    // we'll reset to the default enabled state
    if (
      !savedSettings.enabled &&
      !localStorage.getItem("notification_settings_initialized")
    ) {
      localStorage.setItem("notification_settings_initialized", "true");
      resetNotificationSettings();
      setSettings({
        enabled: true,
        habitReminders: true,
        pomodoroNotifications: true,
      });
    } else {
      setSettings(savedSettings);
    }

    // Automatically request permission if notifications are enabled by default
    // but we don't have permission yet
    const checkAndRequestPermission = async () => {
      if (savedSettings.enabled && isBrowserNotificationSupported()) {
        await checkNotificationPermission();
      }
    };

    checkAndRequestPermission();
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    saveNotificationSettings(settings);
  }, [settings]);

  const requestNotificationPermission = async () => {
    setLoading(true);

    if (!notificationsSupported) {
      toast.error("Notifications not supported", {
        description: "Your browser does not support notifications.",
      });
      setLoading(false);
      return;
    }

    try {
      const permission = await checkNotificationPermission();

      if (permission) {
        setSettings((prev) => ({ ...prev, enabled: true }));
        toast.success("Notifications enabled", {
          description: "You will receive notifications when needed.",
        });
      } else {
        toast.error("Permission denied", {
          description:
            "You denied permission for notifications. Please enable them in your browser settings.",
        });
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast.error("Error enabling notifications", {
        description:
          "An error occurred while requesting permission for notifications.",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async () => {
    if (!settings.enabled) {
      await requestNotificationPermission();
    } else {
      setSettings((prev) => ({ ...prev, enabled: false }));
      toast.info("Notifications disabled", {
        description: "You will no longer receive notifications.",
      });
    }
  };

  const testBrowserNotification = async () => {
    if (!settings.enabled) {
      toast.error("Notifications are disabled", {
        description: "Enable notifications first.",
      });
      return;
    }

    setLoading(true);
    try {
      const sent = await sendNotification("Notification Test", {
        body: "This is a test notification from FocusBrew.",
        requireInteraction: false,
      });

      if (sent) {
        toast.success("Notification sent", {
          description: "The notification was sent successfully.",
        });
      } else {
        toast.error("Failed to send notification", {
          description: "Check browser permissions.",
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Error sending notification", {
        description: "An error occurred while sending the notification.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = () => {
    resetNotificationSettings();
    const defaultSettings = getNotificationSettings();
    setSettings(defaultSettings);
    toast.success("Notification settings reset", {
      description: "Notification settings have been reset to defaults.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure how you want to receive notifications and reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!notificationsSupported && (
          <Alert className="border bg-yellow-500/20">
            <AlertDescription>
              Your browser does not support notifications. Some features may not
              work properly.
            </AlertDescription>
          </Alert>
        )}

        {notificationsSupported && Notification.permission === "denied" && (
          <Alert className="border bg-red-500/20">
            <AlertDescription>
              Notification permission is denied. You need to change this in your
              browser settings to enable notifications.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Allow FocusBrew to send notifications to you
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleNotifications}
            className="space-x-2"
            disabled={
              !notificationsSupported ||
              loading ||
              Notification.permission === "denied"
            }
          >
            {settings.enabled ? (
              <>
                <Bell className="h-4 w-4" />
                <span>Enabled</span>
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4" />
                <span>Disabled</span>
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Habit Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive reminders when it's time to complete your habits
              </p>
            </div>
            <Switch
              checked={settings.enabled && settings.habitReminders}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, habitReminders: checked }))
              }
              disabled={!settings.enabled || !notificationsSupported || loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Pomodoro Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive visual notifications when your pomodoro sessions end
                (alarm sound is controlled separately)
              </p>
            </div>
            <Switch
              checked={settings.enabled && settings.pomodoroNotifications}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  pomodoroNotifications: checked,
                }))
              }
              disabled={!settings.enabled || !notificationsSupported || loading}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetSettings}>
          Reset to Defaults
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={testBrowserNotification}
            disabled={!settings.enabled || !notificationsSupported || loading}
          >
            Test General Notification
          </Button>
          <Button
            onClick={() => {
              sendPomodoroNotification("work", 5)
                .then(() => {
                  toast.success("Pomodoro test notification sent", {
                    description:
                      "Check if you received a pomodoro notification",
                  });
                })
                .catch((error) => {
                  console.error(
                    "Error sending test pomodoro notification:",
                    error
                  );
                  toast.error("Error sending test notification", {
                    description: "Failed to send pomodoro test notification",
                  });
                });
            }}
            disabled={
              !settings.enabled ||
              !settings.pomodoroNotifications ||
              !notificationsSupported ||
              loading
            }
          >
            Test Pomodoro Notification
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
