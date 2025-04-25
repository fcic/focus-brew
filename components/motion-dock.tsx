"use client"

import { CheckSquare, Clock, FileText, Music, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface DockProps {
  openApp: (appId: string) => void
  activeApps: string[]
}

const MotionButton = motion(Button)

export function MotionDock({ openApp, activeApps }: DockProps) {
  const apps = [
    { id: "todo", name: "Tasks", icon: <CheckSquare className="h-6 w-6" /> },
    { id: "pomodoro", name: "Focus Timer", icon: <Clock className="h-6 w-6" /> },
    { id: "notepad", name: "Notes", icon: <FileText className="h-6 w-6" /> },
    { id: "ambient", name: "Ambient", icon: <Music className="h-6 w-6" /> },
    { id: "settings", name: "Settings", icon: <Settings className="h-6 w-6" /> },
  ]

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center justify-center"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.div
        className="bg-background/60 backdrop-blur-xl border border-border/30 rounded-2xl p-2 flex items-center space-x-1 shadow-lg"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <TooltipProvider>
          {apps.map((app, index) => {
            const isActive = activeApps.includes(app.id)
            return (
              <Tooltip key={app.id}>
                <TooltipTrigger asChild>
                  <MotionButton
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-xl hover:bg-muted/70 transition-all duration-200 hover:scale-105 relative",
                      isActive && "bg-muted/50",
                    )}
                    onClick={() => openApp(app.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {app.icon}
                    {isActive && (
                      <motion.span
                        className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
                        layoutId={`indicator-${app.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      ></motion.span>
                    )}
                    <span className="sr-only">{app.name}</span>
                  </MotionButton>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-background/80 backdrop-blur-md border-border/30">
                  <p>{app.name}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </motion.div>
    </motion.div>
  )
}
