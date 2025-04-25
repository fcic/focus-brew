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
} from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface Sound {
  id: string;
  name: string;
  icon: React.ReactNode;
  audioUrl: string;
  volume: number;
  playing: boolean;
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

export function AmbientSounds() {
  const defaultSounds: Sound[] = [
    {
      id: "rain",
      name: "Rain",
      icon: <CloudRain className="h-5 w-5" />,
      audioUrl: "/sounds/rain.mp3",
      volume: 50,
      playing: false,
    },
    {
      id: "forest",
      name: "Forest",
      icon: <Trees className="h-5 w-5" />,
      audioUrl: "/sounds/forest.mp3",
      volume: 50,
      playing: false,
    },
    {
      id: "cafe",
      name: "Cafe",
      icon: <CoffeeIcon className="h-5 w-5" />,
      audioUrl: "/sounds/cafe.mp3",
      volume: 50,
      playing: false,
    },
    {
      id: "fire",
      name: "Fire",
      icon: <Flame className="h-5 w-5" />,
      audioUrl: "/sounds/fire.mp3",
      volume: 50,
      playing: false,
    },
    {
      id: "ocean",
      name: "Ocean",
      icon: <Waves className="h-5 w-5" />,
      audioUrl: "/sounds/ocean.mp3",
      volume: 50,
      playing: false,
    },
  ];

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
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Master Volume</Label>
              <span className="text-xs text-zinc-500">{masterVolume}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-zinc-500" />
              <Slider
                value={[masterVolume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => setMasterVolume(value[0])}
                className="flex-1"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {sounds.map((sound) => (
                <motion.div
                  key={sound.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`overflow-hidden transition-all ${
                      sound.playing
                        ? "border-zinc-400 dark:border-zinc-600"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {sound.icon}
                          <span className="font-medium">{sound.name}</span>
                        </div>
                        <Button
                          variant={sound.playing ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSound(sound.id)}
                          className="h-7 px-2"
                        >
                          {sound.playing ? "Playing" : "Play"}
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Volume2 className="h-3 w-3 text-zinc-500" />
                        <Slider
                          value={[sound.volume]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) =>
                            updateSoundVolume(sound.id, value[0])
                          }
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
              <div className="space-y-3">
                {savedMixes.map((mix) => (
                  <Card key={mix.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{mix.name}</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadMix(mix)}
                            className="h-7 px-2"
                          >
                            Load
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMix(mix.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {mix.sounds
                          .filter((s) => s.playing)
                          .map((s) => {
                            const soundInfo = defaultSounds.find(
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
