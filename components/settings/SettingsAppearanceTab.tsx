"use client";

import { motion } from "framer-motion";
import {
  ChevronsUpDown,
  Check,
  ArrowRightLeft,
  Sun,
  Moon,
  Monitor,
  Thermometer,
  Coins,
  Type,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  font: string;
  setFont: (font: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  setSystemTheme: (theme: string) => void;
  base: string;
  setBase: (base: string) => void;
  target: string;
  setTarget: (target: string) => void;
  currencies: string[];
  openBase: boolean;
  setOpenBase: (open: boolean) => void;
  openTarget: boolean;
  setOpenTarget: (open: boolean) => void;
  baseSearch: string;
  setBaseSearch: (s: string) => void;
  targetSearch: string;
  setTargetSearch: (s: string) => void;
  filteredBase: string[];
  filteredTarget: string[];
}

const fonts = [
  { value: "font-satoshi", label: "Satoshi (Default)" },
  { value: "font-sans", label: "Nunito" },
  { value: "font-serif", label: "Roboto Slab" },
  { value: "font-mono", label: "Monospace" },
  { value: "font-general-sans", label: "General Sans" },
  { value: "font-geist", label: "Geist" },
  { value: "font-chillax", label: "Chillax" },
  { value: "font-sentient", label: "Sentient" },
  { value: "font-gambetta", label: "Gambetta" },
];

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const temperatureUnits = [
  { value: "C", label: "Celsius (°C)" },
  { value: "F", label: "Fahrenheit (°F)" },
];

export function SettingsAppearanceTab({
  font,
  setFont,
  theme,
  setTheme,
  setSystemTheme,
  base,
  setBase,
  target,
  setTarget,
  currencies,
  openBase,
  setOpenBase,
  openTarget,
  setOpenTarget,
  baseSearch,
  setBaseSearch,
  targetSearch,
  setTargetSearch,
  filteredBase,
  filteredTarget,
}: Props) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Theme</h2>
                <p className="text-sm text-muted-foreground">
                  Switch between light, dark, or system theme.
                </p>
              </div>
            </div>
            <RadioGroup
              value={theme}
              onValueChange={(value) => {
                setTheme(value);
                setSystemTheme(value);
              }}
              className="flex flex-wrap gap-2"
            >
              {themes.map((t) => {
                const Icon = t.icon;
                return (
                  <Label
                    key={t.value}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors",
                      theme === t.value
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <RadioGroupItem
                      value={t.value}
                      id={`theme-${t.value}`}
                      className="sr-only"
                    />
                    <Icon className="h-4 w-4" />
                    <span>{t.label}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Thermometer className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Temperature Unit</h2>
                <p className="text-sm text-muted-foreground">
                  Choose Celsius or Fahrenheit for weather display.
                </p>
              </div>
            </div>
            <RadioGroup
              value={
                typeof window !== "undefined"
                  ? localStorage.getItem("weather_unit") || "C"
                  : "C"
              }
              onValueChange={(value) => {
                if (typeof window !== "undefined") {
                  localStorage.setItem("weather_unit", value);
                  window.dispatchEvent(
                    new CustomEvent("temperature_unit_changed", {
                      detail: value,
                    })
                  );
                }
              }}
              className="flex flex-wrap gap-2"
            >
              {temperatureUnits.map((unit) => (
                <Label
                  key={unit.value}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors",
                    (typeof window !== "undefined"
                      ? localStorage.getItem("weather_unit")
                      : "C") === unit.value
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <RadioGroupItem
                    value={unit.value}
                    id={`unit-${unit.value}`}
                    className="sr-only"
                  />
                  <span>{unit.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Currency</h2>
                <p className="text-sm text-muted-foreground">
                  Choose which currencies to show in the top bar.
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Popover open={openBase} onOpenChange={setOpenBase}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-28 justify-between border rounded-lg px-3 py-2 bg-background text-sm flex items-center transition-colors",
                      !base && "text-muted-foreground",
                      openBase && "border-primary/50"
                    )}
                    role="combobox"
                    aria-expanded={openBase}
                  >
                    {base ? base.toUpperCase() : "Base..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-36 p-0">
                  <Command>
                    <CommandInput
                      value={baseSearch}
                      onValueChange={setBaseSearch}
                      placeholder="Search..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No currency found.</CommandEmpty>
                      <CommandGroup>
                        {filteredBase.map((cur) => (
                          <CommandItem
                            key={cur}
                            value={cur}
                            onSelect={() => {
                              setBase(cur);
                              setOpenBase(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                base === cur ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {cur.toUpperCase()}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />

              <Popover open={openTarget} onOpenChange={setOpenTarget}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-28 justify-between border rounded-lg px-3 py-2 bg-background text-sm flex items-center transition-colors",
                      !target && "text-muted-foreground",
                      openTarget && "border-primary/50"
                    )}
                    role="combobox"
                    aria-expanded={openTarget}
                  >
                    {target ? target.toUpperCase() : "Target..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-36 p-0">
                  <Command>
                    <CommandInput
                      value={targetSearch}
                      onValueChange={setTargetSearch}
                      placeholder="Search..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No currency found.</CommandEmpty>
                      <CommandGroup>
                        {filteredTarget.map((cur) => (
                          <CommandItem
                            key={cur}
                            value={cur}
                            onSelect={() => {
                              setTarget(cur);
                              setOpenTarget(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                target === cur ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {cur.toUpperCase()}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Type className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">Font</h2>
                <p className="text-sm text-muted-foreground">
                  Select your preferred font for the UI.
                </p>
              </div>
            </div>
            <Select value={font} onValueChange={setFont}>
              <SelectTrigger className="w-[240px] bg-background/50 border-border/30">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent className="bg-background/90 backdrop-blur-md border-border/30">
                {fonts.map((f) => (
                  <SelectItem key={f.value} value={f.value} className={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
