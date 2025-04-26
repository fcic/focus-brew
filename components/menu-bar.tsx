"use client";

import { useState, useEffect } from "react";
import { Coffee } from "lucide-react";
import { Weather } from "@/components/weather";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface MenuBarProps {
  openApp: (appId: string) => void;
}

export function MenuBar({ openApp }: MenuBarProps) {
  const [time, setTime] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Add a helper to open settings in a specific tab
  const openSettingsTab = (tab: string) => {
    // Use a custom event to communicate tab to Settings
    openApp("settings");
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("open-settings-tab", { detail: tab })
      );
    }, 50);
  };

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 h-7 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-b border-zinc-200/30 dark:border-zinc-800/30 flex items-center justify-between px-4 z-50"
    >
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-5 px-2 text-xs">
              <Coffee className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel className="hidden" />
          
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Apps</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem key="todo" onClick={() => openApp("todo")}>Tasks</DropdownMenuItem>
                <DropdownMenuItem key="kanban" onClick={() => openApp("kanban")}>Kanban</DropdownMenuItem>
                <DropdownMenuItem key="pomodoro" onClick={() => openApp("pomodoro")}>Focus Timer</DropdownMenuItem>
                <DropdownMenuItem key="notepad" onClick={() => openApp("notepad")}>Notes</DropdownMenuItem>
                <DropdownMenuItem key="ambient" onClick={() => openApp("ambient")}>Ambient Sounds</DropdownMenuItem>
                <DropdownMenuItem key="youtube" onClick={() => openApp("youtube")}>YouTube Player</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openApp("settings")}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => openSettingsTab("about")}>About</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center space-x-3">
        <Weather />
        <span className="text-xs">{time}</span>
      </div>
    </motion.div>
  );
}
