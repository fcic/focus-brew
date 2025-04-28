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
import { getSoundIcon, icons } from "@/lib/icons";
import { SaveIcon, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

interface SaveMixProps {
  mixName: string;
  onMixNameChange: (name: string) => void;
  onSave: () => void;
  isValid: boolean;
}

interface SavedMixCardProps {
  mix: SoundMix;
  sounds: Sound[];
  onLoad: (mix: SoundMix) => void;
  onDelete: (id: string) => void;
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
          "p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm",
          "hover:border-zinc-700/50 transition-all cursor-pointer",
          sound.playing && "border-zinc-700 bg-zinc-800/50",
          sound.error && "border-red-900/50"
        )}
        onClick={() => onToggle(sound.id)}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className={cn(
              "p-2 bg-zinc-800 rounded-lg",
              sound.isLoading && "animate-pulse"
            )}
          >
            {sound.icon}
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-zinc-200">
              {sound.name}
            </span>
            {sound.error && (
              <p className="text-xs text-red-400 mt-0.5">{sound.error}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 text-zinc-400">
            {React.createElement(icons.Volume2)}
          </div>
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
              "w-24",
              (sound.isLoading || sound.error) && "opacity-50"
            )}
          />
          <span className="text-xs text-zinc-400 w-8 text-right">
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
}: MasterVolumeProps) {
  return (
    <div className="p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-zinc-800 rounded-lg">
          <div className="w-4 h-4 text-zinc-400">
            {React.createElement(icons.Volume2)}
          </div>
        </div>
        <span className="text-sm font-medium text-zinc-200">Master Volume</span>
        <span className="text-xs text-zinc-400 ml-auto">{volume}%</span>
      </div>
      <Slider
        value={[volume]}
        min={MIN_VOLUME}
        max={MAX_VOLUME}
        step={1}
        onValueChange={(value) => onVolumeChange(value[0])}
        className="flex-1"
      />
    </div>
  );
});

const SaveMix = React.memo(function SaveMix({
  mixName,
  onMixNameChange,
  onSave,
  isValid,
}: SaveMixProps) {
  return (
    <div className="flex items-end gap-2 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
      <div className="flex-1">
        <Label htmlFor="mix-name" className="text-sm mb-2 block text-zinc-400">
          Mix Name
        </Label>
        <Input
          id="mix-name"
          value={mixName}
          onChange={(e) => onMixNameChange(e.target.value)}
          placeholder="My custom mix"
          className="h-9 bg-zinc-800/50 border-zinc-700/50 text-zinc-200 focus:border-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <Button
        onClick={onSave}
        disabled={!isValid}
        size="sm"
        className={cn(
          "bg-zinc-800 hover:bg-zinc-700 text-zinc-200",
          "border border-zinc-700/50",
          "disabled:bg-zinc-900 disabled:text-zinc-500"
        )}
      >
        <SaveIcon className="w-4 h-4" />
      </Button>
    </div>
  );
});

const SavedMixCard = React.memo(function SavedMixCard({
  mix,
  sounds,
  onLoad,
  onDelete,
}: SavedMixCardProps) {
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(mix.id);
    },
    [mix.id, onDelete]
  );

  const activeSounds = useMemo(
    () =>
      mix.sounds
        .filter((s) => s.playing)
        .map((s) => {
          const soundInfo = sounds.find((ds) => ds.id === s.id);
          return { ...s, info: soundInfo };
        }),
    [mix.sounds, sounds]
  );

  return (
    <div
      className="p-4 rounded-lg border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm hover:border-zinc-700/50 transition-all cursor-pointer"
      onClick={() => onLoad(mix)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-zinc-800 rounded-lg">
            <div className="w-4 h-4 text-zinc-400">
              {React.createElement(icons.Music)}
            </div>
          </div>
          <span className="text-sm font-medium text-zinc-200">{mix.name}</span>
        </div>
        <div className="flex gap-2">
          <div className="px-2 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50">
            Load
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <div className="w-4 h-4">{React.createElement(icons.Trash)}</div>
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {activeSounds.map((s) => (
          <div
            key={s.id}
            className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full flex items-center gap-1.5"
          >
            <div className="w-3 h-3 text-zinc-400">{s.info?.icon}</div>
            <span>
              {s.info?.name}: {s.volume}%
            </span>
          </div>
        ))}
      </div>
    </div>
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
  }, [newMixName, sounds, setSavedMixes]);

  // Handle loading mix
  const handleLoadMix = useCallback(
    (mix: SoundMix) => {
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
    },
    [sounds, masterVolume]
  );

  // Handle deleting mix
  const handleDeleteMix = useCallback(
    (id: string) => {
      setSavedMixes((prev) => prev.filter((mix) => mix.id !== id));
    },
    [setSavedMixes]
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
        const volume = parseInt(e.code.replace("Digit", "")) * 10;
        setMasterVolume(volume);
      }

      if (e.altKey && e.code && e.code.match(/Digit[1-5]/)) {
        const index = parseInt(e.code.replace("Digit", "")) - 1;
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
  }, []);

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="flex items-center justify-between p-6 pb-4">
        <MasterVolume
          volume={masterVolume}
          onVolumeChange={handleMasterVolumeChange}
        />
        <div className="flex items-center gap-4">
          <Button
            onClick={stopAllSounds}
            variant="destructive"
            size="sm"
            className="bg-red-700 hover:bg-red-800 text-white"
          >
            <StopCircle className="w-4 h-4 mr-2" />
            Stop All
          </Button>
          <div className="text-xs text-zinc-500">
            <kbd className="px-2 py-1 bg-zinc-800 rounded">Space</kbd> Toggle
            Sound
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 px-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {soundCategories.map((category, index) => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap",
                  "bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/50",
                  "text-zinc-400 hover:text-zinc-200",
                  activeTab === category &&
                    "bg-zinc-800 text-zinc-200 border-zinc-700"
                )}
                onClick={() => setActiveTab(category)}
              >
                <span className="hidden sm:inline mr-1 text-zinc-500">
                  Alt+{index + 1}
                </span>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea
          className="flex-1 pr-4"
          style={{ height: "calc(100vh - 280px)" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {filteredSounds.map((sound) => (
              <SoundCard
                key={sound.id}
                sound={sound}
                onToggle={toggleSound}
                onVolumeChange={handleVolumeChange}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm p-6 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-200">Saved Mixes</h3>
          <span className="text-xs text-zinc-500">
            Create custom combinations
          </span>
        </div>
        <SaveMix
          mixName={newMixName}
          onMixNameChange={setNewMixName}
          onSave={handleSaveMix}
          isValid={newMixName.trim().length > 0}
        />
        {sortedMixes.length > 0 && (
          <ScrollArea className="pr-4 mt-4" style={{ maxHeight: "160px" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedMixes.map((mix) => (
                <SavedMixCard
                  key={mix.id}
                  mix={mix}
                  sounds={sounds}
                  onLoad={handleLoadMix}
                  onDelete={handleDeleteMix}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
