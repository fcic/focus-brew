"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  CloudRain,
  Trees,
  CoffeeIcon,
  Flame,
  Waves,
  Save,
  Trash,
  Plus,
  Volume2,
  Music,
  Building,
  Building2,
  Rabbit,
  Car,
  Boxes,
  WavesIcon,
  Headphones,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface Sound {
  id: string;
  name: string;
  icon: React.ReactNode;
  audioUrl: string;
  volume: number;
  playing: boolean;
  category: string;
}

interface SoundMix {
  id: string;
  name: string;
  sounds: {
    id: string;
    volume: number;
    playing: boolean;
  }[];
}

// Helper function to get icon based on sound name or category
const getSoundIcon = (name: string, category: string): React.ReactNode => {
  const nameLower = name.toLowerCase();
  const categoryLower = category.toLowerCase();

  // Check name first
  if (nameLower.includes("rain")) return <CloudRain className="h-5 w-5" />;
  if (nameLower.includes("forest") || nameLower.includes("jungle"))
    return <Trees className="h-5 w-5" />;
  if (nameLower.includes("cafe")) return <CoffeeIcon className="h-5 w-5" />;
  if (nameLower.includes("fire") || nameLower.includes("campfire"))
    return <Flame className="h-5 w-5" />;
  if (
    nameLower.includes("ocean") ||
    nameLower.includes("waves") ||
    nameLower.includes("water")
  )
    return <Waves className="h-5 w-5" />;

  // Then check category
  if (categoryLower === "nature") return <Trees className="h-5 w-5" />;
  if (categoryLower === "places") return <Building className="h-5 w-5" />;
  if (categoryLower === "urban") return <Building2 className="h-5 w-5" />;
  if (categoryLower === "animals") return <Rabbit className="h-5 w-5" />;
  if (categoryLower === "transport") return <Car className="h-5 w-5" />;
  if (categoryLower === "things") return <Boxes className="h-5 w-5" />;
  if (categoryLower === "noise") return <WavesIcon className="h-5 w-5" />;
  if (categoryLower === "binaural") return <Headphones className="h-5 w-5" />;

  // Default icon
  return <Music className="h-5 w-5" />;
};

export function AmbientSounds() {
  // Define sound categories based on the public/sounds directory structure
  const soundCategories = [
    "nature",
    "places",
    "rain",
    "urban",
    "animals",
    "binaural",
    "noise",
    "things",
    "transport",
  ];

  // Generate sounds from the available categories
  const generateSounds = (): Sound[] => {
    const sounds: Sound[] = [
      // Nature sounds
      {
        id: "nature-campfire",
        name: "Campfire",
        icon: getSoundIcon("campfire", "nature"),
        audioUrl: "/sounds/nature/campfire.mp3",
        volume: 50,
        playing: false,
        category: "nature",
      },
      {
        id: "nature-waterfall",
        name: "Waterfall",
        icon: getSoundIcon("waterfall", "nature"),
        audioUrl: "/sounds/nature/waterfall.mp3",
        volume: 50,
        playing: false,
        category: "nature",
      },
      {
        id: "nature-waves",
        name: "Ocean Waves",
        icon: getSoundIcon("waves", "nature"),
        audioUrl: "/sounds/nature/waves.mp3",
        volume: 50,
        playing: false,
        category: "nature",
      },
      {
        id: "nature-river",
        name: "River",
        icon: getSoundIcon("river", "nature"),
        audioUrl: "/sounds/nature/river.mp3",
        volume: 50,
        playing: false,
        category: "nature",
      },
      {
        id: "nature-jungle",
        name: "Jungle",
        icon: getSoundIcon("jungle", "nature"),
        audioUrl: "/sounds/nature/jungle.mp3",
        volume: 50,
        playing: false,
        category: "nature",
      },
      {
        id: "nature-wind",
        name: "Wind",
        icon: getSoundIcon("wind", "nature"),
        audioUrl: "/sounds/nature/wind.mp3",
        volume: 50,
        playing: false,
        category: "nature",
      },

      // Places sounds
      {
        id: "places-cafe",
        name: "Cafe",
        icon: getSoundIcon("cafe", "places"),
        audioUrl: "/sounds/places/cafe.mp3",
        volume: 50,
        playing: false,
        category: "places",
      },
      {
        id: "places-library",
        name: "Library",
        icon: getSoundIcon("library", "places"),
        audioUrl: "/sounds/places/library.mp3",
        volume: 50,
        playing: false,
        category: "places",
      },
      {
        id: "places-office",
        name: "Office",
        icon: getSoundIcon("office", "places"),
        audioUrl: "/sounds/places/office.mp3",
        volume: 50,
        playing: false,
        category: "places",
      },
      {
        id: "places-restaurant",
        name: "Restaurant",
        icon: getSoundIcon("restaurant", "places"),
        audioUrl: "/sounds/places/restaurant.mp3",
        volume: 50,
        playing: false,
        category: "places",
      },

      // Rain sounds
      {
        id: "rain-light",
        name: "Light Rain",
        icon: getSoundIcon("light rain", "rain"),
        audioUrl: "/sounds/rain/light-rain.mp3",
        volume: 50,
        playing: false,
        category: "rain",
      },
      {
        id: "rain-heavy",
        name: "Heavy Rain",
        icon: getSoundIcon("heavy rain", "rain"),
        audioUrl: "/sounds/rain/heavy-rain.mp3",
        volume: 50,
        playing: false,
        category: "rain",
      },
      {
        id: "rain-window",
        name: "Rain on Window",
        icon: getSoundIcon("rain on window", "rain"),
        audioUrl: "/sounds/rain/rain-on-window.mp3",
        volume: 50,
        playing: false,
        category: "rain",
      },
      {
        id: "rain-thunder",
        name: "Thunder",
        icon: getSoundIcon("thunder", "rain"),
        audioUrl: "/sounds/rain/thunder.mp3",
        volume: 50,
        playing: false,
        category: "rain",
      },
    ];

    return sounds;
  };

  const defaultSounds = generateSounds();

  const [sounds, setSounds] = useState<Sound[]>(defaultSounds);
  const [masterVolume, setMasterVolume] = useState(50);
  const [savedMixes, setSavedMixes] = useLocalStorage<SoundMix[]>(
    "sound-mixes",
    []
  );
  const [newMixName, setNewMixName] = useState("");
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  // Initialize audio elements
  useEffect(() => {
    sounds.forEach((sound) => {
      if (!audioRefs.current[sound.id]) {
        const audio = new Audio(sound.audioUrl);
        audio.loop = true;
        audioRefs.current[sound.id] = audio;
      }
    });

    return () => {
      // Cleanup audio elements
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, [sounds]);

  // Update audio playback and volume when state changes
  useEffect(() => {
    sounds.forEach((sound) => {
      const audio = audioRefs.current[sound.id];
      if (audio) {
        if (sound.playing) {
          audio.volume = (sound.volume / 100) * (masterVolume / 100);
          audio
            .play()
            .catch((error) => console.error("Error playing audio:", error));
        } else {
          audio.pause();
        }
      }
    });
  }, [sounds, masterVolume]);

  const toggleSound = (id: string) => {
    setSounds((prevSounds) =>
      prevSounds.map((sound) =>
        sound.id === id ? { ...sound, playing: !sound.playing } : sound
      )
    );
  };

  const updateSoundVolume = (id: string, volume: number) => {
    setSounds((prevSounds) =>
      prevSounds.map((sound) =>
        sound.id === id ? { ...sound, volume } : sound
      )
    );
  };

  const saveMix = () => {
    if (!newMixName.trim()) return;

    const newMix: SoundMix = {
      id: Date.now().toString(),
      name: newMixName,
      sounds: sounds.map((sound) => ({
        id: sound.id,
        volume: sound.volume,
        playing: sound.playing,
      })),
    };

    setSavedMixes([...savedMixes, newMix]);
    setNewMixName("");
  };

  const loadMix = (mix: SoundMix) => {
    setSounds((prevSounds) =>
      prevSounds.map((sound) => {
        const mixSound = mix.sounds.find((s) => s.id === sound.id);
        return mixSound
          ? { ...sound, volume: mixSound.volume, playing: mixSound.playing }
          : sound;
      })
    );
  };

  const deleteMix = (id: string) => {
    setSavedMixes(savedMixes.filter((mix) => mix.id !== id));
  };

  return (
    <div className="p-4 h-full">
      <Tabs defaultValue="mixer" className="h-full flex flex-col">
        <TabsList className="mb-4 self-center">
          <TabsTrigger value="mixer">Mixer</TabsTrigger>
          <TabsTrigger value="saved">Saved Mixes</TabsTrigger>
        </TabsList>

        <TabsContent
          value="mixer"
          className="flex-1 overflow-hidden flex flex-col"
        >
          <div className="mb-6">
            <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                      <Volume2 className="h-5 w-5" />
                    </div>
                    <Label className="text-sm font-medium">Master Volume</Label>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium">
                    {masterVolume}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[masterVolume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setMasterVolume(value[0])}
                    className="flex-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-8">
              {/* Group sounds by category */}
              {soundCategories.map((category) => {
                const categorySounds = sounds.filter(
                  (sound) => sound.category === category
                );
                if (categorySounds.length === 0) return null;

                return (
                  <div
                    key={category}
                    className="pb-6 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <h3 className="text-lg font-semibold capitalize mb-4 flex items-center gap-2">
                      {getSoundIcon(category, category)}
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categorySounds.map((sound) => (
                        <motion.div
                          key={sound.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card
                            className={`h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/50 cursor-pointer ${
                              sound.playing
                                ? "border-zinc-400 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/50"
                                : ""
                            }`}
                            onClick={() => toggleSound(sound.id)}
                          >
                            <CardContent className="p-4 h-full flex flex-col">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                                    {sound.icon}
                                  </div>
                                  <span className="font-medium">
                                    {sound.name}
                                  </span>
                                </div>
                                <div
                                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                                    sound.playing
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground border border-border"
                                  }`}
                                >
                                  {sound.playing ? "Playing" : "Play"}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                <Volume2 className="h-3 w-3 text-zinc-500" />
                                <Slider
                                  value={[sound.volume]}
                                  min={0}
                                  max={100}
                                  step={1}
                                  onValueChange={(value) => {
                                    updateSoundVolume(sound.id, value[0]);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onMouseUp={(e) => e.stopPropagation()}
                                  disabled={!sound.playing}
                                  className="flex-1"
                                />
                                <span className="text-xs text-zinc-500 w-8 text-right">
                                  {sound.volume}%
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="mt-4 flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="mix-name" className="text-xs mb-1 block">
                Mix Name
              </Label>
              <Input
                id="mix-name"
                value={newMixName}
                onChange={(e) => setNewMixName(e.target.value)}
                placeholder="My custom mix"
                className="h-8"
              />
            </div>
            <Button
              onClick={saveMix}
              disabled={!newMixName.trim()}
              size="sm"
              className="h-8"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Mix
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="flex-1 overflow-hidden">
          {savedMixes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
              <Plus className="h-10 w-10 mb-2" />
              <p>No saved mixes yet</p>
              <p className="text-sm">Create and save a mix in the Mixer tab</p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedMixes.map((mix) => (
                  <Card
                    key={mix.id}
                    className="overflow-hidden h-full hover:shadow-md hover:border-primary/50 cursor-pointer"
                    onClick={() => loadMix(mix)}
                  >
                    <CardContent className="p-4 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium flex items-center gap-2">
                          <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                            <Music className="h-5 w-5" />
                          </div>
                          {mix.name}
                        </h3>
                        <div className="flex gap-2">
                          <div className="px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
                            Load
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMix(mix.id);
                            }}
                            className="h-7 w-7 p-0"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1 flex-1">
                        {mix.sounds
                          .filter((s) => s.playing)
                          .map((s) => {
                            const soundInfo = sounds.find(
                              (ds) => ds.id === s.id
                            );
                            return (
                              <div
                                key={s.id}
                                className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full flex items-center gap-1"
                              >
                                {soundInfo?.icon}
                                <span>
                                  {soundInfo?.name}: {s.volume}%
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
