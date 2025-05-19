"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Coffee, Info, Github, Globe } from "lucide-react";
import { Weather } from "@/components/weather";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from "@/components/ui/menubar";
import { motion } from "framer-motion";
import { ExchangeRate } from "@/components/exchange-rate";
import { cn, formatShortcut, trackEvent } from "@/lib/utils";
import { AppId, SettingsTab, APP_ITEMS, SETTINGS_APP } from "@/lib/constants";

type MenuBarProps = {
  openApp: (appId: AppId) => void;
  openSettings: () => void;
  openSettingsTab?: (tab: SettingsTab) => void;
  activeApps: AppId[];
  className?: string;
};

export function MenuBar({
  openApp,
  openSettings,
  openSettingsTab,
  activeApps,
  className,
}: MenuBarProps) {
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    const weekday = now.toLocaleDateString([], { weekday: "short" });
    const day = now.getDate();
    const month = now.toLocaleDateString([], { month: "short" });
    const hour = now.getHours();
    const minute = now.getMinutes().toString().padStart(2, "0");
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    return `${weekday} ${day} ${month} ${hour12}:${minute}${period}`;
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const weekday = now.toLocaleDateString([], { weekday: "short" });
      const day = now.getDate();
      const month = now.toLocaleDateString([], { month: "short" });
      const hour = now.getHours();
      const minute = now.getMinutes().toString().padStart(2, "0");
      const period = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;

      setDateTime(`${weekday} ${day} ${month} ${hour12}:${minute}${period}`);
    };

    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        // Handle settings shortcut
        if (e.key === SETTINGS_APP.shortcutKey) {
          e.preventDefault();
          trackEvent("app_launch", {
            app_name: SETTINGS_APP.label,
            app_id: SETTINGS_APP.id,
            source: "keyboard_shortcut",
          });
          openApp(SETTINGS_APP.id);
          return;
        }

        // Handle About shortcut
        if (e.key === "8") {
          e.preventDefault();
          trackEvent("open_settings_tab", {
            tab: "about",
            source: "keyboard_shortcut",
          });
          if (openSettingsTab) {
            openSettingsTab("about");
          } else {
            openSettings();
          }
          return;
        }

        // Handle app shortcuts
        const appItem = APP_ITEMS.find((item) => item.shortcutKey === e.key);
        if (appItem) {
          e.preventDefault();
          trackEvent("app_launch", {
            app_name: appItem.label,
            app_id: appItem.id,
            source: "keyboard_shortcut",
          });
          openApp(appItem.id);
        }
      }
    },
    [openApp, openSettings, openSettingsTab]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const openGitHub = useCallback(() => {
    trackEvent("external_link", {
      destination: "github",
      url: "https://github.com/birobirobiro/focus-brew",
    });
    window.open("https://github.com/birobirobiro/focus-brew", "_blank");
  }, []);

  return (
    <motion.div
      className={cn(
        "fixed top-0 left-0 right-0 h-7 bg-background/60 backdrop-blur-xl",
        "border-b border-border/30 flex items-center justify-between px-4",
        "z-[9999]",
        className
      )}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <div className="flex items-center space-x-2">
        <Menubar className="h-auto border-none bg-transparent p-0 shadow-none">
          <MenubarMenu>
            <MenubarTrigger className="h-5 px-2 text-xs hover:bg-accent/50 transition-colors focus:bg-accent/70">
              <div className="flex items-center">
                <Coffee className="h-4 w-4" />
              </div>
            </MenubarTrigger>
            <MenubarContent
              className="bg-popover/90 backdrop-blur-md rounded-md border border-border mt-1 p-1"
              align="start"
              sideOffset={4}
              alignOffset={-4}
            >
              {/* Tasks */}
              <MenubarItem
                className="text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm"
                onClick={() => {
                  trackEvent("app_launch", {
                    app_name: "Tasks",
                    app_id: "todo",
                    source: "menu_bar",
                  });
                  openApp("todo");
                }}
              >
                Tasks
                <MenubarShortcut>{formatShortcut("1")}</MenubarShortcut>
              </MenubarItem>

              {/* Kanban */}
              <MenubarItem
                className="text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm"
                onClick={() => {
                  trackEvent("app_launch", {
                    app_name: "Kanban",
                    app_id: "kanban",
                    source: "menu_bar",
                  });
                  openApp("kanban");
                }}
              >
                Kanban
                <MenubarShortcut>{formatShortcut("2")}</MenubarShortcut>
              </MenubarItem>

              {/* Habit Tracker */}
              <MenubarItem
                className="text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm"
                onClick={() => {
                  trackEvent("app_launch", {
                    app_name: "Habit Tracker",
                    app_id: "habit",
                    source: "menu_bar",
                  });
                  openApp("habit");
                }}
              >
                Habit Tracker
                <MenubarShortcut>{formatShortcut("3")}</MenubarShortcut>
              </MenubarItem>

              {/* Focus Timer */}
              <MenubarItem
                className="text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm"
                onClick={() => {
                  trackEvent("app_launch", {
                    app_name: "Focus Timer",
                    app_id: "pomodoro",
                    source: "menu_bar",
                  });
                  openApp("pomodoro");
                }}
              >
                Focus Timer
                <MenubarShortcut>{formatShortcut("4")}</MenubarShortcut>
              </MenubarItem>

              {/* Notes */}
              <MenubarItem
                className="text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm"
                onClick={() => {
                  trackEvent("app_launch", {
                    app_name: "Notes",
                    app_id: "notepad",
                    source: "menu_bar",
                  });
                  openApp("notepad");
                }}
              >
                Notes
                <MenubarShortcut>{formatShortcut("5")}</MenubarShortcut>
              </MenubarItem>

              {/* Ambient Sounds */}
              <MenubarItem
                className="text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm"
                onClick={() => {
                  trackEvent("app_launch", {
                    app_name: "Ambient Sounds",
                    app_id: "ambient",
                    source: "menu_bar",
                  });
                  openApp("ambient");
                }}
              >
                Ambient Sounds
                <MenubarShortcut>{formatShortcut("6")}</MenubarShortcut>
              </MenubarItem>

              {/* YouTube Player */}
              <MenubarItem
                className="text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 px-2 py-1.5 rounded-sm"
                onClick={() => {
                  trackEvent("app_launch", {
                    app_name: "YouTube Player",
                    app_id: "youtube",
                    source: "menu_bar",
                  });
                  openApp("youtube");
                }}
              >
                YouTube Player
                <MenubarShortcut>{formatShortcut("7")}</MenubarShortcut>
              </MenubarItem>

              <MenubarSeparator />

              {/* Settings */}
              <MenubarItem
                onClick={() => {
                  trackEvent("app_launch", {
                    app_name: SETTINGS_APP.label,
                    app_id: SETTINGS_APP.id,
                    source: "menu_bar",
                  });
                  openApp(SETTINGS_APP.id);
                }}
                className={cn(
                  "text-xs flex items-center justify-between gap-2 px-2 py-1.5",
                  "cursor-pointer rounded-sm",
                  "hover:bg-accent/50 focus:bg-accent focus:text-accent-foreground",
                  activeApps.includes(SETTINGS_APP.id) &&
                    "text-primary font-medium"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 text-primary/70 group-hover:text-primary overflow-hidden flex items-center justify-center">
                    <span className="scale-[0.67] transform-gpu">
                      {SETTINGS_APP.icon}
                    </span>
                  </span>
                  <span>{SETTINGS_APP.label}</span>
                </div>
                {SETTINGS_APP.getShortcutText && (
                  <MenubarShortcut>
                    {SETTINGS_APP.getShortcutText()}
                  </MenubarShortcut>
                )}
              </MenubarItem>

              <MenubarSeparator />

              {/* GitHub */}
              <MenubarItem
                onClick={openGitHub}
                className="text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 cursor-pointer px-2 py-1.5 rounded-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 text-primary/70 group-hover:text-primary">
                    <Github className="h-4 w-4" />
                  </span>
                  <span>GitHub</span>
                </div>
              </MenubarItem>

              <MenubarItem
                onClick={() =>
                  window.open("https://birobirobiro.dev/", "_blank")
                }
                className="text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 cursor-pointer px-2 py-1.5 rounded-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 text-primary/70 group-hover:text-primary">
                    <Globe className="h-4 w-4" />
                  </span>
                  <span>My Portfolio</span>
                </div>
              </MenubarItem>

              {/* About */}
              <MenubarItem
                onClick={(e) => {
                  // Prevent default behavior to control focus
                  e.preventDefault();

                  // Open settings with about tab
                  if (openSettingsTab) {
                    openSettingsTab("about");
                  } else {
                    openSettings();
                  }

                  // Clear focus from any active element
                  setTimeout(() => {
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                  }, 10);
                }}
                className="text-xs focus:bg-accent focus:text-accent-foreground hover:bg-accent/50 cursor-pointer px-2 py-1.5 rounded-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 text-primary/70 group-hover:text-primary">
                    <Info className="h-4 w-4" />
                  </span>
                  <span>About</span>
                </div>
                <MenubarShortcut>{formatShortcut("8")}</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <div className="flex items-center space-x-3">
        <ExchangeRate />
        <Weather />
        <span className="text-xs font-medium">{dateTime}</span>
      </div>
    </motion.div>
  );
}
