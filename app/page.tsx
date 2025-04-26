"use client";

import { useState } from "react";
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
import YouTubePlayer from "@/components/youtube-player";

export default function Home() {
  // Persist windows state: [{ id, position, size }]
  const [windows, setWindows] = useLocalStorage(
    "windows",
    [] as {
      id: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
    }[]
  );
  const [wallpaper, setWallpaper] = useLocalStorage(
    "wallpaper",
    "/wallpapers/default.jpg"
  );
  const [font, setFont] = useLocalStorage("font", "font-satoshi");
  const [theme, setTheme] = useLocalStorage("theme", "dark");

  // Open app (add to windows if not present)
  const openApp = (appId: string) => {
    if (!windows.some((w) => w.id === appId)) {
      // Default positions and sizes (match AppWindow logic)
      const zIndex = windows.length;
      let defaultWidth = 700;
      let defaultHeight = 450;
      if (appId === "kanban") defaultWidth = 1000;
      if (appId === "youtube") {
        defaultWidth = 480;
        defaultHeight = 600;
      }
      if (appId === "ambient") {
        defaultWidth = 800;
        defaultHeight = 6700;
      }
      setWindows([
        ...windows,
        {
          id: appId,
          position: { x: 50 + zIndex * 20, y: 50 + zIndex * 20 },
          size: { width: defaultWidth, height: defaultHeight },
        },
      ]);
    } else {
      bringToFront(appId);
    }
  };

  // Close app (remove from windows)
  const closeApp = (appId: string) => {
    setWindows(windows.filter((w) => w.id !== appId));
  };

  // Bring app to front (move to end of array)
  const bringToFront = (appId: string) => {
    setWindows([
      ...windows.filter((w) => w.id !== appId),
      windows.find((w) => w.id === appId)!,
    ]);
  };

  // Update window position/size
  const updateWindow = (
    appId: string,
    position: { x: number; y: number },
    size: { width: number; height: number }
  ) => {
    setWindows(
      windows.map((w) =>
        w.id === appId ? { ...w, position, size } : w
      )
    );
  };

  const getAppTitle = (appId: string) => {
    switch (appId) {
      case "todo":
        return "Tasks";
      case "kanban":
        return "Kanban";
      case "pomodoro":
        return "Focus Timer";
      case "notepad":
        return "Notes";
      case "ambient":
        return "Ambient Sounds";
      case "youtube":
        return "YouTube Player";
      case "settings":
        return "Settings";
      default:
        return "App";
    }
  };

  return (
    <main
      className={`h-screen w-screen overflow-hidden relative ${font}`}
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <MenuBar openApp={openApp} />

      <Desktop>
        <AnimatePresence>
          {windows.map((win, i) => (
            <AppWindow
              key={win.id}
              id={win.id}
              title={getAppTitle(win.id)}
              onClose={() => closeApp(win.id)}
              onFocus={() => bringToFront(win.id)}
              zIndex={i}
              position={win.position}
              size={win.size}
              onUpdate={(pos, sz) => updateWindow(win.id, pos, sz)}
            >
              {win.id === "todo" && <TodoApp />}
              {win.id === "kanban" && <KanbanBoard />}
              {win.id === "pomodoro" && <PomodoroTimer />}
              {win.id === "notepad" && <Notepad />}
              {win.id === "ambient" && <AmbientSounds />}
              {win.id === "youtube" && <YouTubePlayer />}
              {win.id === "settings" && (
                <Settings
                  wallpaper={wallpaper}
                  setWallpaper={setWallpaper}
                  font={font}
                  setFont={setFont}
                  theme={theme}
                  setTheme={setTheme}
                />
              )}
            </AppWindow>
          ))}
        </AnimatePresence>
      </Desktop>

      <Dock openApp={openApp} activeApps={windows.map((w) => w.id)} />
    </main>
  );
}
