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
  Coffee,
  Flame,
  Save,
  Trash,
  Plus,
  Volume2,
  Music,
  Building,
  Building2,
  Rabbit,
  Car,
  Package,
  Radio,
  Headphones,
  Wind,
  Bird,
  Droplets,
  Snowflake,
  Ship,
  Mountain,
  Umbrella,
  Zap,
  Clock,
  Star,
  Waves
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

  // Check name first for more specific matching
  if (nameLower.includes("rain")) return <CloudRain className="h-5 w-5" />;
  if (nameLower.includes("thunder")) return <Zap className="h-5 w-5" />;
  if (nameLower.includes("forest") || nameLower.includes("jungle")) return <Trees className="h-5 w-5" />;
  if (nameLower.includes("cafe")) return <Coffee className="h-5 w-5" />;
  if (nameLower.includes("fire") || nameLower.includes("campfire")) return <Flame className="h-5 w-5" />;
  if (nameLower.includes("ocean") || nameLower.includes("waves") || nameLower.includes("water")) return <Waves className="h-5 w-5" />;
  if (nameLower.includes("wind")) return <Wind className="h-5 w-5" />;
  if (nameLower.includes("birds")) return <Bird className="h-5 w-5" />;
  if (nameLower.includes("snow")) return <Snowflake className="h-5 w-5" />;
  if (nameLower.includes("droplets")) return <Droplets className="h-5 w-5" />;
  if (nameLower.includes("sail") || nameLower.includes("boat")) return <Ship className="h-5 w-5" />;
  if (nameLower.includes("umbrella")) return <Umbrella className="h-5 w-5" />;
  if (nameLower.includes("radio")) return <Radio className="h-5 w-5" />;
  if (nameLower.includes("alarm")) return <Clock className="h-5 w-5" />;
  if (nameLower.includes("mountain") || nameLower.includes("waterfall")) return <Mountain className="h-5 w-5" />;
  if (nameLower.includes("clock")) return <Clock className="h-5 w-5" />;
  if (nameLower.includes("star") || nameLower.includes("night")) return <Star className="h-5 w-5" />;

  // Then check category
  switch (categoryLower) {
    case "nature":
      return <Trees className="h-5 w-5" />;
    case "places":
      return <Building className="h-5 w-5" />;
    case "urban":
      return <Building2 className="h-5 w-5" />;
    case "animals":
      return <Rabbit className="h-5 w-5" />;
    case "transport":
      return <Car className="h-5 w-5" />;
    case "things":
      return <Package className="h-5 w-5" />;
    case "noise":
      return <Radio className="h-5 w-5" />;
    case "binaural":
      return <Headphones className="h-5 w-5" />;
    case "rain":
      return <CloudRain className="h-5 w-5" />;
    default:
      return <Music className="h-5 w-5" />;
  }
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
      // Nature
      { id: "nature-campfire", name: "Campfire", icon: getSoundIcon("campfire", "nature"), audioUrl: "/sounds/nature/campfire.mp3", volume: 50, playing: false, category: "nature" },
      { id: "nature-waterfall", name: "Waterfall", icon: getSoundIcon("waterfall", "nature"), audioUrl: "/sounds/nature/waterfall.mp3", volume: 50, playing: false, category: "nature" },
      { id: "nature-waves", name: "Waves", icon: getSoundIcon("waves", "nature"), audioUrl: "/sounds/nature/waves.mp3", volume: 50, playing: false, category: "nature" },
      { id: "nature-river", name: "River", icon: getSoundIcon("river", "nature"), audioUrl: "/sounds/nature/river.mp3", volume: 50, playing: false, category: "nature" },
      { id: "nature-jungle", name: "Jungle", icon: getSoundIcon("jungle", "nature"), audioUrl: "/sounds/nature/jungle.mp3", volume: 50, playing: false, category: "nature" },
      { id: "nature-wind", name: "Wind", icon: getSoundIcon("wind", "nature"), audioUrl: "/sounds/nature/wind.mp3", volume: 50, playing: false, category: "nature" },
      { id: "nature-droplets", name: "Droplets", icon: getSoundIcon("droplets", "nature"), audioUrl: "/sounds/nature/droplets.mp3", volume: 50, playing: false, category: "nature" },
      { id: "nature-howling-wind", name: "Howling Wind", icon: getSoundIcon("howling wind", "nature"), audioUrl: "/sounds/nature/howling-wind.mp3", volume: 50, playing: false, category: "nature" },
      { id: "nature-walk-in-snow", name: "Walk in Snow", icon: getSoundIcon("walk in snow", "nature"), audioUrl: "/sounds/nature/walk-in-snow.mp3", volume: 50, playing: false, category: "nature" },
      { id: "nature-walk-on-gravel", name: "Walk on Gravel", icon: getSoundIcon("walk on gravel", "nature"), audioUrl: "/sounds/nature/walk-on-gravel.mp3", volume: 50, playing: false, category: "nature" },
      { id: "nature-walk-on-leaves", name: "Walk on Leaves", icon: getSoundIcon("walk on leaves", "nature"), audioUrl: "/sounds/nature/walk-on-leaves.mp3", volume: 50, playing: false, category: "nature" },
      { id: "nature-wind-in-trees", name: "Wind in Trees", icon: getSoundIcon("wind in trees", "nature"), audioUrl: "/sounds/nature/wind-in-trees.mp3", volume: 50, playing: false, category: "nature" },

      // Animals
      { id: "animals-beehive", name: "Beehive", icon: getSoundIcon("beehive", "animals"), audioUrl: "/sounds/animals/beehive.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-birds", name: "Birds", icon: getSoundIcon("birds", "animals"), audioUrl: "/sounds/animals/birds.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-cat-purring", name: "Cat Purring", icon: getSoundIcon("cat purring", "animals"), audioUrl: "/sounds/animals/cat-purring.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-chickens", name: "Chickens", icon: getSoundIcon("chickens", "animals"), audioUrl: "/sounds/animals/chickens.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-cows", name: "Cows", icon: getSoundIcon("cows", "animals"), audioUrl: "/sounds/animals/cows.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-crickets", name: "Crickets", icon: getSoundIcon("crickets", "animals"), audioUrl: "/sounds/animals/crickets.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-crows", name: "Crows", icon: getSoundIcon("crows", "animals"), audioUrl: "/sounds/animals/crows.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-dog-barking", name: "Dog Barking", icon: getSoundIcon("dog barking", "animals"), audioUrl: "/sounds/animals/dog-barking.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-frog", name: "Frog", icon: getSoundIcon("frog", "animals"), audioUrl: "/sounds/animals/frog.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-horse-galopp", name: "Horse Galopp", icon: getSoundIcon("horse galopp", "animals"), audioUrl: "/sounds/animals/horse-galopp.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-owl", name: "Owl", icon: getSoundIcon("owl", "animals"), audioUrl: "/sounds/animals/owl.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-seagulls", name: "Seagulls", icon: getSoundIcon("seagulls", "animals"), audioUrl: "/sounds/animals/seagulls.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-sheep", name: "Sheep", icon: getSoundIcon("sheep", "animals"), audioUrl: "/sounds/animals/sheep.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-whale", name: "Whale", icon: getSoundIcon("whale", "animals"), audioUrl: "/sounds/animals/whale.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-wolf", name: "Wolf", icon: getSoundIcon("wolf", "animals"), audioUrl: "/sounds/animals/wolf.mp3", volume: 50, playing: false, category: "animals" },
      { id: "animals-woodpecker", name: "Woodpecker", icon: getSoundIcon("woodpecker", "animals"), audioUrl: "/sounds/animals/woodpecker.mp3", volume: 50, playing: false, category: "animals" },

      // Binaural
      { id: "binaural-alpha", name: "Binaural Alpha", icon: getSoundIcon("binaural alpha", "binaural"), audioUrl: "/sounds/binaural/binaural-alpha.wav", volume: 50, playing: false, category: "binaural" },
      { id: "binaural-beta", name: "Binaural Beta", icon: getSoundIcon("binaural beta", "binaural"), audioUrl: "/sounds/binaural/binaural-beta.wav", volume: 50, playing: false, category: "binaural" },
      { id: "binaural-delta", name: "Binaural Delta", icon: getSoundIcon("binaural delta", "binaural"), audioUrl: "/sounds/binaural/binaural-delta.wav", volume: 50, playing: false, category: "binaural" },
      { id: "binaural-gamma", name: "Binaural Gamma", icon: getSoundIcon("binaural gamma", "binaural"), audioUrl: "/sounds/binaural/binaural-gamma.wav", volume: 50, playing: false, category: "binaural" },
      { id: "binaural-theta", name: "Binaural Theta", icon: getSoundIcon("binaural theta", "binaural"), audioUrl: "/sounds/binaural/binaural-theta.wav", volume: 50, playing: false, category: "binaural" },

      // Noise
      { id: "noise-brown", name: "Brown Noise", icon: getSoundIcon("brown noise", "noise"), audioUrl: "/sounds/noise/brown-noise.wav", volume: 50, playing: false, category: "noise" },
      { id: "noise-pink", name: "Pink Noise", icon: getSoundIcon("pink noise", "noise"), audioUrl: "/sounds/noise/pink-noise.wav", volume: 50, playing: false, category: "noise" },
      { id: "noise-white", name: "White Noise", icon: getSoundIcon("white noise", "noise"), audioUrl: "/sounds/noise/white-noise.wav", volume: 50, playing: false, category: "noise" },

      // Places
      { id: "places-airport", name: "Airport", icon: getSoundIcon("airport", "places"), audioUrl: "/sounds/places/airport.mp3", volume: 50, playing: false, category: "places" },
      { id: "places-carousel", name: "Carousel", icon: getSoundIcon("carousel", "places"), audioUrl: "/sounds/places/carousel.mp3", volume: 50, playing: false, category: "places" },
      { id: "places-church", name: "Church", icon: getSoundIcon("church", "places"), audioUrl: "/sounds/places/church.mp3", volume: 50, playing: false, category: "places" },
      { id: "places-construction-site", name: "Construction Site", icon: getSoundIcon("construction site", "places"), audioUrl: "/sounds/places/construction-site.mp3", volume: 50, playing: false, category: "places" },
      { id: "places-crowded-bar", name: "Crowded Bar", icon: getSoundIcon("crowded bar", "places"), audioUrl: "/sounds/places/crowded-bar.mp3", volume: 50, playing: false, category: "places" },
      { id: "places-laboratory", name: "Laboratory", icon: getSoundIcon("laboratory", "places"), audioUrl: "/sounds/places/laboratory.mp3", volume: 50, playing: false, category: "places" },
      { id: "places-laundry-room", name: "Laundry Room", icon: getSoundIcon("laundry room", "places"), audioUrl: "/sounds/places/laundry-room.mp3", volume: 50, playing: false, category: "places" },
      { id: "places-library", name: "Library", icon: getSoundIcon("library", "places"), audioUrl: "/sounds/places/library.mp3", volume: 50, playing: false, category: "places" },
      { id: "places-night-village", name: "Night Village", icon: getSoundIcon("night village", "places"), audioUrl: "/sounds/places/night-village.mp3", volume: 50, playing: false, category: "places" },
      { id: "places-office", name: "Office", icon: getSoundIcon("office", "places"), audioUrl: "/sounds/places/office.mp3", volume: 50, playing: false, category: "places" },
      { id: "places-restaurant", name: "Restaurant", icon: getSoundIcon("restaurant", "places"), audioUrl: "/sounds/places/restaurant.mp3", volume: 50, playing: false, category: "places" },
      { id: "places-subway-station", name: "Subway Station", icon: getSoundIcon("subway station", "places"), audioUrl: "/sounds/places/subway-station.mp3", volume: 50, playing: false, category: "places" },
      { id: "places-supermarket", name: "Supermarket", icon: getSoundIcon("supermarket", "places"), audioUrl: "/sounds/places/supermarket.mp3", volume: 50, playing: false, category: "places" },
      { id: "places-temple", name: "Temple", icon: getSoundIcon("temple", "places"), audioUrl: "/sounds/places/temple.mp3", volume: 50, playing: false, category: "places" },
      { id: "places-underwater", name: "Underwater", icon: getSoundIcon("underwater", "places"), audioUrl: "/sounds/places/underwater.mp3", volume: 50, playing: false, category: "places" },

      // Rain
      { id: "rain-light", name: "Light Rain", icon: getSoundIcon("light rain", "rain"), audioUrl: "/sounds/rain/light-rain.mp3", volume: 50, playing: false, category: "rain" },
      { id: "rain-heavy", name: "Heavy Rain", icon: getSoundIcon("heavy rain", "rain"), audioUrl: "/sounds/rain/heavy-rain.mp3", volume: 50, playing: false, category: "rain" },
      { id: "rain-window", name: "Rain on Window", icon: getSoundIcon("rain on window", "rain"), audioUrl: "/sounds/rain/rain-on-window.mp3", volume: 50, playing: false, category: "rain" },
      { id: "rain-thunder", name: "Thunder", icon: getSoundIcon("thunder", "rain"), audioUrl: "/sounds/rain/thunder.mp3", volume: 50, playing: false, category: "rain" },
      { id: "rain-on-car-roof", name: "Rain on Car Roof", icon: getSoundIcon("rain on car roof", "rain"), audioUrl: "/sounds/rain/rain-on-car-roof.mp3", volume: 50, playing: false, category: "rain" },
      { id: "rain-on-leaves", name: "Rain on Leaves", icon: getSoundIcon("rain on leaves", "rain"), audioUrl: "/sounds/rain/rain-on-leaves.mp3", volume: 50, playing: false, category: "rain" },
      { id: "rain-on-tent", name: "Rain on Tent", icon: getSoundIcon("rain on tent", "rain"), audioUrl: "/sounds/rain/rain-on-tent.mp3", volume: 50, playing: false, category: "rain" },
      { id: "rain-on-umbrella", name: "Rain on Umbrella", icon: getSoundIcon("rain on umbrella", "rain"), audioUrl: "/sounds/rain/rain-on-umbrella.mp3", volume: 50, playing: false, category: "rain" },

      // Urban
      { id: "urban-ambulance-siren", name: "Ambulance Siren", icon: getSoundIcon("ambulance siren", "urban"), audioUrl: "/sounds/urban/ambulance-siren.mp3", volume: 50, playing: false, category: "urban" },
      { id: "urban-busy-street", name: "Busy Street", icon: getSoundIcon("busy street", "urban"), audioUrl: "/sounds/urban/busy-street.mp3", volume: 50, playing: false, category: "urban" },
      { id: "urban-crowd", name: "Crowd", icon: getSoundIcon("crowd", "urban"), audioUrl: "/sounds/urban/crowd.mp3", volume: 50, playing: false, category: "urban" },
      { id: "urban-fireworks", name: "Fireworks", icon: getSoundIcon("fireworks", "urban"), audioUrl: "/sounds/urban/fireworks.mp3", volume: 50, playing: false, category: "urban" },
      { id: "urban-highway", name: "Highway", icon: getSoundIcon("highway", "urban"), audioUrl: "/sounds/urban/highway.mp3", volume: 50, playing: false, category: "urban" },
      { id: "urban-road", name: "Road", icon: getSoundIcon("road", "urban"), audioUrl: "/sounds/urban/road.mp3", volume: 50, playing: false, category: "urban" },
      { id: "urban-traffic", name: "Traffic", icon: getSoundIcon("traffic", "urban"), audioUrl: "/sounds/urban/traffic.mp3", volume: 50, playing: false, category: "urban" },

      // Things
      { id: "things-boiling-water", name: "Boiling Water", icon: getSoundIcon("boiling water", "things"), audioUrl: "/sounds/things/boiling-water.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-bubbles", name: "Bubbles", icon: getSoundIcon("bubbles", "things"), audioUrl: "/sounds/things/bubbles.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-ceiling-fan", name: "Ceiling Fan", icon: getSoundIcon("ceiling fan", "things"), audioUrl: "/sounds/things/ceiling-fan.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-clock", name: "Clock", icon: getSoundIcon("clock", "things"), audioUrl: "/sounds/things/clock.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-dryer", name: "Dryer", icon: getSoundIcon("dryer", "things"), audioUrl: "/sounds/things/dryer.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-keyboard", name: "Keyboard", icon: getSoundIcon("keyboard", "things"), audioUrl: "/sounds/things/keyboard.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-morse-code", name: "Morse Code", icon: getSoundIcon("morse code", "things"), audioUrl: "/sounds/things/morse-code.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-paper", name: "Paper", icon: getSoundIcon("paper", "things"), audioUrl: "/sounds/things/paper.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-singing-bowl", name: "Singing Bowl", icon: getSoundIcon("singing bowl", "things"), audioUrl: "/sounds/things/singing-bowl.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-slide-projector", name: "Slide Projector", icon: getSoundIcon("slide projector", "things"), audioUrl: "/sounds/things/slide-projector.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-tuning-radio", name: "Tuning Radio", icon: getSoundIcon("tuning radio", "things"), audioUrl: "/sounds/things/tuning-radio.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-typewriter", name: "Typewriter", icon: getSoundIcon("typewriter", "things"), audioUrl: "/sounds/things/typewriter.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-vinyl-effect", name: "Vinyl Effect", icon: getSoundIcon("vinyl effect", "things"), audioUrl: "/sounds/things/vinyl-effect.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-washing-machine", name: "Washing Machine", icon: getSoundIcon("washing machine", "things"), audioUrl: "/sounds/things/washing-machine.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-wind-chimes", name: "Wind Chimes", icon: getSoundIcon("wind chimes", "things"), audioUrl: "/sounds/things/wind-chimes.mp3", volume: 50, playing: false, category: "things" },
      { id: "things-windshield-wipers", name: "Windshield Wipers", icon: getSoundIcon("windshield wipers", "things"), audioUrl: "/sounds/things/windshield-wipers.mp3", volume: 50, playing: false, category: "things" },

      // Transport
      { id: "transport-airplane", name: "Airplane", icon: getSoundIcon("airplane", "transport"), audioUrl: "/sounds/transport/airplane.mp3", volume: 50, playing: false, category: "transport" },
      { id: "transport-inside-a-train", name: "Inside a Train", icon: getSoundIcon("inside a train", "transport"), audioUrl: "/sounds/transport/inside-a-train.mp3", volume: 50, playing: false, category: "transport" },
      { id: "transport-rowing-boat", name: "Rowing Boat", icon: getSoundIcon("rowing boat", "transport"), audioUrl: "/sounds/transport/rowing-boat.mp3", volume: 50, playing: false, category: "transport" },
      { id: "transport-sailboat", name: "Sailboat", icon: getSoundIcon("sailboat", "transport"), audioUrl: "/sounds/transport/sailboat.mp3", volume: 50, playing: false, category: "transport" },
      { id: "transport-submarine", name: "Submarine", icon: getSoundIcon("submarine", "transport"), audioUrl: "/sounds/transport/submarine.mp3", volume: 50, playing: false, category: "transport" },
      { id: "transport-train", name: "Train", icon: getSoundIcon("train", "transport"), audioUrl: "/sounds/transport/train.mp3", volume: 50, playing: false, category: "transport" },

      // Alarme (sem categoria)
      { id: "alarm", name: "Alarm", icon: getSoundIcon("alarm", "things"), audioUrl: "/sounds/alarm.mp3", volume: 50, playing: false, category: "things" },
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
