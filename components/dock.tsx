"use client";

import { CheckSquare, Clock, FileText, Music, Settings, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DockProps {
  openApp: (appId: string) => void;
  activeApps: string[];
}

export function Dock({ openApp, activeApps }: DockProps) {
  const apps = [
    { id: "todo", name: "Tasks", icon: <CheckSquare className="h-6 w-6" /> },
    { id: "kanban", name: "Kanban", icon: <Square className="h-6 w-6" /> },
    {
      id: "pomodoro",
      name: "Focus Timer",
      icon: <Clock className="h-6 w-6" />,
    },
    { id: "notepad", name: "Notes", icon: <FileText className="h-6 w-6" /> },
    { id: "ambient", name: "Ambient", icon: <Music className="h-6 w-6" /> },
    {
      id: "settings",
      name: "Settings",
      icon: <Settings className="h-6 w-6" />,
    },
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="fixed bottom-6 left-0 right-0 mx-auto flex items-center justify-center"
      style={{ width: "fit-content" }}
    >
      <motion.div
        className="bg-background/60 backdrop-blur-xl border border-border/30 rounded-2xl p-2 flex items-center space-x-1 shadow-lg"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {apps.map((app) => (
          <motion.div
            key={app.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-xl"
              onClick={() => openApp(app.id)}
            >
              {app.icon}
              <span className="sr-only">{app.name}</span>
            </Button>
            {activeApps.includes(app.id) && (
              <motion.div
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              />
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
