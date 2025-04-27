"use client";

import { type AppWindow as AppWindowType } from "@/types/window";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Desktop } from "@/components/desktop";
import { AppWindow } from "@/components/app-window";
import { TodoApp } from "@/components/todo-app";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { Settings } from "@/components/settings";
import { Dock } from "@/components/dock";
import { MenuBar } from "@/components/menu-bar";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AmbientSounds } from "@/components/ambient-sounds";
import { Notepad } from "@/components/notepad";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { YouTubePlayer } from "@/components/youtube-player";
import { type SettingsTab } from "@/lib/constants";
import { toast } from "@/components/ui/use-toast";

const DEFAULT_WINDOW_SIZES = {
  default: { width: 700, height: 500 },
  kanban: { width: 1000, height: 600 },
  youtube: { width: 580, height: 800 },
  ambient: { width: 850, height: 800 },
  pomodoro: { width: 700, height: 800 },
  notepad: { width: 800, height: 650 },
} as const;

const APP_TITLES = {
  todo: "Tasks",
  kanban: "Kanban",
  pomodoro: "Focus Timer",
  notepad: "Notes",
  ambient: "Ambient Sounds",
  youtube: "YouTube Player",
  settings: "Settings",
} as const;

type AppId = keyof typeof APP_TITLES;

interface WindowState extends Omit<AppWindowType, "id"> {
  id: AppId;
}

function useWindowManager() {
  const [windows, setWindows] = useLocalStorage<WindowState[]>("windows", []);
  const windowsRef = useRef<WindowState[]>(windows);

  // Keep ref updated
  useEffect(() => {
    windowsRef.current = windows;
  }, [windows]);

  const resetAllWindows = useCallback(() => {
    setWindows([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("windows");
    }
  }, [setWindows]);

  const openApp = useCallback(
    (appId: AppId | string) => {
      const validAppId = appId as AppId;
      const currentWindows = windowsRef.current;

      if (!currentWindows.some((w) => w.id === validAppId)) {
        const zIndex = currentWindows.length;
        const defaultSize =
          DEFAULT_WINDOW_SIZES[
            validAppId as keyof typeof DEFAULT_WINDOW_SIZES
          ] || DEFAULT_WINDOW_SIZES.default;

        setWindows((prev) => [
          ...prev,
          {
            id: validAppId,
            position: { x: 50 + zIndex * 20, y: 50 + zIndex * 20 },
            size: defaultSize,
          },
        ]);
      } else {
        bringToFront(validAppId);
      }
    },
    [setWindows]
  );

  const closeApp = useCallback(
    (appId: AppId) => {
      try {
        setWindows((prev) => prev.filter((w) => w.id !== appId));
      } catch (error) {
        console.error("Error closing app:", error);
      }
    },
    [setWindows]
  );

  const bringToFront = useCallback(
    (appId: AppId) => {
      setWindows((prev) => {
        const appWindow = prev.find((w) => w.id === appId);
        if (!appWindow) return prev;

        const windowsWithoutApp = prev.filter((w) => w.id !== appId);
        return [...windowsWithoutApp, appWindow];
      });
    },
    [setWindows]
  );

  const updateWindow = useCallback(
    (
      appId: AppId,
      position: { x: number; y: number },
      size: { width: number; height: number }
    ) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === appId ? { ...w, position, size } : w))
      );
    },
    [setWindows]
  );

  return {
    windows,
    openApp,
    closeApp,
    bringToFront,
    updateWindow,
    resetAllWindows,
  };
}

export default function Home() {
  const [wallpaper, setWallpaper] = useLocalStorage(
    "wallpaper",
    "/wallpapers/default.jpg"
  );
  const [font, setFont] = useLocalStorage("font", "font-satoshi");
  const [theme, setTheme] = useLocalStorage("theme", "dark");

  const {
    windows,
    openApp,
    closeApp,
    bringToFront,
    updateWindow,
    resetAllWindows,
  } = useWindowManager();

  // Memoize app content for better performance
  const getAppContent = useCallback(
    (appId: AppId) => {
      switch (appId) {
        case "todo":
          return <TodoApp />;
        case "kanban":
          return <KanbanBoard />;
        case "pomodoro":
          return <PomodoroTimer />;
        case "notepad":
          return <Notepad />;
        case "ambient":
          return <AmbientSounds />;
        case "youtube":
          return <YouTubePlayer />;
        case "settings":
          return (
            <Settings
              wallpaper={wallpaper}
              setWallpaper={setWallpaper}
              font={font}
              setFont={setFont}
              theme={theme}
              setTheme={setTheme}
            />
          );
        default:
          return null;
      }
    },
    [wallpaper, setWallpaper, font, setFont, theme, setTheme]
  );

  // Create optimized window update handlers
  const createUpdateHandler = useCallback(
    (winId: AppId) =>
      (
        pos: { x: number; y: number },
        sz: { width: number; height: number }
      ) => {
        updateWindow(winId, pos, sz);
      },
    [updateWindow]
  );

  // Create optimized close handlers
  const createCloseHandler = useCallback(
    (winId: AppId) => () => {
      closeApp(winId);
    },
    [closeApp]
  );

  // Create optimized focus handlers
  const createFocusHandler = useCallback(
    (winId: AppId) => () => {
      bringToFront(winId);
    },
    [bringToFront]
  );

  // Memoize window elements for better performance
  const windowElements = useMemo(
    () =>
      windows.map((win, i) => (
        <AppWindow
          key={win.id}
          id={win.id}
          title={APP_TITLES[win.id]}
          onClose={createCloseHandler(win.id)}
          onFocus={createFocusHandler(win.id)}
          zIndex={i}
          position={win.position}
          size={win.size}
          onUpdate={createUpdateHandler(win.id)}
        >
          {getAppContent(win.id)}
        </AppWindow>
      )),
    [
      windows,
      getAppContent,
      createCloseHandler,
      createFocusHandler,
      createUpdateHandler,
    ]
  );

  const handleOpenSettings = useCallback(() => {
    openApp("settings");
  }, [openApp]);

  const handleOpenApp = useCallback(
    (appId: AppId) => {
      openApp(appId);
    },
    [openApp]
  );

  const handleOpenSettingsTab = useCallback(
    (tab: SettingsTab) => {
      openApp("settings");
    },
    [openApp]
  );

  return (
    <main
      className={`h-screen w-screen overflow-hidden relative ${font}`}
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <MenuBar
        openApp={handleOpenApp}
        openSettingsTab={handleOpenSettingsTab}
      />

      <Desktop>
        <AnimatePresence mode="popLayout">{windowElements}</AnimatePresence>
      </Desktop>

      <Dock
        openApp={handleOpenApp}
        openSettings={handleOpenSettings}
        activeApps={windows.map((w) => w.id)}
      />
    </main>
  );
}
