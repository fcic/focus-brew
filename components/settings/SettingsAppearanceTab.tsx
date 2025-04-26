import React from "react";
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
import { ChevronsUpDown, Check, ArrowRightLeftIcon } from "lucide-react";
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
    <>
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-1">Theme</h2>
        <p className="text-muted-foreground text-xs mb-4">
          Switch between light, dark, or system theme.
        </p>
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
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-1">Temperature Unit</h2>
        <p className="text-muted-foreground text-xs mb-4">
          Choose Celsius or Fahrenheit for weather display.
        </p>
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
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-1">Currency</h2>
        <p className="text-muted-foreground text-xs mb-4">
          Choose which currencies to show in the top bar.
        </p>
        <div className="flex gap-2 items-center">
          {/* Base currency combobox */}
          <Popover open={openBase} onOpenChange={setOpenBase}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-24 justify-between border rounded px-2 py-1 bg-background text-xs flex items-center",
                  !base && "text-muted-foreground"
                )}
                role="combobox"
                aria-expanded={openBase}
              >
                {base ? base.toUpperCase() : "Base..."}
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-0">
              <Command>
                <CommandInput
                  value={baseSearch}
                  onValueChange={setBaseSearch}
                  placeholder="Search..."
                  className="h-7 text-xs px-2"
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
                            "mr-2 h-3 w-3",
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
          <ArrowRightLeftIcon className="h-4 w-4" />
          {/* Target currency combobox */}
          <Popover open={openTarget} onOpenChange={setOpenTarget}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-24 justify-between border rounded px-2 py-1 bg-background text-xs flex items-center",
                  !target && "text-muted-foreground"
                )}
                role="combobox"
                aria-expanded={openTarget}
              >
                {target ? target.toUpperCase() : "Target..."}
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-32 p-0">
              <Command>
                <CommandInput
                  value={targetSearch}
                  onValueChange={setTargetSearch}
                  placeholder="Search..."
                  className="h-7 text-xs px-2"
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
                            "mr-2 h-3 w-3",
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
      </div>
      <div>
        <h2 className="text-xl font-bold mb-1">Font</h2>
        <p className="text-muted-foreground text-xs mb-4">
          Select your preferred font for the UI.
        </p>
        <Select value={font} onValueChange={setFont}>
          <SelectTrigger className="w-[200px] bg-background/50 border-border/30">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent className="bg-background/90 backdrop-blur-md border-border/30">
            <SelectItem value="font-satoshi">Satoshi (Default)</SelectItem>
            <SelectItem value="font-sans">Nunito</SelectItem>
            <SelectItem value="font-serif">Roboto Slab</SelectItem>
            <SelectItem value="font-mono">Monospace</SelectItem>
            <SelectItem value="font-general-sans">General Sans</SelectItem>
            <SelectItem value="font-geist">Geist</SelectItem>
            <SelectItem value="font-chillax">Chillax</SelectItem>
            <SelectItem value="font-sentient">Sentient</SelectItem>
            <SelectItem value="font-gambetta">Gambetta</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
