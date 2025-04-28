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
} from "lucide-react";

export type AppId =
  | "todo"
  | "kanban"
  | "pomodoro"
  | "notepad"
  | "ambient"
  | "youtube"
  | "settings";
export type SettingsTab = "about" | "general" | "wallpaper" | "appearance";

export interface AppMenuItem {
  id: AppId;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
  shortcutKey: string;
}

const createIcon = (Icon: LucideIcon) => <Icon className="h-6 w-6" />;

export const APP_ITEMS: AppMenuItem[] = [
  {
    id: "todo",
    label: "Tasks",
    icon: createIcon(ListTodo),
    shortcut: "⌘T",
    shortcutKey: "T",
  },
  {
    id: "kanban",
    label: "Kanban",
    icon: createIcon(Kanban),
    shortcut: "⌘K",
    shortcutKey: "K",
  },
  {
    id: "pomodoro",
    label: "Focus Timer",
    icon: createIcon(Timer),
    shortcut: "⌘F",
    shortcutKey: "F",
  },
  {
    id: "notepad",
    label: "Notes",
    icon: createIcon(FileText),
    shortcut: "⌘N",
    shortcutKey: "N",
  },
  {
    id: "ambient",
    label: "Ambient Sounds",
    icon: createIcon(Music),
    shortcut: "⌘A",
    shortcutKey: "A",
  },
  {
    id: "youtube",
    label: "YouTube Player",
    icon: createIcon(Youtube),
    shortcut: "⌘Y",
    shortcutKey: "Y",
  },
];

export const SETTINGS_APP: AppMenuItem = {
  id: "settings",
  label: "Settings",
  icon: createIcon(Settings),
  shortcut: "⌘,",
  shortcutKey: ",",
};
