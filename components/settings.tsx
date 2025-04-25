"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Upload, Check } from "lucide-react";
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

  const wallpapers = [
    "/wallpapers/default.jpg",
    // "/wallpapers/mountains.jpg",
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
        setSelectedWallpaper(result);
        setWallpaper(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full">
      <Tabs defaultValue="wallpaper" className="h-full">
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
                onValueChange={setTheme}
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
              <h3 className="text-lg font-medium mb-4">Font</h3>
              <Select value={font} onValueChange={setFont}>
                <SelectTrigger className="w-[200px] bg-background/50 border-border/30">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent className="bg-background/90 backdrop-blur-md border-border/30">
                  <SelectItem value="roboto-slab">Roboto Slab</SelectItem>
                  <SelectItem value="mono">Monospace</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="about" className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">About The Coffee App</h3>
              <p className="text-muted-foreground">
                A minimalist productivity app inspired by The Coffee design
                system. Built with Next.js 15, Tailwind CSS, and shadcn/ui.
              </p>
              <p className="text-muted-foreground">Version 1.0.0</p>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
