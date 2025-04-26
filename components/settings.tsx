"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Upload, Check, Trash2, RotateCcwIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface SettingsProps {
  wallpaper: string;
  setWallpaper: (wallpaper: string) => void;
  font: string;
  setFont: (font: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
}

export function Settings({
  wallpaper,
  setWallpaper,
  font,
  setFont,
  theme,
  setTheme,
}: SettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedWallpaper, setSelectedWallpaper] = useState(wallpaper);
  const { setTheme: setSystemTheme } = useTheme();
  const [customWallpapers, setCustomWallpapers] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("custom_wallpapers");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const wallpapers = [
    "/wallpapers/default.png",
    // "/wallpapers/forest.jpg",
    // "/wallpapers/ocean.jpg",
    // "/wallpapers/city.jpg",
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Add to custom wallpapers list
        const updatedWallpapers = [...customWallpapers, result];
        setCustomWallpapers(updatedWallpapers);

        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "custom_wallpapers",
            JSON.stringify(updatedWallpapers)
          );
        }

        // Set as current wallpaper
        setSelectedWallpaper(result);
        setWallpaper(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [tab, setTab] = useState("wallpaper");

  // Listen for custom event to open a specific tab
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (typeof e.detail === "string") setTab(e.detail);
    };
    window.addEventListener("open-settings-tab", handler as EventListener);
    return () => window.removeEventListener("open-settings-tab", handler as EventListener);
  }, []);

  return (
    <TooltipProvider>
      <div className="h-full relative">
        {/* Botão de reset no canto superior direito */}
        <div className="absolute bottom-2 right-2 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="destructive" onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.clear();
                  window.location.reload();
                }
              }} aria-label="Resetar todas as configurações">
                <RotateCcwIcon className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              Resetar todas as configurações
            </TooltipContent>
          </Tooltip>
        </div>
        <Tabs value={tab} onValueChange={setTab} className="flex flex-col h-full">
          <TabsList className="grid grid-cols-3 bg-muted/30 backdrop-blur-sm">
            <TabsTrigger
              value="wallpaper"
              className="data-[state=active]:bg-background/70"
            >
              Wallpaper
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-background/70"
            >
              Appearance
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="data-[state=active]:bg-background/70"
            >
              About
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100%-40px)]">
            <TabsContent value="wallpaper" className="space-y-8 p-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Choose Wallpaper</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Default wallpapers */}
                  {wallpapers.map((wp) => (
                    <div
                      key={wp}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                        selectedWallpaper === wp
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      onClick={() => {
                        setSelectedWallpaper(wp);
                        setWallpaper(wp);
                      }}
                    >
                      <img
                        src={wp || "/placeholder.svg"}
                        alt="Wallpaper"
                        className="w-full h-32 object-cover"
                      />
                      {selectedWallpaper === wp && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Custom uploaded wallpapers */}
                  {customWallpapers.map((wp, index) => (
                    <div
                      key={`custom-${index}`}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                        selectedWallpaper === wp
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      onClick={() => {
                        setSelectedWallpaper(wp);
                        setWallpaper(wp);
                      }}
                    >
                      <img
                        src={wp || "/placeholder.svg"}
                        alt={`Custom Wallpaper ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      {selectedWallpaper === wp && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      {/* Delete button using shadcn/ui Button */}
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute bottom-2 right-2 h-6 w-6 min-w-0 p-0"
                        onClick={e => {
                          e.stopPropagation();
                          const updated = customWallpapers.filter((_, i) => i !== index);
                          setCustomWallpapers(updated);
                          if (typeof window !== "undefined") {
                            localStorage.setItem("custom_wallpapers", JSON.stringify(updated));
                          }
                          if (selectedWallpaper === wp) {
                            setSelectedWallpaper("/wallpapers/default.png");
                            setWallpaper("/wallpapers/default.png");
                          }
                        }}
                        aria-label="Delete wallpaper"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">
                  Upload Custom Wallpaper
                </h3>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-background/50 border-border/30"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-8 p-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Theme</h3>
                <RadioGroup
                  value={theme}
                  onValueChange={(value) => {
                    setTheme(value);
                    setSystemTheme(value);
                  }}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system">System</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Temperature Unit</h3>
                <RadioGroup
                  value={
                    typeof window !== "undefined"
                      ? localStorage.getItem("weather_unit") || "C"
                      : "C"
                  }
                  onValueChange={(value) => {
                    if (typeof window !== "undefined") {
                      localStorage.setItem("weather_unit", value);
                      // Dispatch a custom event to notify the weather component
                      window.dispatchEvent(
                        new CustomEvent("temperature_unit_changed", {
                          detail: value,
                        })
                      );
                    }
                  }}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id="unit-c" />
                    <Label htmlFor="unit-c">Celsius (°C)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="F" id="unit-f" />
                    <Label htmlFor="unit-f">Fahrenheit (°F)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Font</h3>
                <Select value={font} onValueChange={setFont}>
                  <SelectTrigger className="w-[200px] bg-background/50 border-border/30">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/90 backdrop-blur-md border-border/30">
                    <SelectItem value="font-satoshi">Satoshi (Default)</SelectItem>
                    <SelectItem value="font-sans">Nunito</SelectItem>
                    <SelectItem value="font-serif">Roboto Slab</SelectItem>
                    <SelectItem value="font-mono">Monospace</SelectItem>
                    <SelectItem value="font-general-sans">
                      General Sans
                    </SelectItem>
                    <SelectItem value="font-geist">Geist</SelectItem>
                    <SelectItem value="font-chillax">Chillax</SelectItem>
                    <SelectItem value="font-sentient">Sentient</SelectItem>
                    <SelectItem value="font-gambetta">Gambetta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="about" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">About Coffee with Code</h3>
                <p className="text-muted-foreground">
                  Coffee with Code is your all-in-one minimalist productivity suite, crafted for creators and thinkers who love a calm, focused workspace. Enjoy a beautiful desktop with customizable wallpapers and fonts, a distraction-free menu bar, and a dock for quick access to your favorite tools.
                </p>
                <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                  <li>Tasks: Organize your todos and stay on top of your day.</li>
                  <li>Kanban: Visualize your workflow and manage projects with drag-and-drop boards.</li>
                  <li>Focus Timer: Boost your productivity with a Pomodoro-style timer.</li>
                  <li>Notes: Jot down quick notes or ideas in a clean notepad.</li>
                  <li>Ambient Sounds: Mix and play relaxing background sounds for deep work or relaxation.</li>
                  <li>Weather: Check the current weather right from your menu bar.</li>
                  <li>Settings: Personalize your experience with themes, wallpapers, and more.</li>
                </ul>
                <p className="text-muted-foreground">
                  Built with Next.js 15, Tailwind CSS, shadcn/ui, and a touch of Vibe Coding for a smooth, delightful experience. Open source, privacy-friendly, and designed for macOS vibes.
                </p>
                <p className="text-muted-foreground">Version 1.0.0</p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
