"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface PomodoroTimerProps {}

export function PomodoroTimer({}: PomodoroTimerProps) {
  const [mode, setMode] = useState("pomodoro");
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [volume, setVolume] = useState(50);
  const [initialTime, setInitialTime] = useState(25 * 60);

  // Timer durations in minutes
  const durations = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      // Play notification sound
      const audio = new Audio("/sounds/notification.mp3");
      audio.volume = volume / 100;
      audio.play();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, volume]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(initialTime);
  };

  const changeMode = (newMode: string) => {
    setIsActive(false);
    setMode(newMode);
    const newTime = durations[newMode as keyof typeof durations] * 60;
    setTime(newTime);
    setInitialTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress = ((initialTime - time) / initialTime) * 100;

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-8 p-6">
      <Tabs
        defaultValue="pomodoro"
        className="w-full"
        onValueChange={changeMode}
      >
        <TabsList className="grid grid-cols-3 bg-zinc-100/30 dark:bg-zinc-800/30 backdrop-blur-sm">
          <TabsTrigger
            value="pomodoro"
            className="data-[state=active]:bg-white/70 dark:data-[state=active]:bg-zinc-700/70"
          >
            Focus
          </TabsTrigger>
          <TabsTrigger
            value="shortBreak"
            className="data-[state=active]:bg-white/70 dark:data-[state=active]:bg-zinc-700/70"
          >
            Short Break
          </TabsTrigger>
          <TabsTrigger
            value="longBreak"
            className="data-[state=active]:bg-white/70 dark:data-[state=active]:bg-zinc-700/70"
          >
            Long Break
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="w-full max-w-xs">
        <Progress
          value={progress}
          className="h-1.5 bg-zinc-200/30 dark:bg-zinc-700/30"
        />
      </div>

      <motion.div
        className="text-7xl font-light tracking-tighter"
        key={time}
        initial={{ opacity: 0.8, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {formatTime(time)}
      </motion.div>

      <div className="flex space-x-4">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="lg"
            onClick={toggleTimer}
            className="w-24 rounded-full bg-white/50 dark:bg-zinc-800/50 border-zinc-300/30 dark:border-zinc-700/30 backdrop-blur-sm"
          >
            {isActive ? (
              <Pause className="h-5 w-5 mr-2" />
            ) : (
              <Play className="h-5 w-5 mr-2" />
            )}
            {isActive ? "Pause" : "Start"}
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetTimer}
            className="rounded-full"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      <div className="w-full max-w-xs space-y-2">
        <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Volume</span>
          <span>{volume}%</span>
        </div>
        <Slider
          value={[volume]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => setVolume(value[0])}
          className="bg-zinc-200/30 dark:bg-zinc-700/30"
        />
      </div>
    </div>
  );
}
