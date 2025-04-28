"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
// import { Github, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const features = [
  {
    title: "Ambient Sounds",
    description:
      "Mix and play relaxing background sounds for deep work or relaxation.",
    icon: "🎵",
  },
  {
    title: "Dock",
    description: "Quick access to your favorite tools.",
    icon: "🚀",
  },
  {
    title: "Exchange",
    description: "View live currency exchange rates in your menu bar.",
    icon: "💱",
  },
  {
    title: "Focus Timer",
    description: "Boost your productivity with a Pomodoro-style timer.",
    icon: "⏱️",
  },
  {
    title: "Kanban",
    description:
      "Visualize your workflow and manage projects with drag-and-drop boards.",
    icon: "📋",
  },
  {
    title: "Notes",
    description: "Jot down quick notes or ideas in a clean notepad.",
    icon: "📝",
  },
  {
    title: "Settings",
    description:
      "Personalize your experience with themes, wallpapers, and more.",
    icon: "⚙️",
  },
  {
    title: "Tasks",
    description: "Organize your todos and stay on top of your day.",
    icon: "✅",
  },
  {
    title: "Weather",
    description: "Check the current weather right from your menu bar.",
    icon: "🌤️",
  },
];

const technologies = [
  "Next.js 15",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "shadcn/ui",
  "Framer Motion",
];

export function SettingsAboutTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleResetConfirm = () => {
    // Clear all localStorage
    if (typeof window !== "undefined") {
      localStorage.clear();

      // Close all windows by forcing a page reload
      // This will reset the application state completely
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">FocusBrew</h2>
            {/* <p className="text-muted-foreground">Version 1.0.0</p> */}
          </div>
          {/* <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
          </div> */}
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Your all-in-one minimalist productivity suite, crafted for creators
          and thinkers who love a calm, focused workspace. Enjoy a beautiful
          desktop with customizable wallpapers and fonts, a distraction-free
          menu bar, and a dock for quick access to your favorite tools.
        </p>
      </motion.div>

      <Separator />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="text-2xl">{feature.icon}</div>
              <div>
                <h4 className="font-medium">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Separator />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold">Built with</h3>
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <Badge variant="secondary" className="text-sm">
                {tech}
              </Badge>
            </motion.div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Open source, privacy-friendly, and designed for macOS vibes.
        </p>
      </motion.div>

      <Separator />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold">Reset Configuration</h3>
        <p className="text-sm text-muted-foreground">
          This will reset all your settings, clear local storage, and close all
          windows. Your data will be lost and the application will return to its
          default state.
        </p>

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Reset All Configuration
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Configuration</AlertDialogTitle>
              <AlertDialogDescription>
                This action will reset all your settings to default, clear all
                saved data, and close all windows. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Reset Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );
}
