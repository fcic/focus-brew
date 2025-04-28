"use client";

import { type AppWindow as AppWindowType } from "@/types/window";
import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from "react";
import { AnimatePresence } from "framer-motion";
import { Desktop } from "@/components/desktop";
import { AppWindow } from "@/components/app-window";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { type SettingsTab } from "@/lib/constants";
import { Bootloader } from "@/components/boot/Bootloader";
import { stopAllAmbientSounds } from "@/components/apps/ambient-sounds";

// Lazy load components
const TodoApp = lazy(() =>
  import("@/components/apps/todo-app").then((mod) => ({ default: mod.TodoApp }))
);
const PomodoroTimer = lazy(() =>
  import("@/components/apps/pomodoro-timer").then((mod) => ({
    default: mod.PomodoroTimer,
  }))
);
const Settings = lazy(() =>
  import("@/components/settings").then((mod) => ({ default: mod.Settings }))
);
const Dock = lazy(() =>
  import("@/components/dock").then((mod) => ({ default: mod.Dock }))
);
const MenuBar = lazy(() =>
  import("@/components/menu-bar").then((mod) => ({ default: mod.MenuBar }))
);
const AmbientSounds = lazy(() =>
  import("@/components/apps/ambient-sounds").then((mod) => ({
    default: mod.AmbientSounds,
  }))
);
const Notepad = lazy(() =>
  import("@/components/apps/notepad").then((mod) => ({ default: mod.Notepad }))
);
const KanbanBoard = lazy(() => import("@/components/apps/kanban/KanbanBoard"));
const YouTubePlayer = lazy(() =>
  import("@/components/apps/youtube-player").then((mod) => ({
    default: mod.YouTubePlayer,
  }))
);
const HabitTracker = lazy(() =>
  import("@/components/apps/habit-tracker").then((mod) => ({
    default: mod.HabitTracker,
  }))
);

// Simplified loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-full opacity-70">
    Loading...
  </div>
);

const DEFAULT_WINDOW_SIZES = {
  default: { width: 700, height: 500 },
  kanban: { width: 1000, height: 600 },
  youtube: { width: 580, height: 800 },
  ambient: { width: 850, height: 750 },
  pomodoro: { width: 700, height: 500 },
  notepad: { width: 800, height: 650 },
  habit: { width: 900, height: 800 },
  settings: { width: 850, height: 650 },
} as const;

const APP_TITLES = {
  todo: "Tasks",
  kanban: "Kanban",
  pomodoro: "Focus Timer",
  notepad: "Notes",
  ambient: "Ambient Sounds",
  youtube: "YouTube Player",
  settings: "Settings",
  habit: "Habit Tracker",
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
        // Stop ambient sounds if closing the ambient sounds app
        if (appId === "ambient") {
          stopAllAmbientSounds();
        }

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
    "/wallpapers/default.webp"
  );
  const [font, setFont] = useLocalStorage("font", "font-satoshi");
  const [theme, setTheme] = useLocalStorage("theme", "dark");
  const [isBooting, setIsBooting] = useState(true);

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
          return (
            <Suspense fallback={<LoadingFallback />}>
              <TodoApp />
            </Suspense>
          );
        case "kanban":
          return (
            <Suspense fallback={<LoadingFallback />}>
              <KanbanBoard />
            </Suspense>
          );
        case "pomodoro":
          return (
            <Suspense fallback={<LoadingFallback />}>
              <PomodoroTimer />
            </Suspense>
          );
        case "notepad":
          return (
            <Suspense fallback={<LoadingFallback />}>
              <Notepad />
            </Suspense>
          );
        case "ambient":
          return (
            <Suspense fallback={<LoadingFallback />}>
              <AmbientSounds />
            </Suspense>
          );
        case "youtube":
          return (
            <Suspense fallback={<LoadingFallback />}>
              <YouTubePlayer />
            </Suspense>
          );
        case "habit":
          return (
            <Suspense fallback={<LoadingFallback />}>
              <HabitTracker />
            </Suspense>
          );
        case "settings":
          return (
            <Suspense fallback={<LoadingFallback />}>
              <Settings
                wallpaper={wallpaper}
                setWallpaper={setWallpaper}
                font={font}
                setFont={setFont}
                theme={theme}
                setTheme={setTheme}
              />
            </Suspense>
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
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("open-settings-tab", { detail: tab })
        );
      }, 100);
    },
    [openApp]
  );

  // Render desktop content
  const desktopContent = (
    <div
      className={`${font} h-screen overflow-hidden`}
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Desktop>
        <AnimatePresence>{windowElements}</AnimatePresence>
      </Desktop>
      <Suspense fallback={null}>
        <MenuBar
          openApp={handleOpenApp}
          openSettingsTab={handleOpenSettingsTab}
        />
      </Suspense>
      <Suspense fallback={null}>
        <Dock
          openApp={handleOpenApp}
          openSettings={handleOpenSettings}
          activeApps={windows.map((w) => w.id)}
        />
      </Suspense>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {isBooting ? (
        <Bootloader
          key="bootloader"
          onComplete={() => setIsBooting(false)}
          minimumDisplayTime={2500}
        />
      ) : (
        desktopContent
      )}
    </AnimatePresence>
  );
}
