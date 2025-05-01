import React, { useState, useEffect, useCallback } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { AppId, APP_ITEMS, SETTINGS_APP } from "@/lib/constants";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type CommandPaletteProps = {
  openApp: (appId: AppId) => void;
  openSettings: () => void;
  activeApps: AppId[];
};

export function CommandPalette({
  openApp,
  openSettings,
  activeApps,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (command: string) => {
      setOpen(false);

      // Handle app launching
      if (command.startsWith("app-")) {
        const appId = command.replace("app-", "") as AppId;
        openApp(appId);
        return;
      }

      // Handle general commands
      switch (command) {
        case "settings":
          openSettings();
          break;
        case "about":
          openSettings();
          break;
        default:
          break;
      }
    },
    [openApp, openSettings]
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="rounded-lg border-none bg-background/80 backdrop-blur-xl">
        <CommandInput
          placeholder="Digite um comando ou pesquise..."
          className="border-none bg-transparent"
        />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Aplicativos">
            {APP_ITEMS.map((app) => (
              <CommandItem
                key={app.id}
                value={`app-${app.id}`}
                onSelect={handleSelect}
                className={cn(
                  "flex items-center gap-2 px-2 py-3",
                  activeApps.includes(app.id) && "text-primary"
                )}
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="h-4 w-4">{app.icon}</span>
                  <span>{app.label}</span>
                </div>
                {app.getShortcutText && (
                  <CommandShortcut>{app.getShortcutText()}</CommandShortcut>
                )}
              </CommandItem>
            ))}
            <CommandSeparator />
            <CommandItem
              value="settings"
              onSelect={handleSelect}
              className="flex items-center gap-2 px-2 py-3"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="h-4 w-4">{SETTINGS_APP.icon}</span>
                <span>{SETTINGS_APP.label}</span>
              </div>
              {SETTINGS_APP.getShortcutText && (
                <CommandShortcut>
                  {SETTINGS_APP.getShortcutText()}
                </CommandShortcut>
              )}
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Ajuda">
            <CommandItem
              value="about"
              onSelect={handleSelect}
              className="flex items-center gap-2 px-2 py-3"
            >
              <div className="flex items-center gap-2 flex-1">
                <Info className="h-4 w-4" />
                <span>Sobre</span>
              </div>
              <CommandShortcut>⌘8</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
