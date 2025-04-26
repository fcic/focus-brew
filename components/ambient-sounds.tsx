"use client";

import React from "react";

import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { soundCategories, soundPaths, type SoundCategory } from "@/lib/paths";
import { getSoundIcon, icons } from "@/lib/icons";
import { SaveIcon } from "lucide-react";

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

export function AmbientSounds() {
  // Generate sounds from the available categories
  const generateSounds = (): Sound[] => {
    return soundPaths.map((sound) => ({
      ...sound,
      icon: (
        <div className="w-5 h-5">
          {React.createElement(getSoundIcon(sound.name, sound.category))}
        </div>
      ),
      volume: 50,
      playing: false,
    }));
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
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                      <div className="w-5 h-5">
                        {React.createElement(icons.Volume2)}
                      </div>
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
                      <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                        <div className="w-5 h-5">
                          {React.createElement(
                            getSoundIcon(category, category)
                          )}
                        </div>
                      </div>
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
                                  <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                                    {sound.icon}
                                  </div>
                                  <span className="font-medium">
                                    {sound.name}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                <div className="w-5 h-5 text-zinc-500">
                                  {React.createElement(icons.Volume2)}
                                </div>
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

          <div className="mt-4 flex items-end gap-2 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
            <div className="flex-1">
              <Label
                htmlFor="mix-name"
                className="text-sm mb-2 block text-zinc-400"
              >
                Mix Name
              </Label>
              <Input
                id="mix-name"
                value={newMixName}
                onChange={(e) => setNewMixName(e.target.value)}
                placeholder="My custom mix"
                className="h-9 bg-zinc-800/50 border-zinc-700 focus:border-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button onClick={saveMix} disabled={!newMixName.trim()} size="sm">
              <SaveIcon className="w-5 h-5" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="flex-1 overflow-hidden">
          {savedMixes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
              <div className="w-5 h-5 mb-2">
                {React.createElement(icons.Plus)}
              </div>
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
                          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                            <div className="w-5 h-5">
                              {React.createElement(icons.Music)}
                            </div>
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
                            <div className="w-5 h-5">
                              {React.createElement(icons.Trash)}
                            </div>
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
