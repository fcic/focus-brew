"use client";

import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

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
    title: "Habit Tracker",
    description: "Track your habits and stay on top of your day.",
    icon: "🎯",
  },
  {
    title: "Weather",
    description: "Check the current weather right from your menu bar.",
    icon: "🌤️",
  },
];

export function SettingsAboutTab() {
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
          </div>
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
    </div>
  );
}
