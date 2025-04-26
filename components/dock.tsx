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
    { id: "ambient", name: "Ambient Sounds", icon: <Music className="h-6 w-6" /> },
    { id: "youtube", name: "YouTube Player", icon: <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="5" width="20" height="14" rx="3"/><polygon points="10 9 15 12 10 15 10 9"/></svg> },
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
          <TooltipProvider key={app.id} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
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
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-background/80 backdrop-blur-md border-border/30">
                <span>{app.name}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </motion.div>
    </motion.div>
  );
}
