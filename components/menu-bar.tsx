"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Coffee, Info } from "lucide-react";
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
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { ExchangeRate } from "@/components/exchange-rate";
import { cn } from "@/lib/utils";
import { AppId, SettingsTab, APP_ITEMS, SETTINGS_APP } from "@/lib/constants";

interface MenuBarProps {
  openApp: (appId: AppId) => void;
  openSettingsTab: (tab: SettingsTab) => void;
  className?: string;
}

export function MenuBar({ openApp, openSettingsTab, className }: MenuBarProps) {
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
          openApp(SETTINGS_APP.id);
          return;
        }

        // Handle app shortcuts
        const appItem = APP_ITEMS.find(
          (item) => item.shortcutKey === e.key.toUpperCase()
        );
        if (appItem) {
          e.preventDefault();
          openApp(appItem.id);
        }
      }
    },
    [openApp]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  return (
    <motion.div
      className={cn(
        "fixed top-0 left-0 right-0 h-7 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl",
        "border-b border-zinc-200/30 dark:border-zinc-800/30 flex items-center justify-between px-4",
        className
      )}
      style={{
        zIndex: 9999,
        position: "fixed",
        isolation: "isolate",
      }}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-xs hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
              aria-label="Open menu"
            >
              <Coffee className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56"
            sideOffset={4}
            style={{ zIndex: 10000 }}
          >
            <DropdownMenuLabel>Applications</DropdownMenuLabel>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span className="flex items-center">Apps</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent style={{ zIndex: 10000 }}>
                {APP_ITEMS.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => openApp(item.id)}
                    className="flex items-center"
                  >
                    <div className="h-4 w-4 mr-2">{item.icon}</div>
                    {item.label}
                    <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openApp(SETTINGS_APP.id)}
                  className="flex items-center"
                >
                  <div className="h-4 w-4 mr-2">{SETTINGS_APP.icon}</div>
                  {SETTINGS_APP.label}
                  <DropdownMenuShortcut>
                    {SETTINGS_APP.shortcut}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => openSettingsTab("about")}
              className="flex items-center"
            >
              <Info className="h-4 w-4 mr-2" />
              About
              <DropdownMenuShortcut>⌘?</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center space-x-3">
        <ExchangeRate />
        <Weather />
        <span className="text-xs font-medium">{dateTime}</span>
      </div>
    </motion.div>
  );
}
