"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { RotateCcwIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { SettingsWallpaperTab } from "./settings/SettingsWallpaperTab";
import { SettingsAppearanceTab } from "./settings/SettingsAppearanceTab";
import { SettingsAboutTab } from "./settings/SettingsAboutTab";

interface SettingsProps {
  wallpaper: string;
  setWallpaper: (wallpaper: string) => void;
  font: string;
  setFont: (font: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
}

const COMMON_CURRENCIES = [
  "usd",
  "eur",
  "gbp",
  "jpy",
  "cny",
  "aud",
  "cad",
  "chf",
  "sek",
  "nzd",
  "brl",
  "inr",
];

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
    "/wallpapers/default.jpg",
    "/wallpapers/1.png",
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

  // Currency state for settings
  const [base, setBase] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("currency_base") || "usd"
      : "usd"
  );
  const [target, setTarget] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("currency_target") || "brl"
      : "brl"
  );
  const [currencies, setCurrencies] = useState(COMMON_CURRENCIES);
  const [openBase, setOpenBase] = useState(false);
  const [openTarget, setOpenTarget] = useState(false);
  const [baseSearch, setBaseSearch] = useState("");
  const [targetSearch, setTargetSearch] = useState("");
  const filteredBase = baseSearch
    ? currencies.filter((cur) =>
        cur.toLowerCase().includes(baseSearch.toLowerCase())
      )
    : currencies;
  const filteredTarget = targetSearch
    ? currencies.filter((cur) =>
        cur.toLowerCase().includes(targetSearch.toLowerCase())
      )
    : currencies;
  useEffect(() => {
    // Fetch all available currencies for dropdown
    const fetchCurrencies = async () => {
      try {
        const url =
          "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json";
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCurrencies(Object.keys(data));
      } catch {
        setCurrencies(COMMON_CURRENCIES);
      }
    };
    fetchCurrencies();
  }, []);

  // Save to localStorage and notify ExchangeRate
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currency_base", base);
      window.dispatchEvent(
        new CustomEvent("currency_changed", { detail: { base, target } })
      );
    }
  }, [base]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currency_target", target);
      window.dispatchEvent(
        new CustomEvent("currency_changed", { detail: { base, target } })
      );
    }
  }, [target]);

  // Listen for custom event to open a specific tab
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (typeof e.detail === "string") setTab(e.detail);
    };
    window.addEventListener("open-settings-tab", handler as EventListener);
    return () =>
      window.removeEventListener("open-settings-tab", handler as EventListener);
  }, []);

  return (
    <TooltipProvider>
      <div className="h-full relative">
        {/* Botão de reset no canto superior direito */}
        <div className="absolute bottom-2 right-2 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                aria-label="Reset all settings"
              >
                <RotateCcwIcon className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Reset all settings</TooltipContent>
          </Tooltip>
        </div>
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="flex flex-col h-full"
        >
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
              <SettingsWallpaperTab
                wallpaper={wallpaper}
                setWallpaper={setWallpaper}
                selectedWallpaper={selectedWallpaper}
                setSelectedWallpaper={setSelectedWallpaper}
                customWallpapers={customWallpapers}
                setCustomWallpapers={setCustomWallpapers}
                fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                handleFileUpload={handleFileUpload}
                wallpapers={wallpapers}
              />
            </TabsContent>
            <TabsContent value="appearance" className="space-y-10 p-8">
              <SettingsAppearanceTab
                font={font}
                setFont={setFont}
                theme={theme}
                setTheme={setTheme}
                setSystemTheme={setSystemTheme}
                base={base}
                setBase={setBase}
                target={target}
                setTarget={setTarget}
                currencies={currencies}
                openBase={openBase}
                setOpenBase={setOpenBase}
                openTarget={openTarget}
                setOpenTarget={setOpenTarget}
                baseSearch={baseSearch}
                setBaseSearch={setBaseSearch}
                targetSearch={targetSearch}
                setTargetSearch={setTargetSearch}
                filteredBase={filteredBase}
                filteredTarget={filteredTarget}
              />
            </TabsContent>
            <TabsContent value="about" className="p-6">
              <SettingsAboutTab />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
