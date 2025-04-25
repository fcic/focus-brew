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

export default function Home() {
  const [activeApps, setActiveApps] = useState<string[]>([]);
  const [wallpaper, setWallpaper] = useLocalStorage(
    "wallpaper",
    "/wallpapers/default.jpg"
  );
  const [font, setFont] = useLocalStorage("font", "roboto-slab");
  const [theme, setTheme] = useLocalStorage("theme", "light");

  const openApp = (appId: string) => {
    if (!activeApps.includes(appId)) {
      setActiveApps([...activeApps, appId]);
    } else {
      // If app is already open, bring it to front
      bringToFront(appId);
    }
  };

  const closeApp = (appId: string) => {
    setActiveApps(activeApps.filter((id) => id !== appId));
  };

  const bringToFront = (appId: string) => {
    setActiveApps([...activeApps.filter((id) => id !== appId), appId]);
  };

  const getAppTitle = (appId: string) => {
    switch (appId) {
      case "todo":
        return "Tasks";
      case "pomodoro":
        return "Focus Timer";
      case "notepad":
        return "Notes";
      case "ambient":
        return "Ambient";
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
          {activeApps.map((appId) => (
            <AppWindow
              key={appId}
              id={appId}
              title={getAppTitle(appId)}
              onClose={() => closeApp(appId)}
              onFocus={() => bringToFront(appId)}
              zIndex={activeApps.indexOf(appId)}
            >
              {appId === "todo" && <TodoApp />}
              {appId === "pomodoro" && <PomodoroTimer />}
              {appId === "notepad" && <Notepad />}
              {appId === "ambient" && <AmbientSounds />}
              {appId === "settings" && (
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

      <Dock openApp={openApp} activeApps={activeApps} />
    </main>
  );
}
