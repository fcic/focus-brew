import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  ListTodo,
  Kanban,
  Timer,
  FileText,
  Music,
  Youtube,
  Settings,
  CalendarCheck,
  Download,
} from "lucide-react";
import { formatShortcut } from "./utils";

export type AppId =
  | "todo"
  | "kanban"
  | "pomodoro"
  | "habit"
  | "notepad"
  | "ambient"
  | "youtube"
  | "settings"
  | "pwa";
export type SettingsTab = "about" | "general" | "wallpaper" | "appearance";

export interface AppMenuItem {
  id: AppId;
  label: string;
  icon: React.ReactNode;
  shortcutKey: string;
  /**
   * The shortcut text to display, will be generated dynamically
   * for cross-platform compatibility
   */
  getShortcutText?: () => string;
}

const createIcon = (Icon: LucideIcon) => <Icon className="h-6 w-6" />;

export const APP_ITEMS: AppMenuItem[] = [
  {
    id: "todo",
    label: "Tasks",
    icon: createIcon(ListTodo),
    shortcutKey: "1",
    getShortcutText: () => formatShortcut("1"),
  },
  {
    id: "kanban",
    label: "Kanban",
    icon: createIcon(Kanban),
    shortcutKey: "2",
    getShortcutText: () => formatShortcut("2"),
  },
  {
    id: "habit",
    label: "Habit Tracker",
    icon: createIcon(CalendarCheck),
    shortcutKey: "3",
    getShortcutText: () => formatShortcut("3"),
  },
  {
    id: "pomodoro",
    label: "Focus Timer",
    icon: createIcon(Timer),
    shortcutKey: "4",
    getShortcutText: () => formatShortcut("4"),
  },
  {
    id: "notepad",
    label: "Notes",
    icon: createIcon(FileText),
    shortcutKey: "5",
    getShortcutText: () => formatShortcut("5"),
  },
  {
    id: "ambient",
    label: "Ambient Sounds",
    icon: createIcon(Music),
    shortcutKey: "6",
    getShortcutText: () => formatShortcut("6"),
  },
  {
    id: "youtube",
    label: "YouTube Player",
    icon: createIcon(Youtube),
    shortcutKey: "7",
    getShortcutText: () => formatShortcut("7"),
  },
  {
    id: "pwa",
    label: "Install App (PWA)",
    icon: createIcon(Download),
    shortcutKey: "8",
    getShortcutText: () => formatShortcut("8"),
  },
];

export const SETTINGS_APP: AppMenuItem = {
  id: "settings",
  label: "Settings",
  icon: createIcon(Settings),
  shortcutKey: "0",
  getShortcutText: () => formatShortcut("0"),
};
