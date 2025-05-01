import { formatShortcut } from "./utils";

/**
 * Atalhos de teclado para os aplicativos
 *
 * Concentramos aqui todos os atalhos para facilitar a manutenção
 * e evitar conflitos com atalhos de navegador e sistema operacional
 */
export const KEYBOARD_SHORTCUTS = {
  // Atalhos para abrir aplicativos
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

  // Atalhos dentro do aplicativo Notepad
  NOTEPAD: {
    SEARCH: formatShortcut("L"), // Ctrl/Cmd + L (alterado de F para evitar conflito)
    SAVE: formatShortcut("S"), // Ctrl/Cmd + S
    NEW_NOTE: formatShortcut("B"), // Ctrl/Cmd + B (alterado de N para evitar conflito)
    UNDO: formatShortcut("Z"), // Ctrl/Cmd + Z
    REDO: formatShortcut("Shift+Z"), // Ctrl/Cmd + Shift + Z
  },

  // Atalhos dentro do aplicativo Pomodoro
  POMODORO: {
    START_PAUSE: "Space", // Espaço
    RESET: formatShortcut("R"), // Ctrl/Cmd + R
  },

  // Atalhos dentro do aplicativo YouTube Player
  YOUTUBE: {
    PLAY_PAUSE: "Space", // Espaço
    SEEK_BACK: "←", // Seta Esquerda
    SEEK_FORWARD: "→", // Seta Direita
    PREV: "Alt+←", // Alt + Seta Esquerda
    NEXT: "Alt+→", // Alt + Seta Direita
    MUTE: "M", // M
    TOGGLE_VIDEO: "V", // V
  },

  // Atalhos dentro do aplicativo Ambient Sounds
  AMBIENT: {
    TOGGLE_SOUND: "Space", // Espaço
    SET_VOLUME: "1-9", // Teclas 1-9
    CHANGE_TAB: "Alt+1-5", // Alt + Teclas 1-5
  },

  // Geral
  GENERAL: {
    CLOSE_WINDOW: formatShortcut("W"), // Ctrl/Cmd + W
  },
};
