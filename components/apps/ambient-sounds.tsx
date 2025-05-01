"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { soundCategories, soundPaths, type SoundCategory } from "@/lib/paths";
import { getSoundIcon } from "@/lib/icons";
import {
  SaveIcon,
  StopCircle,
  Play,
  Trash2,
  Volume2,
  PauseCircle,
  Plus,
  Headphones,
  Bookmark,
  BookmarkCheck,
  Layers,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Constants for volume
const DEFAULT_VOLUME = 50;
const MAX_VOLUME = 100;
const MIN_VOLUME = 0;

// Create a cache for audio elements that persists across component renders
const globalAudioCache: Record<string, HTMLAudioElement> = {};
let isPageUnloading = false;

// Keep track of if sounds should continue in background
let shouldPlayInBackground = true;

// Handle page unload to clean up audio elements
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    isPageUnloading = true;
    // Clean up all audio elements
    Object.values(globalAudioCache).forEach((audio) => {
      try {
        audio.pause();
        audio.src = "";
        audio.load();
      } catch (e) {
        console.error("Error cleaning up audio on page unload:", e);
      }
    });
  });
}

// Export function to control background playback (can be called from outside)
export function stopAllAmbientSounds() {
  shouldPlayInBackground = false;
  Object.values(globalAudioCache).forEach((audio) => {
    try {
      audio.pause();
    } catch (e) {
      console.error("Error stopping ambient sound:", e);
    }
  });
}

// Start playing ambient sounds again
export function resumeAmbientSounds() {
  shouldPlayInBackground = true;
}

// Define interfaces
interface Sound {
  id: string;
  name: string;
  icon: React.ReactNode;
  audioUrl: string;
  volume: number;
  playing: boolean;
  category: string;
  isLoading?: boolean;
  error?: string;
}

interface SoundMix {
  id: string;
  name: string;
  sounds: {
    id: string;
    volume: number;
    playing: boolean;
  }[];
  createdAt: string;
}

interface SoundCardProps {
  sound: Sound;
  onToggle: (id: string) => void;
  onVolumeChange: (id: string, value: number) => void;
  onDelete?: (id: string) => void;
}

interface MasterVolumeProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  onStopAll: () => void;
  activeSoundsCount: number;
}

interface SaveMixProps {
  mixName: string;
  onMixNameChange: (name: string) => void;
  onSave: () => void;
  isValid: boolean;
  activeSoundsCount: number;
}

interface SavedMixCardProps {
  mix: SoundMix;
  sounds: Sound[];
  onLoad: (mix: SoundMix) => void;
  onDelete: (id: string) => void;
  isActive: boolean;
}

// Animation configuration
const ANIMATION_CONFIG = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 },
} as const;

// Safely convert UI volume (0-100) to audio volume (0-1)
const normalizeVolume = (volume: number): number => {
  return Math.max(0, Math.min(1, volume / MAX_VOLUME));
};

// Component implementations
const SoundCard = React.memo(function SoundCard({
  sound,
  onToggle,
  onVolumeChange,
}: SoundCardProps) {
  const handleSliderClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <motion.div {...ANIMATION_CONFIG}>
      <div
        className={cn(
          "p-4 rounded-xl border bg-background/80 backdrop-blur-sm transition-all cursor-pointer",
          sound.playing
            ? "border-primary/50 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(0,0,0,0.25)]"
            : "border-border/50 hover:border-border/80",
          sound.error && "border-destructive/30"
        )}
        onClick={() => onToggle(sound.id)}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              "p-2 rounded-lg flex items-center justify-center",
              sound.playing
                ? "bg-primary/10 text-primary"
                : "bg-muted/70 dark:bg-muted text-muted-foreground",
              sound.isLoading && "animate-pulse"
            )}
          >
            {sound.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{sound.name}</div>
            {sound.error && (
              <p className="text-xs text-destructive mt-0.5 truncate">
                {sound.error}
              </p>
            )}
          </div>
          <Button
            variant={sound.playing ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0",
              sound.playing && "bg-primary text-primary-foreground"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(sound.id);
            }}
          >
            {sound.playing ? (
              <PauseCircle className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span className="sr-only">
              {sound.playing ? "Pause" : "Play"} {sound.name}
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
          <Slider
            value={[sound.volume]}
            min={MIN_VOLUME}
            max={MAX_VOLUME}
            step={1}
            onValueChange={(value) => {
              const volumeValue = Array.isArray(value) ? value[0] : value;
              onVolumeChange(sound.id, volumeValue);
            }}
            onClick={handleSliderClick}
            onMouseDown={handleSliderClick}
            onMouseUp={handleSliderClick}
            disabled={!sound.playing || sound.isLoading || !!sound.error}
            className={cn(
              "flex-1",
              (sound.isLoading || sound.error) && "opacity-50"
            )}
          />
          <span className="text-xs text-muted-foreground w-8 text-right">
            {sound.volume}%
          </span>
        </div>
      </div>
    </motion.div>
  );
});

const MasterVolume = React.memo(function MasterVolume({
  volume,
  onVolumeChange,
  onStopAll,
  activeSoundsCount,
}: MasterVolumeProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
      <div className="p-4 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm flex-1 w-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Headphones className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Master Volume</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {volume}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            min={MIN_VOLUME}
            max={MAX_VOLUME}
            step={1}
            onValueChange={(value) => onVolumeChange(value[0])}
            className="flex-1"
          />
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">Space</span>
          </kbd>
        </div>
      </div>

      <Button
        onClick={onStopAll}
        variant="destructive"
        size="sm"
        className="gap-1.5 h-10 px-4 whitespace-nowrap"
        disabled={activeSoundsCount === 0}
      >
        <StopCircle className="w-4 h-4" />
        Stop All {activeSoundsCount > 0 && `(${activeSoundsCount})`}
      </Button>
    </div>
  );
});

const SaveMix = React.memo(function SaveMix({
  mixName,
  onMixNameChange,
  onSave,
  isValid,
  activeSoundsCount,
}: SaveMixProps) {
  return (
    <div className="p-4 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Bookmark className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium">Save Current Mix</span>
        {activeSoundsCount > 0 && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {activeSoundsCount} sound{activeSoundsCount !== 1 ? "s" : ""} active
          </span>
        )}
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label
            htmlFor="mix-name"
            className="text-xs mb-1.5 block text-muted-foreground"
          >
            Mix Name
          </Label>
          <Input
            id="mix-name"
            value={mixName}
            onChange={(e) => onMixNameChange(e.target.value)}
            placeholder="My custom mix"
            className="h-9"
          />
        </div>
        <Button
          onClick={onSave}
          disabled={!isValid || activeSoundsCount === 0}
          size="sm"
          className="gap-1.5 h-9"
        >
          <SaveIcon className="w-4 h-4" />
          <span>Save</span>
        </Button>
      </div>
    </div>
  );
});

const SavedMixCard = React.memo(function SavedMixCard({
  mix,
  sounds,
  onLoad,
  onDelete,
  isActive,
}: SavedMixCardProps) {
  // Get a list of unique sound IDs in this mix
  const soundsInMix = mix.sounds.filter((s) => s.playing).map((s) => s.id);

  // Get the icons for each unique sound
  const soundIcons = useMemo(() => {
    const uniqueSounds = [...new Set(soundsInMix)]
      .map((id) => {
        const soundDetails = sounds.find((s) => s.id === id);
        return soundDetails ? soundDetails.icon : null;
      })
      .filter(Boolean);

    // Return at most 3 icons
    return uniqueSounds.slice(0, 3);
  }, [soundsInMix, sounds]);

  // Format the date
  const formattedDate = useMemo(() => {
    try {
      const date = new Date(mix.createdAt);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      return "";
    }
  }, [mix.createdAt]);

  return (
    <motion.div {...ANIMATION_CONFIG}>
      <div
        className={cn(
          "p-4 rounded-xl border bg-background/80 backdrop-blur-sm transition-all",
          isActive
            ? "border-primary/50 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(0,0,0,0.25)]"
            : "border-border/50 hover:border-border/80"
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              "p-2 rounded-lg flex items-center justify-center",
              isActive
                ? "bg-primary/10 text-primary"
                : "bg-muted/70 dark:bg-muted text-muted-foreground"
            )}
          >
            {isActive ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{mix.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {soundsInMix.length} sound{soundsInMix.length !== 1 ? "s" : ""}
              </span>
              <span className="text-muted-foreground/40 text-xs">•</span>
              <span className="text-xs text-muted-foreground">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {soundIcons.length > 0 && (
          <div className="flex items-center gap-1 mb-3 ml-1">
            {soundIcons.map((icon, i) => (
              <div
                key={i}
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/70 dark:bg-muted text-muted-foreground",
                  i !== 0 && "-ml-1"
                )}
                style={{ zIndex: 3 - i }}
              >
                {icon}
              </div>
            ))}
            {soundIcons.length < soundsInMix.length && (
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center -ml-1",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/70 dark:bg-muted text-muted-foreground"
                )}
                style={{ zIndex: 3 - soundIcons.length }}
              >
                <span className="text-xs font-medium">
                  +{soundsInMix.length - soundIcons.length}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isActive ? "default" : "outline"}
            className={cn(
              "flex-1 h-9 text-xs gap-1.5",
              isActive && "bg-primary text-primary-foreground"
            )}
            onClick={() => onLoad(mix)}
          >
            {isActive ? (
              <>
                <StopCircle className="h-3.5 w-3.5" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                Play
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:border-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(mix.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete {mix.name}</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
});

export function AmbientSounds() {
  // State
  const [sounds, setSounds] = useState<Sound[]>(() => {
    // Try to load volume settings from localStorage
    const savedVolumes = localStorage.getItem("ambient-sound-volumes");
    const volumeMap: Record<string, number> = savedVolumes
      ? JSON.parse(savedVolumes)
      : {};

    return soundPaths.map((sound) => ({
      ...sound,
      icon: (
        <div className="w-5 h-5">
          {React.createElement(getSoundIcon(sound.name, sound.category))}
        </div>
      ),
      // Use saved volume or default
      volume: volumeMap[sound.id] || DEFAULT_VOLUME,
      playing: false,
      isLoading: false,
      error: undefined,
    }));
  });

  const [masterVolume, setMasterVolume] = useLocalStorage<number>(
    "ambient-master-volume",
    DEFAULT_VOLUME
  );

  const [savedMixes, setSavedMixes] = useLocalStorage<SoundMix[]>(
    "sound-mixes",
    []
  );
  const [newMixName, setNewMixName] = useState("");
  const [activeTab, setActiveTab] = useState<SoundCategory>("nature");
  const [isDragging, setIsDragging] = useState(false);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [activeMixId, setActiveMixId] = useState<string | null>(null);

  // Refs
  const isWindowFocusedRef = useRef(true);
  const loadingStatus = useRef<Record<string, boolean>>({});
  const volumeUpdateTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeAudioState = useRef<Record<string, boolean>>({});
  const audioRetries = useRef<Record<string, number>>({});

  // Constants
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1500;

  // Derived state
  const sortedMixes = useMemo(
    () =>
      [...savedMixes].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [savedMixes]
  );

  const filteredSounds = useMemo(
    () => sounds.filter((sound) => sound.category === activeTab),
    [sounds, activeTab]
  );

  const activeSoundsCount = useMemo(
    () => sounds.filter((sound) => sound.playing).length,
    [sounds]
  );

  // Event handlers
  const handleWindowBlur = useCallback(() => {
    console.log("Window blur event");
    isWindowFocusedRef.current = false;
    setIsWindowFocused(false);

    // Don't pause sounds when changing tabs - we want them to keep playing
    // Just store which sounds were playing to handle potential errors
    sounds.forEach((sound) => {
      if (sound.playing) {
        activeAudioState.current[sound.id] = true;
      }
    });
  }, [sounds]);

  const handleWindowFocus = useCallback(() => {
    console.log("Window focus event");
    isWindowFocusedRef.current = true;
    setIsWindowFocused(true);

    // Check if any sounds need to be restarted due to browser throttling
    Object.entries(activeAudioState.current).forEach(
      ([soundId, wasPlaying]) => {
        if (wasPlaying) {
          const sound = sounds.find((s) => s.id === soundId);
          if (sound && sound.playing) {
            const audio = globalAudioCache[soundId];
            if (audio && audio.paused) {
              // Only resume if the audio was paused by the browser
              try {
                // Set proper volume
                const normalizedVolume =
                  normalizeVolume(sound.volume) * normalizeVolume(masterVolume);
                audio.volume = normalizedVolume;

                // Resume playback
                audio.play().catch((err) => {
                  console.warn(
                    `Error resuming audio ${soundId} on focus:`,
                    err
                  );
                });
              } catch (err) {
                console.warn(`Error handling audio ${soundId} on focus:`, err);
              }
            }
          }
        }
      }
    );
  }, [sounds, masterVolume]);

  // Toggle sound playback
  const toggleSound = useCallback(
    (soundId: string) => {
      if (!isWindowFocusedRef.current && isDragging) {
        console.warn(
          "Ignoring toggle request - window not focused or dragging"
        );
        return;
      }

      setSounds((prevSounds) => {
        // Find the sound we want to toggle
        const soundToToggle = prevSounds.find((s) => s.id === soundId);
        if (!soundToToggle) return prevSounds;

        // We'll toggle this sound's playing state
        const newPlayingState = !soundToToggle.playing;

        return prevSounds.map((sound) => {
          if (sound.id === soundId) {
            // Handle audio playback
            if (newPlayingState) {
              // Initialize or get audio element
              let audio = globalAudioCache[soundId];

              if (!audio) {
                audio = new Audio();
                audio.loop = true;
                audio.src = sound.audioUrl;
                audio.volume =
                  normalizeVolume(sound.volume) * normalizeVolume(masterVolume);

                // Set up error handling
                audio.onerror = () => {
                  console.error(`Error loading sound ${soundId}`);

                  if (!isWindowFocusedRef.current || isDragging) {
                    console.warn(
                      `Audio error while window unfocused/dragging for ${soundId}`
                    );
                    return;
                  }

                  setSounds((prev) =>
                    prev.map((s) =>
                      s.id === soundId
                        ? {
                            ...s,
                            playing: false,
                            isLoading: false,
                            error: "Failed to load sound",
                          }
                        : s
                    )
                  );
                };

                // Add to global cache
                globalAudioCache[soundId] = audio;
              }

              // Play audio with error handling
              try {
                // Ensure volume is set correctly
                audio.volume =
                  normalizeVolume(sound.volume) * normalizeVolume(masterVolume);

                // Play the sound
                audio.play().catch((err) => {
                  console.error(`Error playing sound ${soundId}:`, err);

                  setSounds((prev) =>
                    prev.map((s) =>
                      s.id === soundId
                        ? {
                            ...s,
                            playing: false,
                            isLoading: false,
                            error: `Playback error: ${err.message}`,
                          }
                        : s
                    )
                  );
                });
              } catch (err) {
                console.error(`Exception playing sound ${soundId}:`, err);
              }
            } else {
              // Pause audio
              const audio = globalAudioCache[soundId];
              if (audio) {
                try {
                  audio.pause();
                } catch (err) {
                  console.warn(`Error pausing audio ${soundId}:`, err);
                }
              }
            }

            return {
              ...sound,
              playing: newPlayingState,
              isLoading:
                newPlayingState &&
                (!globalAudioCache[soundId] ||
                  !globalAudioCache[soundId].readyState),
              error: undefined,
            };
          }
          return sound;
        });
      });

      // Clear active mix when manually toggling sounds
      setActiveMixId(null);
    },
    [isDragging, masterVolume]
  );

  // Handle volume changes
  const handleVolumeChange = useCallback(
    (soundId: string, value: number) => {
      const newVolume = value;

      // Update audio element volume directly
      const audio = globalAudioCache[soundId];
      if (audio) {
        try {
          // Convert from UI scale (0-100) to audio scale (0-1)
          const normalizedVolume =
            normalizeVolume(newVolume) * normalizeVolume(masterVolume);
          console.log(
            `Setting volume for ${soundId} to ${normalizedVolume} (${newVolume}%)`
          );
          audio.volume = normalizedVolume;
        } catch (err) {
          console.warn(`Error setting volume for ${soundId}:`, err);
        }
      }

      // Debounce state updates
      clearTimeout(volumeUpdateTimeouts.current[soundId]);
      volumeUpdateTimeouts.current[soundId] = setTimeout(() => {
        setSounds((prevSounds) =>
          prevSounds.map((sound) =>
            sound.id === soundId ? { ...sound, volume: newVolume } : sound
          )
        );

        // Save to localStorage
        const savedVolumes = JSON.parse(
          localStorage.getItem("ambient-sound-volumes") || "{}"
        );
        localStorage.setItem(
          "ambient-sound-volumes",
          JSON.stringify({ ...savedVolumes, [soundId]: newVolume })
        );
      }, 100);

      // Clear active mix when manually changing volume
      setActiveMixId(null);
    },
    [masterVolume]
  );

  // Handle master volume change
  const handleMasterVolumeChange = useCallback(
    (volume: number) => {
      setMasterVolume(volume);

      // Update all playing audio elements with the new master volume
      sounds.forEach((sound) => {
        if (sound.playing) {
          const audio = globalAudioCache[sound.id];
          if (audio) {
            try {
              const normalizedVolume =
                normalizeVolume(sound.volume) * normalizeVolume(volume);
              console.log(
                `Updating master volume for ${sound.id} to ${normalizedVolume} (${volume}%)`
              );
              audio.volume = normalizedVolume;
            } catch (err) {
              console.warn(
                `Error updating master volume for ${sound.id}:`,
                err
              );
            }
          }
        }
      });
    },
    [sounds, setMasterVolume]
  );

  // Handle saving mix
  const handleSaveMix = useCallback(() => {
    if (!newMixName.trim()) return;

    const newMix: SoundMix = {
      id: crypto.randomUUID(),
      name: newMixName.trim(),
      sounds: sounds.map(({ id, volume, playing }) => ({
        id,
        volume,
        playing,
      })),
      createdAt: new Date().toISOString(),
    };

    setSavedMixes((prev) => [newMix, ...prev]);
    setNewMixName("");
    setActiveMixId(newMix.id);
  }, [newMixName, sounds, setSavedMixes]);

  // Handle loading mix
  const handleLoadMix = useCallback(
    (mix: SoundMix) => {
      // Check if this mix is already active
      const isActive = mix.id === activeMixId;

      if (isActive) {
        // If active, stop all sounds and clear active mix
        stopAllSounds();
        setActiveMixId(null);
        return;
      }

      // First pause all currently playing sounds
      sounds.forEach((sound) => {
        if (sound.playing) {
          const audio = globalAudioCache[sound.id];
          if (audio && !audio.paused) {
            try {
              audio.pause();
            } catch (err) {
              console.warn(
                `Error pausing sound ${sound.id} when loading mix:`,
                err
              );
            }
          }
        }
      });

      // Update state with new mix
      setSounds((prev) =>
        prev.map((sound) => {
          const mixSound = mix.sounds.find((s) => s.id === sound.id);
          const newState = mixSound
            ? { ...sound, volume: mixSound.volume, playing: mixSound.playing }
            : sound;

          // Handle playback for this sound based on mix settings
          if (mixSound?.playing) {
            let audio = globalAudioCache[sound.id];

            if (!audio) {
              // Initialize new audio element
              audio = new Audio();
              audio.loop = true;
              audio.src = sound.audioUrl;
              globalAudioCache[sound.id] = audio;
            }

            // Set volume and play
            try {
              audio.volume =
                normalizeVolume(mixSound.volume) *
                normalizeVolume(masterVolume);
              audio.play().catch((err) => {
                console.warn(`Error playing sound ${sound.id} in mix:`, err);
              });
            } catch (err) {
              console.warn(`Error setting up sound ${sound.id} in mix:`, err);
            }
          }

          return newState;
        })
      );

      // Set this mix as active
      setActiveMixId(mix.id);
    },
    [sounds, masterVolume, activeMixId]
  );

  // Handle deleting mix
  const handleDeleteMix = useCallback(
    (id: string) => {
      // If deleting the active mix, clear active mix ID
      if (id === activeMixId) {
        setActiveMixId(null);
      }

      setSavedMixes((prev) => prev.filter((mix) => mix.id !== id));
    },
    [setSavedMixes, activeMixId]
  );

  // Save sound volumes to localStorage
  useEffect(() => {
    const volumeMap: Record<string, number> = {};
    sounds.forEach((sound) => {
      volumeMap[sound.id] = sound.volume;
    });

    localStorage.setItem("ambient-sound-volumes", JSON.stringify(volumeMap));
  }, [sounds]);

  // Set up window focus/blur event listeners
  useEffect(() => {
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    // Initialize with  handleWindowBlur)
    window.addEventListener("focus", handleWindowFocus);

    // Initialize with current focus state
    isWindowFocusedRef.current = document.hasFocus();
    setIsWindowFocused(document.hasFocus());

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [handleWindowBlur, handleWindowFocus]);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !(e.target as HTMLElement)?.matches?.("input, textarea")
      ) {
        e.preventDefault();
        setMasterVolume((prev) => (prev === 0 ? DEFAULT_VOLUME : 0));
      }

      if (
        e.code &&
        e.code.match(/Digit[1-9]/) &&
        !(e.target as HTMLElement)?.matches?.("input, textarea")
      ) {
        const volume = Number.parseInt(e.code.replace("Digit", "")) * 10;
        setMasterVolume(volume);
      }

      if (e.altKey && e.code && e.code.match(/Digit[1-5]/)) {
        const index = Number.parseInt(e.code.replace("Digit", "")) - 1;
        if (index < soundCategories.length) {
          setActiveTab(soundCategories[index]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [setMasterVolume]);

  // Set up drag detection
  useEffect(() => {
    const handleDragStart = () => {
      setIsDragging(true);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };

    const handleDragEnd = () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }

      dragTimeoutRef.current = setTimeout(() => {
        setIsDragging(false);
      }, 500);
    };

    // Use mouse events as proxy for drag detection
    window.addEventListener("mousedown", handleDragStart);
    window.addEventListener("mouseup", handleDragEnd);

    return () => {
      window.removeEventListener("mousedown", handleDragStart);
      window.removeEventListener("mouseup", handleDragEnd);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all timeouts
      Object.keys(volumeUpdateTimeouts.current).forEach((id) => {
        clearTimeout(volumeUpdateTimeouts.current[id]);
      });

      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }

      // Check if we should stop sounds when component unmounts
      if (!shouldPlayInBackground) {
        // Stop all playing sounds
        sounds.forEach((sound) => {
          if (sound.playing) {
            const audio = globalAudioCache[sound.id];
            if (audio && !audio.paused) {
              try {
                audio.pause();
              } catch (err) {
                console.warn(
                  `Error stopping sound ${sound.id} on unmount:`,
                  err
                );
              }
            }
          }
        });
      }
    };
  }, [sounds]);

  // Add a function to stop all sounds
  const stopAllSounds = useCallback(() => {
    // First update all sounds to not playing in state
    setSounds((prevSounds) =>
      prevSounds.map((sound) => ({
        ...sound,
        playing: false,
        isLoading: false,
        error: undefined,
      }))
    );

    // Then stop all audio elements
    stopAllAmbientSounds();

    // Clear active mix
    setActiveMixId(null);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex flex-col gap-6">
          {/* Header with master controls */}
          <MasterVolume
            volume={masterVolume}
            onVolumeChange={handleMasterVolumeChange}
            onStopAll={stopAllSounds}
            activeSoundsCount={activeSoundsCount}
          />

          {/* Main content - split into two columns on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
            {/* Sound browser */}
            <div className="flex flex-col gap-4">
              <Tabs
                defaultValue={activeTab}
                onValueChange={(v) => setActiveTab(v as SoundCategory)}
              >
                <TabsList className="mb-4 flex flex-wrap">
                  {soundCategories.map((category, index) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="capitalize"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {soundCategories.map((category) => (
                  <TabsContent key={category} value={category} className="mt-0">
                    <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                        {sounds
                          .filter((sound) => sound.category === category)
                          .map((sound) => (
                            <SoundCard
                              key={sound.id}
                              sound={sound}
                              onToggle={toggleSound}
                              onVolumeChange={handleVolumeChange}
                            />
                          ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Mixes sidebar */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Sound Mixes
                </h3>
                <span className="text-xs text-muted-foreground">
                  {savedMixes.length} saved mix
                  {savedMixes.length !== 1 ? "es" : ""}
                </span>
              </div>

              <SaveMix
                mixName={newMixName}
                onMixNameChange={setNewMixName}
                onSave={handleSaveMix}
                isValid={newMixName.trim().length > 0}
                activeSoundsCount={activeSoundsCount}
              />

              {sortedMixes.length > 0 ? (
                <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
                  <div className="grid grid-cols-1 gap-4 pb-4">
                    {sortedMixes.map((mix) => (
                      <SavedMixCard
                        key={mix.id}
                        mix={mix}
                        sounds={sounds}
                        onLoad={handleLoadMix}
                        onDelete={handleDeleteMix}
                        isActive={mix.id === activeMixId}
                      />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-xl border-border/50">
                  <Sparkles className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="text-sm font-medium mb-1">
                    No saved mixes yet
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 max-w-[250px]">
                    Play some sounds and save your mix to create custom ambient
                    combinations
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setNewMixName("My First Mix")}
                    disabled={activeSoundsCount === 0}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Mix
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground border-t border-border/30 pt-4 mt-2">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                Space
              </kbd>
              <span>Toggle Sound</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                1-9
              </kbd>
              <span>Set Volume</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">
                Alt+1-5
              </kbd>
              <span>Change Category</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
