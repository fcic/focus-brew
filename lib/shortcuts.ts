import { formatShortcut } from "./utils";

/**
 * Keyboard shortcuts for applications
 *
 * We gather all shortcuts here to facilitate maintenance
 * and avoid conflicts with browser and operating system shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  // Shortcuts to open applications
  OPEN_APPS: {
    TODO: formatShortcut("1"), // Ctrl/Cmd + 1
    KANBAN: formatShortcut("2"), // Ctrl/Cmd + 2
    HABIT: formatShortcut("3"), // Ctrl/Cmd + 3
    POMODORO: formatShortcut("4"), // Ctrl/Cmd + 4
    NOTEPAD: formatShortcut("5"), // Ctrl/Cmd + 5
    AMBIENT: formatShortcut("6"), // Ctrl/Cmd + 6
    YOUTUBE: formatShortcut("7"), // Ctrl/Cmd + 7
    SETTINGS: formatShortcut("0"), // Ctrl/Cmd + 0
    ABOUT: formatShortcut("8"), // Ctrl/Cmd + 8
  },

  // Shortcuts for the Notepad application
  NOTEPAD: {
    SEARCH: formatShortcut("L"), // Ctrl/Cmd + L (changed from F to avoid conflict)
    SAVE: formatShortcut("S"), // Ctrl/Cmd + S
    NEW_NOTE: formatShortcut("B"), // Ctrl/Cmd + B (changed from N to avoid conflict)
    UNDO: formatShortcut("Z"), // Ctrl/Cmd + Z
    REDO: formatShortcut("Shift+Z"), // Ctrl/Cmd + Shift + Z
  },

  // Shortcuts for the Pomodoro application
  POMODORO: {
    START_PAUSE: "Space", // Space
    RESET: formatShortcut("R"), // Ctrl/Cmd + R
  },

  // Shortcuts for the YouTube Player application
  YOUTUBE: {
    PLAY_PAUSE: "Space", // Space
    SEEK_BACK: "←", // Left Arrow
    SEEK_FORWARD: "→", // Right Arrow
    PREV: "Alt+←", // Alt + Left Arrow
    NEXT: "Alt+→", // Alt + Right Arrow
    MUTE: "M", // M
    TOGGLE_VIDEO: "V", // V
  },

  // Shortcuts for the Ambient Sounds application
  AMBIENT: {
    TOGGLE_SOUND: "Space", // Space
    SET_VOLUME: "1-9", // Keys 1-9
    CHANGE_TAB: "Alt+1-5", // Alt + Keys 1-5
  },

  // General
  GENERAL: {
    CLOSE_WINDOW: formatShortcut("W"), // Ctrl/Cmd + W
  },
};
