"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsWallpaperTab } from "./settings/SettingsWallpaperTab";
import { SettingsAppearanceTab } from "./settings/SettingsAppearanceTab";
import { SettingsAboutTab } from "./settings/SettingsAboutTab";
import { SettingsGeneralTab } from "./settings/SettingsGeneralTab";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useHotkeys } from "react-hotkeys-hook";
import {
  API_ENDPOINTS,
  CURRENCY_KEYS,
  COMMON_CURRENCIES as EXCHANGE_RATE_COMMON_CURRENCIES,
} from "./exchange-rate";
import { loadAndCleanCurrency } from "@/utils/localStorageUtils";

interface SettingsProps {
  wallpaper: string;
  setWallpaper: (wallpaper: string) => void;
  font: string;
  setFont: (font: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  initialTab?: TabValue;
}

interface CurrencyState {
  base: string;
  target: string;
}

type TabValue = "general" | "wallpaper" | "appearance" | "about";

const COMMON_CURRENCIES = [...EXCHANGE_RATE_COMMON_CURRENCIES];

const DEFAULT_WALLPAPERS = ["/wallpapers/default.webp", "/wallpapers/1.webp"];

const CUSTOM_WALLPAPERS_KEY = "custom_wallpapers";

interface SettingsState {
  customWallpapers: string[];
  selectedWallpaper: string;
  currencies: string[];
  currencyState: CurrencyState;
  openBase: boolean;
  openTarget: boolean;
  baseSearch: string;
  targetSearch: string;
  filteredBase: string[];
  filteredTarget: string[];
  isLoading: boolean;
  error: string | null;
  font: string;
}

const useSettingsState = () => {
  const [state, setState] = useState<SettingsState>({
    customWallpapers: [],
    selectedWallpaper: DEFAULT_WALLPAPERS[0],
    currencies: COMMON_CURRENCIES,
    currencyState: {
      base: loadAndCleanCurrency(CURRENCY_KEYS.base, "usd"),
      target: loadAndCleanCurrency(CURRENCY_KEYS.target, "brl"),
    },
    openBase: false,
    openTarget: false,
    baseSearch: "",
    targetSearch: "",
    filteredBase: COMMON_CURRENCIES,
    filteredTarget: COMMON_CURRENCIES,
    isLoading: false,
    error: null,
    font: "system",
  });

  const { setTheme } = useTheme();

  useHotkeys("meta+1", () => setTheme("system"), { preventDefault: true });
  useHotkeys("meta+2", () => setTheme("light"), { preventDefault: true });
  useHotkeys("meta+3", () => setTheme("dark"), { preventDefault: true });

  return {
    state,
    setState,
  };
};

interface SettingsWallpaperTabProps {
  wallpaper: string;
  setWallpaper: (wallpaper: string) => void;
  selectedWallpaper: string;
  setSelectedWallpaper: (wallpaper: string) => void;
  customWallpapers: string[];
  setCustomWallpapers: (wallpapers: string[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  wallpapers: string[];
}

export function Settings({
  wallpaper,
  setWallpaper,
  font: propFont,
  setFont,
  theme: propTheme,
  setTheme: setPropTheme,
  initialTab = "general",
}: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(
    null
  ) as React.RefObject<HTMLInputElement>;
  const [tab, setTab] = useState<TabValue>(initialTab);

  const { state, setState } = useSettingsState();

  const {
    customWallpapers,
    selectedWallpaper,
    currencies,
    currencyState,
    openBase,
    openTarget,
    baseSearch,
    targetSearch,
    filteredBase,
    filteredTarget,
    isLoading,
    error,
    font: stateFont,
  } = state;

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type.", {
          description: "Please upload a JPEG, PNG, WEBP, or GIF image.",
        });
        return;
      }

      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File too large.", {
          description: "Please upload an image smaller than 50MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const result = event.target?.result as string;
          const updatedWallpapers = [...customWallpapers, result];
          setState((prev: SettingsState) => ({
            ...prev,
            customWallpapers: updatedWallpapers,
          }));
          localStorage.setItem(
            CUSTOM_WALLPAPERS_KEY,
            JSON.stringify(updatedWallpapers)
          );
          setState((prev: SettingsState) => ({
            ...prev,
            selectedWallpaper: result,
          }));
          setWallpaper(result);
          toast.success("Wallpaper added", {
            description: "Your custom wallpaper has been added successfully.",
          });
        } catch (error) {
          toast.error("Failed to process wallpaper. Please try again.");
        }
      };
      reader.onerror = () => {
        toast.error("Failed to read file. Please try again.");
      };
      reader.readAsDataURL(file);
    },
    [customWallpapers, setWallpaper, setState]
  );

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.currencies);
        if (!res.ok) throw new Error("Failed to fetch currencies");
        const data = await res.json();
        setState((prev: SettingsState) => ({
          ...prev,
          currencies: Object.keys(data),
        }));
      } catch (error) {
        toast.error("Failed to fetch currencies. Using default list.");
        setState((prev: SettingsState) => ({
          ...prev,
          currencies: COMMON_CURRENCIES,
        }));
      }
    };
    fetchCurrencies();
  }, [setState]);

  useEffect(() => {
    try {
      const currentStoredBaseRaw = localStorage.getItem(CURRENCY_KEYS.base);
      const currentStoredTargetRaw = localStorage.getItem(CURRENCY_KEYS.target);

      const cleanStoredBase =
        currentStoredBaseRaw !== null
          ? loadAndCleanCurrency(CURRENCY_KEYS.base, currencyState.base)
          : currencyState.base;

      const cleanStoredTarget =
        currentStoredTargetRaw !== null
          ? loadAndCleanCurrency(CURRENCY_KEYS.target, currencyState.target)
          : currencyState.target;

      const baseChanged = cleanStoredBase !== currencyState.base;
      const targetChanged = cleanStoredTarget !== currencyState.target;

      if (baseChanged || targetChanged) {
        if (baseChanged) {
          localStorage.setItem(
            CURRENCY_KEYS.base,
            JSON.stringify(currencyState.base)
          );
        }
        if (targetChanged) {
          localStorage.setItem(
            CURRENCY_KEYS.target,
            JSON.stringify(currencyState.target)
          );
        }

        const event = new CustomEvent("currency_changed", {
          detail: {
            base: currencyState.base,
            target: currencyState.target,
          },
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      toast.error("Failed to save currency settings.");
    }
  }, [currencyState]);

  useEffect(() => {
    if (baseSearch.trim() === "") {
      setState((prev: SettingsState) => ({
        ...prev,
        filteredBase: currencies,
      }));
    } else {
      const searchLower = baseSearch.toLowerCase();
      const filtered = currencies.filter((currency) =>
        currency.toLowerCase().includes(searchLower)
      );
      setState((prev: SettingsState) => ({
        ...prev,
        filteredBase: filtered,
      }));
    }
  }, [baseSearch, currencies, setState]);

  useEffect(() => {
    if (targetSearch.trim() === "") {
      setState((prev: SettingsState) => ({
        ...prev,
        filteredTarget: currencies,
      }));
    } else {
      const searchLower = targetSearch.toLowerCase();
      const filtered = currencies.filter((currency) =>
        currency.toLowerCase().includes(searchLower)
      );
      setState((prev: SettingsState) => ({
        ...prev,
        filteredTarget: filtered,
      }));
    }
  }, [targetSearch, currencies, setState]);

  useEffect(() => {
    const handler = (e: CustomEvent<TabValue>) => {
      if (e.detail) setTab(e.detail);
    };
    window.addEventListener("open-settings-tab", handler as EventListener);
    return () =>
      window.removeEventListener("open-settings-tab", handler as EventListener);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        className="h-full relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Tabs
          value={tab}
          onValueChange={(value: string) => setTab(value as TabValue)}
          className="flex flex-col h-full"
        >
          <TabsList className="grid grid-cols-4 bg-muted/30 backdrop-blur-sm">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-background/70"
              aria-label="General settings"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="wallpaper"
              className="data-[state=active]:bg-background/70"
              aria-label="Wallpaper settings (⌘+1)"
            >
              Wallpaper
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-background/70"
              aria-label="Appearance settings (⌘+2)"
            >
              Appearance
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="data-[state=active]:bg-background/70"
              aria-label="About (⌘+3)"
            >
              About
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100%-40px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="general" className="p-6">
                  <SettingsGeneralTab />
                </TabsContent>
                <TabsContent value="wallpaper" className="space-y-8 p-6">
                  <SettingsWallpaperTab
                    wallpaper={wallpaper}
                    setWallpaper={setWallpaper}
                    selectedWallpaper={selectedWallpaper}
                    setSelectedWallpaper={(newWallpaper: string) =>
                      setState((prev: SettingsState) => ({
                        ...prev,
                        selectedWallpaper: newWallpaper,
                      }))
                    }
                    customWallpapers={customWallpapers}
                    setCustomWallpapers={(wallpapers: string[]) =>
                      setState((prev: SettingsState) => ({
                        ...prev,
                        customWallpapers: wallpapers,
                      }))
                    }
                    fileInputRef={fileInputRef}
                    handleFileUpload={handleFileUpload}
                    wallpapers={DEFAULT_WALLPAPERS}
                  />
                </TabsContent>
                <TabsContent value="appearance" className="space-y-10 p-4">
                  <SettingsAppearanceTab
                    font={propFont}
                    setFont={setFont}
                    theme={theme || "dark"}
                    setTheme={setTheme}
                    setSystemTheme={setPropTheme}
                    base={currencyState.base}
                    setBase={(base: string) =>
                      setState((prev: SettingsState) => ({
                        ...prev,
                        currencyState: { ...prev.currencyState, base },
                      }))
                    }
                    target={currencyState.target}
                    setTarget={(target: string) =>
                      setState((prev: SettingsState) => ({
                        ...prev,
                        currencyState: { ...prev.currencyState, target },
                      }))
                    }
                    currencies={currencies}
                    openBase={openBase}
                    setOpenBase={(open: boolean) =>
                      setState((prev: SettingsState) => ({
                        ...prev,
                        openBase: open,
                      }))
                    }
                    openTarget={openTarget}
                    setOpenTarget={(open: boolean) =>
                      setState((prev: SettingsState) => ({
                        ...prev,
                        openTarget: open,
                      }))
                    }
                    baseSearch={baseSearch}
                    setBaseSearch={(search: string) =>
                      setState((prev: SettingsState) => ({
                        ...prev,
                        baseSearch: search,
                      }))
                    }
                    targetSearch={targetSearch}
                    setTargetSearch={(search: string) =>
                      setState((prev: SettingsState) => ({
                        ...prev,
                        targetSearch: search,
                      }))
                    }
                    filteredBase={filteredBase}
                    filteredTarget={filteredTarget}
                  />
                </TabsContent>
                <TabsContent value="about" className="p-6">
                  <SettingsAboutTab />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
        </Tabs>
      </motion.div>
    </TooltipProvider>
  );
}
