"use client";

import React, {
  useCallback,
  useEffect,
  useState,
  memo,
  useMemo,
  useRef,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  APP_ITEMS,
  SETTINGS_APP,
  type AppMenuItem,
  type AppId,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";

type DockProps = {
  openApp: (appId: AppId) => void;
  openSettings: () => void;
  activeApps: AppId[];
};

const DOCK_APPS = [...APP_ITEMS, SETTINGS_APP];

// Constants for magnification effect
const ICON_SIZE = 48; // Base size in pixels
const MAGNIFICATION = 1.5; // How much to scale on hover
const MAGNET_DISTANCE = 100; // How far away the icons start to get affected

const DockItem = memo(
  ({
    app,
    isActive,
    mouseX,
    index,
    totalItems,
    onClick,
  }: {
    app: AppMenuItem;
    isActive: boolean;
    mouseX: number;
    index: number;
    totalItems: number;
    onClick: () => void;
  }) => {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const itemRef = React.useRef<HTMLDivElement>(null);
    const [itemPosition, setItemPosition] = useState(0);

    // Calculate distance from mouse to determine scale
    const distance = useMotionValue(0);

    // Update distance whenever mouseX changes
    useEffect(() => {
      distance.set(Math.abs(mouseX - itemPosition));
    }, [mouseX, itemPosition, distance]);

    const scale = useTransform(
      distance,
      [0, MAGNET_DISTANCE],
      [MAGNIFICATION, 1]
    );

    // Add spring physics for smooth animation
    const springScale = useSpring(scale, {
      damping: 20,
      stiffness: 350,
    });

    // Calculate this item's position for magnification effect
    useEffect(() => {
      if (!itemRef.current) return;
      const rect = itemRef.current.getBoundingClientRect();
      setItemPosition(rect.left + rect.width / 2);
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      },
      [onClick]
    );

    const shortcutLabel = app.shortcut ? ` (${app.shortcut})` : "";

    return (
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <motion.div
            ref={itemRef}
            style={{ scale: springScale }}
            onMouseEnter={() => {
              setTooltipOpen(true);
              setIsHovered(true);
            }}
            onMouseLeave={() => {
              setTooltipOpen(false);
              setIsHovered(false);
            }}
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                delay: 0.03 * index,
                type: "spring",
                stiffness: 400,
                damping: 25,
              },
            }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              className={cn(
                "relative flex items-center justify-center w-12 h-12 p-0 rounded-xl",
                "bg-card/80 backdrop-blur-md shadow-sm border border-white/10",
                "hover:bg-zinc-500/20 transition-all duration-150",
                isActive && "bg-white/30"
              )}
              whileHover={{
                y: -8,
                transition: { type: "spring", stiffness: 500, damping: 20 },
              }}
              whileTap={{ y: -2 }}
            >
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "w-full h-full p-0 transition-colors duration-150",
                  "flex items-center justify-center"
                )}
                aria-label={`Open ${app.label}${shortcutLabel}`}
                onClick={() => {
                  onClick();
                  setTooltipOpen(false);
                }}
                onKeyDown={handleKeyDown}
                tabIndex={0}
              >
                <motion.div
                  animate={{
                    rotate: isHovered && !isActive ? [0, -5, 5, -5, 5, 0] : 0,
                    transition: { duration: 0.5, ease: "easeInOut" },
                  }}
                  className="text-foreground/90"
                >
                  {app.icon}
                </motion.div>
              </Button>
            </motion.div>
            <AnimatePresence>
              {isActive && (
                <motion.div
                  className="absolute -bottom-1.5 h-1 w-1.5 rounded-full bg-white"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    transition: {
                      type: "spring",
                      stiffness: 500,
                      damping: 25,
                    },
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  layoutId={`dot-${app.id}`}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="flex items-center gap-4 bg-black/80 backdrop-blur-md text-white border-white/10 rounded-lg px-3 py-1.5"
          sideOffset={8}
          style={{ zIndex: 9999 }}
        >
          <span className="text-xs font-medium">{app.label}</span>
          {app.shortcut && (
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-black/50 px-1.5 font-mono text-[10px] font-medium text-white/80 opacity-100">
              <span className="text-xs">{app.shortcut}</span>
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }
);

DockItem.displayName = "DockItem";

export function Dock({ openApp, openSettings, activeApps }: DockProps) {
  const mouseX = useMotionValue(0);
  const dockRef = useRef<HTMLDivElement>(null);

  // Track mouse position for magnification effect
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dockRef.current) return;
      const rect = dockRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      mouseX.set(x);
    },
    [mouseX]
  );

  // Reset magnification when mouse leaves
  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
  }, [mouseX]);

  // Use a more efficient approach with Set for active apps
  const isAppActive = useCallback(
    (appId: string) => activeApps.includes(appId as AppId),
    [activeApps]
  );

  const handleOpenApp = useCallback(
    (appId: string) => {
      if (appId === "settings") {
        openApp("settings");
      } else {
        openApp(appId as AppId);
      }
    },
    [openApp]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const index = Number.parseInt(e.key) - 1;
        if (index < DOCK_APPS.length) {
          const appId = DOCK_APPS[index].id;
          handleOpenApp(appId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleOpenApp]);

  const regularApps = useMemo(() => DOCK_APPS.slice(0, -1), []);
  const settingsApp = useMemo(() => DOCK_APPS[DOCK_APPS.length - 1], []);
  const allApps = [...regularApps, settingsApp];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 flex justify-center mb-4"
      style={{ zIndex: 9999 }}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="px-3 py-2 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg"
        style={{ isolation: "isolate" }}
        role="toolbar"
        aria-label="Application dock"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        ref={dockRef}
        whileHover={{
          y: -4,
          transition: { duration: 0.3, ease: "easeOut" },
        }}
      >
        <TooltipProvider>
          <div className="flex items-end h-14 gap-1.5">
            {regularApps.map((app, index) => (
              <DockItem
                key={app.id}
                app={app}
                isActive={isAppActive(app.id)}
                mouseX={mouseX.get()}
                index={index}
                totalItems={allApps.length}
                onClick={() => handleOpenApp(app.id)}
              />
            ))}
            <motion.div
              key="divider"
              className="w-px h-8 bg-white/20 mx-2"
              initial={{ scaleY: 0 }}
              animate={{
                scaleY: 1,
                transition: {
                  delay: 0.2,
                  duration: 0.3,
                  ease: "easeOut",
                },
              }}
            />
            <DockItem
              key={settingsApp.id}
              app={settingsApp}
              isActive={isAppActive(settingsApp.id)}
              mouseX={mouseX.get()}
              index={regularApps.length}
              totalItems={allApps.length}
              onClick={() => handleOpenApp(settingsApp.id)}
            />
          </div>
        </TooltipProvider>
      </motion.div>
    </div>
  );
}
