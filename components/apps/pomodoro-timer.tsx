"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Pause,
  Play,
  RotateCcw,
  RepeatIcon,
  Volume2,
  Square,
  Timer,
} from "lucide-react";
import {
  sendPomodoroNotification,
  checkNotificationPermission,
  getNotificationSettings,
  NotificationSettings,
} from "@/lib/notification";
import { toast } from "@/lib/toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import NumberFlow, { NumberFlowGroup } from "@number-flow/react";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  volume: number;
  loopAudio: boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
  pomodoro: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
  volume: 50,
  loopAudio: false,
};

const SPRING_ANIMATION = {
  type: "spring",
  stiffness: 700,
  damping: 30,
} as const;

function Countdown({ seconds }: { seconds: number }) {
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = seconds % 60;

  return (
    <NumberFlowGroup>
      <div
        style={
          {
            fontVariantNumeric: "tabular-nums",
            "--number-flow-char-height": "0.85em",
          } as React.CSSProperties
        }
        className="flex items-baseline font-semibold text-4xl"
      >
        {hh > 0 && (
          <NumberFlow
            trend={-1}
            value={hh}
            format={{ minimumIntegerDigits: 2 }}
          />
        )}
        <NumberFlow
          prefix={hh > 0 ? ":" : ""}
          trend={-1}
          value={mm}
          digits={{ 1: { max: 5 } }}
          format={{ minimumIntegerDigits: 2 }}
        />
        <NumberFlow
          prefix=":"
          trend={-1}
          value={ss}
          digits={{ 1: { max: 5 } }}
          format={{ minimumIntegerDigits: 2 }}
        />
      </div>
    </NumberFlowGroup>
  );
}

// Add an interface for preset durations without keyboard shortcuts
interface PresetDuration {
  minutes: number;
  label: string;
}

// Define preset durations inside the PomodoroTimer component
const PRESET_DURATIONS: PresetDuration[] = [
  { minutes: 5, label: "5m" },
  { minutes: 10, label: "10m" },
  { minutes: 15, label: "15m" },
  { minutes: 20, label: "20m" },
  { minutes: 25, label: "25m" },
  { minutes: 30, label: "30m" },
];

export function PomodoroTimer() {
  // Settings state
  const [settings, setSettings] = useLocalStorage<TimerSettings>(
    "pomodoro-settings",
    DEFAULT_SETTINGS
  );

  // Timer state
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const originalTitleRef = useRef<string>(
    typeof document !== "undefined"
      ? document.title
      : "FocusBrew | Productivity Workspace"
  );

  // Custom timer state
  const [customTimerDuration, setCustomTimerDuration] = useState(25);
  const [isCustomTimerDialogOpen, setIsCustomTimerDialogOpen] = useState(false);
  const [isUsingCustomTimer, setIsUsingCustomTimer] = useState(false);

  // Add a new state to store the input value as string
  const [inputValue, setInputValue] = useState<string>(
    customTimerDuration.toString()
  );

  // Audio setup
  const alarmSound = useMemo(() => {
    if (typeof window === "undefined") return null;
    const audio = new Audio("/sounds/alarm.mp3");
    audio.volume = settings.volume / 100;
    audio.loop = settings.loopAudio;
    alarmRef.current = audio;
    return audio;
  }, [settings.loopAudio, settings.volume]);

  // Stop the alarm sound
  const stopAlarmSound = useCallback(() => {
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
      setIsAlarmPlaying(false);
    }
  }, []);

  // Check notification permission on mount
  useEffect(() => {
    // Check notification permission on mount
    const settings = getNotificationSettings();

    // Only check permission if notifications are enabled in settings
    if (settings.enabled && settings.pomodoroNotifications) {
      checkNotificationPermission()
        .then((hasPermission) => {
          setNotificationsEnabled(hasPermission);
          if (!hasPermission && Notification.permission === "default") {
            // If permission hasn't been decided yet, show a toast to encourage enabling
            toast.info("Enable notifications", {
              description:
                "Allow notifications to be alerted when your timer ends.",
            });
          }
        })
        .catch((error) => {
          console.error("Error verifying notification permission:", error);
        });
    } else {
      setNotificationsEnabled(false);
    }
  }, []);

  useEffect(() => {
    if (alarmSound) {
      alarmSound.volume = settings.volume / 100;
    }
  }, [alarmSound, settings.volume]);

  // Calculate progress percentage
  const progress = useMemo(() => {
    const total = isUsingCustomTimer
      ? customTimerDuration * 60
      : settings[mode];
    return ((total - timeLeft) / total) * 100;
  }, [timeLeft, settings, mode, isUsingCustomTimer, customTimerDuration]);

  // Format time as MM:SS
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, [timeLeft]);

  // Timer controls
  const handleStartTimer = useCallback(() => {
    stopAlarmSound();
    setIsRunning(true);
  }, [stopAlarmSound]);

  const handlePauseTimer = useCallback(() => setIsRunning(false), []);

  const handleStopTimer = useCallback(() => {
    setIsRunning(false);
    stopAlarmSound();
    if (isUsingCustomTimer) {
      setTimeLeft(customTimerDuration * 60);
    } else {
      setTimeLeft(settings[mode]);
    }
  }, [settings, mode, stopAlarmSound, isUsingCustomTimer, customTimerDuration]);

  const handleResetTimer = useCallback(() => {
    setIsRunning(false);
    stopAlarmSound();
    if (isUsingCustomTimer) {
      setTimeLeft(customTimerDuration * 60);
    } else {
      setTimeLeft(settings[mode]);
    }
  }, [settings, mode, stopAlarmSound, isUsingCustomTimer, customTimerDuration]);

  const handleSwitchMode = useCallback(
    (newMode: TimerMode) => {
      setMode(newMode);
      setIsRunning(false);
      stopAlarmSound();
      setTimeLeft(settings[newMode]);
      setIsUsingCustomTimer(false);
    },
    [settings, stopAlarmSound]
  );

  // Handle volume change
  const handleVolumeChange = useCallback(
    (value: number[]) => {
      const newVolume = value[0];
      setSettings((prev) => ({ ...prev, volume: newVolume }));
      if (alarmSound) {
        alarmSound.volume = newVolume / 100;
      }
    },
    [alarmSound, setSettings]
  );

  // Handle loop toggle
  const handleLoopToggle = useCallback(() => {
    setSettings((prev) => {
      const newLoopAudio = !prev.loopAudio;
      if (alarmSound) {
        alarmSound.loop = newLoopAudio;
      }
      return { ...prev, loopAudio: newLoopAudio };
    });
  }, [alarmSound, setSettings]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    try {
      const hasPermission = await checkNotificationPermission();
      setNotificationsEnabled(hasPermission);

      if (hasPermission) {
        toast.success("Notifications enabled", {
          description: "You will receive notifications when timer completes.",
        });
      } else {
        toast.error("Notification permission denied", {
          description:
            "Please enable notifications in your browser settings to get timer alerts.",
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  }, []);

  // Set custom timer
  const handleSetCustomTimer = useCallback(() => {
    const duration = parseInt(inputValue);
    if (isNaN(duration) || duration < 1) {
      toast.error("Invalid duration", {
        description: "Please enter a valid duration greater than 0.",
      });
      return;
    }

    // Set the custom timer duration
    const validDuration = Math.min(120, duration);
    setCustomTimerDuration(validDuration);
    setTimeLeft(validDuration * 60); // Convert to seconds
    setIsUsingCustomTimer(true);
    setIsRunning(false);
    stopAlarmSound();
    setIsCustomTimerDialogOpen(false);

    toast.success("Custom timer set", {
      description: `Timer set to ${validDuration} minutes`,
    });
  }, [inputValue, stopAlarmSound]);

  // Add a handler for preset durations
  const handlePresetDuration = useCallback(
    (minutes: number) => {
      setCustomTimerDuration(minutes);
      setTimeLeft(minutes * 60);
      setIsUsingCustomTimer(true);
      setIsRunning(false);
      stopAlarmSound();
      setIsCustomTimerDialogOpen(false);

      toast.success("Custom timer set", {
        description: `Timer set to ${minutes} minutes`,
      });
    },
    [stopAlarmSound]
  );

  // Timer effect
  useEffect(() => {
    if (!isRunning) return;

    let animationFrameId: number;
    let lastUpdateTime = Date.now();

    const updateTimer = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdateTime;

      // If more than 1 second has passed
      if (deltaTime >= 1000) {
        const secondsToSubtract = Math.floor(deltaTime / 1000);

        setTimeLeft((prevTimeLeft) => {
          const newTimeLeft = Math.max(0, prevTimeLeft - secondsToSubtract);

          if (newTimeLeft <= 0 && prevTimeLeft > 0) {
            // Timer is done
            // Play sound if enabled
            if (alarmSound) {
              alarmSound.play().catch((error) => {
                console.error("Error playing audio:", error);
              });
              setIsAlarmPlaying(true);
            }

            // Send notification without playing the notification sound
            sendPomodoroNotification(
              mode === "pomodoro" || isUsingCustomTimer
                ? "work"
                : mode === "shortBreak"
                ? "break"
                : "longBreak",
              mode === "pomodoro" || isUsingCustomTimer
                ? settings.shortBreak / 60
                : settings.pomodoro / 60
            ).catch((error) => {
              console.error("Error sending notification:", error);
            });

            // Update pomodoro count and handle next timer
            if (isUsingCustomTimer) {
              // For custom timer, reset to the last custom duration and stay in custom mode
              setCompletedPomodoros((count) => count + 1);
              setTimeout(() => {
                setTimeLeft(customTimerDuration * 60); // Instantly reset to custom duration
                setIsRunning(false); // Ensure timer is stopped
                stopAlarmSound(); // Ensure sound stops
                toast.info("Custom timer finished", {
                  description: `Ready to start again for ${customTimerDuration} minutes`,
                });
              }, 0);
              return 0; // Prevent timer from staying at zero
            } else if (mode === "pomodoro") {
              // Normal pomodoro flow
              setCompletedPomodoros((count) => count + 1);
              const nextMode =
                completedPomodoros % 4 === 3 ? "longBreak" : "shortBreak";
              handleSwitchMode(nextMode);
            } else {
              // After breaks, go back to pomodoro
              handleSwitchMode("pomodoro");
            }

            // Stop the timer but don't reset the time
            setIsRunning(false);
            return 0;
          }

          return newTimeLeft;
        });

        // Update the last update time, accounting for the exact seconds we've subtracted
        lastUpdateTime = now - (deltaTime % 1000);
      }

      if (isRunning) {
        animationFrameId = requestAnimationFrame(updateTimer);
      }
    };

    animationFrameId = requestAnimationFrame(updateTimer);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    isRunning,
    mode,
    settings,
    alarmSound,
    completedPomodoros,
    handleSwitchMode,
    isUsingCustomTimer,
    customTimerDuration,
    stopAlarmSound,
  ]);

  // Update document title with timer
  useEffect(() => {
    if (isRunning) {
      const modeLabel = isUsingCustomTimer
        ? "Custom"
        : mode === "pomodoro"
        ? "Focus"
        : mode === "shortBreak"
        ? "Short Break"
        : "Long Break";
      document.title = `${formattedTime} - ${modeLabel}`;
    } else {
      // Only reset if we're not showing the timer already
      if (
        document.title.includes(" - Focus") ||
        document.title.includes(" - Short Break") ||
        document.title.includes(" - Long Break") ||
        document.title.includes(" - Custom")
      ) {
        document.title = originalTitleRef.current;
      }
    }

    return () => {
      document.title = originalTitleRef.current;
    };
  }, [isRunning, formattedTime, mode, isUsingCustomTimer]);

  // Update the keydown handler to handle preset duration keys when dialog is open
  useEffect(() => {
    const handleDialogKeyDown = (e: KeyboardEvent) => {
      // Only handle Enter key when dialog is open, but not when typing in the input
      if (
        !isCustomTimerDialogOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Handle Enter key to set the timer when not inside an input
      if (e.key === "Enter") {
        e.preventDefault();
        handleSetCustomTimer();
      }
    };

    window.addEventListener("keydown", handleDialogKeyDown);
    return () => window.removeEventListener("keydown", handleDialogKeyDown);
  }, [isCustomTimerDialogOpen, handleSetCustomTimer]);

  // Add back the crucial notification settings handler that was accidentally removed
  // Listen for notification settings changes
  useEffect(() => {
    const handleNotificationSettingsChange = (
      e: CustomEvent<NotificationSettings>
    ) => {
      setNotificationsEnabled(e.detail.enabled);
    };

    // Register the event listener
    window.addEventListener(
      "notification_settings_changed",
      handleNotificationSettingsChange as EventListener
    );

    // Use settings without creating cyclic dependencies
    const settings = getNotificationSettings();

    // Only check permission if settings indicate notifications are enabled
    if (settings.enabled) {
      checkNotificationPermission()
        .then((hasPermission) => {
          setNotificationsEnabled(hasPermission);
        })
        .catch((error) => {
          console.error("Error checking notification permission:", error);
        });
    } else if (notificationsEnabled) {
      // Disable notifications only if they are currently enabled
      setNotificationsEnabled(false);
    }

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener(
        "notification_settings_changed",
        handleNotificationSettingsChange as EventListener
      );
    };
  }, []); // Remove notificationsEnabled as dependency to avoid unnecessary re-registration

  // Add back the keyboard shortcuts handler for general app controls, but skip when in input fields
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input, textarea, or rich text editor
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement &&
          (e.target.isContentEditable ||
            e.target.closest('[contenteditable="true"]') ||
            e.target.closest(".ProseMirror") ||
            e.target.closest(".editor-content")))
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          isRunning ? handlePauseTimer() : handleStartTimer();
          break;
        case "KeyR":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleResetTimer();
          }
          break;
        case "KeyS":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleStopTimer();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isRunning,
    handleStartTimer,
    handlePauseTimer,
    handleResetTimer,
    handleStopTimer,
  ]);

  // Update inputValue when customTimerDuration changes (except when typing)
  useEffect(() => {
    setInputValue(customTimerDuration.toString());
  }, [customTimerDuration]);

  // Improved input focus handling
  useEffect(() => {
    if (isCustomTimerDialogOpen && inputRef.current) {
      // Increased timeout to ensure dialog is fully rendered before focusing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isCustomTimerDialogOpen]);

  // Add useRef
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex flex-col items-center gap-6 p-6 h-full overflow-hidden"
      role="timer"
    >
      <ScrollArea className="w-full h-full">
        <div className="flex flex-col items-center gap-6 pb-6">
          {/* Mode selection with custom timer button */}
          <div className="flex gap-2 flex-wrap justify-center">
            {(["pomodoro", "shortBreak", "longBreak"] as const).map(
              (timerMode) => (
                <Button
                  key={timerMode}
                  variant={
                    mode === timerMode && !isUsingCustomTimer
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleSwitchMode(timerMode)}
                  className={cn(
                    "capitalize transition-colors",
                    mode === timerMode && !isUsingCustomTimer && "font-medium"
                  )}
                  aria-label={`Switch to ${timerMode
                    .replace(/([A-Z])/g, " $1")
                    .trim()} mode`}
                >
                  {timerMode.replace(/([A-Z])/g, " $1").trim()}
                </Button>
              )
            )}

            <Dialog
              open={isCustomTimerDialogOpen}
              onOpenChange={setIsCustomTimerDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant={isUsingCustomTimer ? "default" : "outline"}
                  className="min-w-[40px]"
                >
                  Custom
                </Button>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-[425px]"
                onOpenAutoFocus={(e) => {
                  // Prevent the default autofocus behavior
                  e.preventDefault();
                  // Focus our input manually
                  setTimeout(() => inputRef.current?.focus(), 100);
                }}
              >
                <DialogHeader>
                  <DialogTitle>Custom Timer</DialogTitle>
                  <DialogDescription>
                    Set a custom duration for your work session
                  </DialogDescription>
                </DialogHeader>

                {/* Quick preset buttons */}
                <div className="flex justify-center gap-2 my-4">
                  {PRESET_DURATIONS.map((preset) => (
                    <Button
                      key={preset.minutes}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetDuration(preset.minutes)}
                      className="px-3 py-2"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                {/* Custom timer duration input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSetCustomTimer();
                  }}
                  className="flex flex-col gap-2"
                >
                  <Label htmlFor="duration">Custom duration (minutes)</Label>
                  <Input
                    id="duration"
                    ref={inputRef}
                    autoFocus
                    type="number"
                    min="1"
                    max="120"
                    value={inputValue}
                    onChange={(e) => {
                      // Allow empty field or any number
                      setInputValue(e.target.value);
                    }}
                    // Validate only when focus leaves the field
                    onBlur={() => {
                      const num = parseInt(inputValue);
                      if (isNaN(num) || num < 1) {
                        setCustomTimerDuration(1);
                        setInputValue("1");
                      } else {
                        setCustomTimerDuration(Math.min(120, num));
                        setInputValue(Math.min(120, num).toString());
                      }
                    }}
                    placeholder="Minutes"
                  />
                  <Button type="submit" className="w-full mt-4">
                    Set Timer
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Timer display */}
          <div
            className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-border"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="absolute inset-1 rounded-full bg-primary/20"
              style={{
                scaleX: progress / 100,
                scaleY: progress / 100,
                transformOrigin: "center",
              }}
              animate={{ scale: progress / 100 }}
              transition={SPRING_ANIMATION}
            />
            <Countdown seconds={timeLeft} />
          </div>

          {/* Timer controls */}
          <div className="flex gap-2">
            <Button
              variant={isRunning ? "outline" : "default"}
              onClick={isRunning ? handlePauseTimer : handleStartTimer}
              className="min-w-[80px] cursor-pointer"
              aria-label={isRunning ? "Pause timer" : "Start timer"}
            >
              {isRunning ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button
              variant="outline"
              onClick={handleStopTimer}
              className="min-w-[80px]"
              aria-label="Stop timer"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
            <Button
              variant="outline"
              onClick={handleResetTimer}
              className="min-w-[80px]"
              aria-label="Reset timer"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Volume and audio settings */}
          <div className="flex flex-col gap-4 w-48">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-4">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={[settings.volume]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="flex-1"
                      aria-label="Alarm volume"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Alarm Volume: {settings.volume}%</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoopToggle}
                    className={cn(
                      "flex items-center gap-2",
                      settings.loopAudio && "bg-primary/20"
                    )}
                  >
                    <RepeatIcon className="h-4 w-4" />
                    {settings.loopAudio ? "Loop On" : "Loop Off"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {settings.loopAudio
                      ? "Alarm will loop until stopped"
                      : "Alarm will play once"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Session counter */}
          <div className="text-sm text-muted-foreground">
            Completed Pomodoros: {completedPomodoros}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
