"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type NotificationSettings = {
  enabled: boolean;
  habitReminders: boolean;
  pomodoroNotifications: boolean;
};

const LOCAL_STORAGE_KEY = "focusbrew_notification_settings";

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    habitReminders: true,
    pomodoroNotifications: true,
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setSettings((prev) => ({ ...prev, enabled: true }));
        toast.success("Notifications enabled!", {
          description:
            "You will now receive notifications for your habits and pomodoro sessions.",
        });
      } else {
        toast.error("Permission denied", {
          description:
            "Please enable notifications in your browser settings to receive reminders.",
        });
      }
    } catch (error) {
      toast.error("Error enabling notifications", {
        description:
          "There was an error while requesting notification permissions.",
      });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure how you want to receive notifications and reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Allow FocusBrew to send you notifications
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleNotifications}
            className="space-x-2"
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
                Get reminded when it&apos;s time to complete your habits
              </p>
            </div>
            <Switch
              checked={settings.enabled && settings.habitReminders}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, habitReminders: checked }))
              }
              disabled={!settings.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Pomodoro Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when your pomodoro sessions end
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
              disabled={!settings.enabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
