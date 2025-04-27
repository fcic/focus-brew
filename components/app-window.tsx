"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, Minus, Plus } from "lucide-react";
import { throttle } from "lodash";

const MIN_WINDOW_SIZE = {
  width: 300,
  height: 200,
} as const;

type Position = { x: number; y: number };
type Size = { width: number; height: number };
type ResizeDirection = "right" | "bottom" | "corner" | null;

interface AppWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
  position: Position;
  size: Size;
  onUpdate: (position: Position, size: Size) => void;
}

interface WindowControlProps {
  color: string;
  onClick?: (e: React.MouseEvent) => void;
  label: string;
  icon?: React.ReactNode;
  hoverColor?: string;
}

const WindowControl = ({
  color,
  onClick,
  label,
  icon,
  hoverColor,
}: WindowControlProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn(
        "h-3 w-3 rounded-full flex items-center justify-center transition-all duration-150",
        isHovered && hoverColor ? hoverColor : color,
        isHovered ? "shadow-inner" : ""
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {isHovered && icon && (
        <motion.span
          className="text-zinc-800/90 flex items-center justify-center w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {icon}
        </motion.span>
      )}
    </motion.div>
  );
};

// Add keyboard shortcut handling
const useKeyboardShortcuts = (onClose: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "w") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
};

// Window snapping guide positions
const SNAP_THRESHOLD = 20;
const SHOW_SNAP_GUIDES = false; // Disabled - no visual guides
const ENABLE_SNAPPING = false; // Disabled - no snapping functionality
const RESTRICT_TO_SCREEN = false; // Disabled - allow windows to move freely

const useWindowSnapping = (initialSize: Size) => {
  const [snapGuides, setSnapGuides] = useState<{
    vertical: number | null;
    horizontal: number | null;
  }>({ vertical: null, horizontal: null });

  const checkSnapping = useCallback(
    (pos: Position) => {
      const guides = {
        vertical: null as number | null,
        horizontal: null as number | null,
      };

      // Early return if window is not available or snapping is disabled
      if (typeof window === "undefined" || !ENABLE_SNAPPING) return guides;

      // Snap to screen edges
      if (Math.abs(pos.x) < SNAP_THRESHOLD) guides.vertical = 0;
      if (Math.abs(pos.y) < SNAP_THRESHOLD) guides.horizontal = 0;

      // Snap to screen center
      const screenCenter = window.innerWidth / 2 - initialSize.width / 2;
      if (Math.abs(pos.x - screenCenter) < SNAP_THRESHOLD) {
        guides.vertical = screenCenter;
      }

      setSnapGuides(guides);
      return guides;
    },
    [initialSize.width]
  );

  return { snapGuides, checkSnapping };
};

export function AppWindow({
  id,
  title,
  children,
  onClose,
  onFocus,
  zIndex,
  position,
  size,
  onUpdate,
}: AppWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [internalPosition, setInternalPosition] = useState<Position>(position);
  const [internalSize, setInternalSize] = useState<Size>(size);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const positionRef = useRef(internalPosition);
  const sizeRef = useRef(internalSize);

  // Update refs when state changes to avoid stale closures
  useEffect(() => {
    positionRef.current = internalPosition;
  }, [internalPosition]);

  useEffect(() => {
    sizeRef.current = internalSize;
  }, [internalSize]);

  // Sync internal state with props (only when props change)
  useEffect(() => {
    if (
      position.x !== internalPosition.x ||
      position.y !== internalPosition.y
    ) {
      setInternalPosition(position);
    }
  }, [position]);

  useEffect(() => {
    if (
      size.width !== internalSize.width ||
      size.height !== internalSize.height
    ) {
      setInternalSize(size);
    }
  }, [size]);

  // Focus window when mounted
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (windowRef.current) {
        windowRef.current.focus();
        onFocus();
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []); // Only run on mount

  // Add keyboard shortcuts
  useKeyboardShortcuts(onClose);

  // Add window snapping
  const { snapGuides, checkSnapping } = useWindowSnapping(size);

  // Throttled update callback to reduce frequency of parent updates
  const throttledUpdate = useMemo(
    () =>
      throttle((pos: Position, sz: Size) => {
        onUpdate(pos, sz);
      }, 100),
    [onUpdate]
  );

  // Cleanup throttled function
  useEffect(() => {
    return () => {
      throttledUpdate.cancel();
    };
  }, [throttledUpdate]);

  // Handle updates when dragging/resizing ends
  useEffect(() => {
    if (!isDragging && !isResizing) {
      // Only update if the values actually changed to prevent loops
      const positionChanged =
        positionRef.current.x !== position.x ||
        positionRef.current.y !== position.y;

      const sizeChanged =
        sizeRef.current.width !== size.width ||
        sizeRef.current.height !== size.height;

      if (positionChanged || sizeChanged) {
        throttledUpdate(positionRef.current, sizeRef.current);
      }
    }
  }, [isDragging, isResizing, position, size, throttledUpdate]);

  const handleFocus = useCallback(() => {
    onFocus();
  }, [onFocus]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!windowRef.current) return;

      // Calculate the exact offset from the mouse position to the window corner
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      onFocus();

      // Prevent default behaviors that might interfere with dragging
      e.preventDefault();
    },
    [onFocus]
  );

  const startResize = useCallback(
    (direction: ResizeDirection, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setResizeDirection(direction);
      onFocus();
    },
    [onFocus]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        // Calculate new position based on the exact drag offset
        const newPos = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        };

        // Only check for snapping if enabled
        if (
          ENABLE_SNAPPING &&
          (Math.abs(e.movementX) > 5 || Math.abs(e.movementY) > 5)
        ) {
          const guides = checkSnapping(newPos);

          // Apply snapping
          if (guides.vertical !== null) {
            newPos.x = guides.vertical;
          }

          if (guides.horizontal !== null) {
            newPos.y = guides.horizontal;
          }
        }

        // Enforce screen boundaries only if enabled
        if (RESTRICT_TO_SCREEN && typeof window !== "undefined") {
          // Keep at least 100px of window width visible
          const minVisibleWidth = 100;
          newPos.x = Math.max(
            -sizeRef.current.width + minVisibleWidth,
            newPos.x
          );
          newPos.x = Math.min(window.innerWidth - minVisibleWidth, newPos.x);

          // Keep the title bar (at least 30px) visible at the top
          const titleBarHeight = 30;
          newPos.y = Math.max(
            -sizeRef.current.height + titleBarHeight,
            newPos.y
          );
          newPos.y = Math.min(window.innerHeight - titleBarHeight, newPos.y);
        }

        // Update the position
        setInternalPosition(newPos);
      } else if (isResizing && windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        let newSize = { ...sizeRef.current };

        switch (resizeDirection) {
          case "right":
            newSize = {
              width: Math.max(MIN_WINDOW_SIZE.width, e.clientX - rect.left),
              height: sizeRef.current.height,
            };
            break;
          case "bottom":
            newSize = {
              width: sizeRef.current.width,
              height: Math.max(MIN_WINDOW_SIZE.height, e.clientY - rect.top),
            };
            break;
          case "corner":
            newSize = {
              width: Math.max(MIN_WINDOW_SIZE.width, e.clientX - rect.left),
              height: Math.max(MIN_WINDOW_SIZE.height, e.clientY - rect.top),
            };
            break;
        }

        setInternalSize(newSize);
      }
    },
    [isDragging, isResizing, dragOffset, resizeDirection, checkSnapping]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging || isResizing) {
      // Stop dragging/resizing
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);

      // Clear any active snap guides by triggering a final update
      // No need to explicitly set snap guides as they're managed by the hook

      // Update parent component with final position/size
      throttledUpdate.cancel(); // Cancel any pending throttled updates
      throttledUpdate(positionRef.current, sizeRef.current);
    }
  }, [isDragging, isResizing, throttledUpdate]);

  // Global mouse events
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Window controls section
  const windowControls = (
    <div
      className="flex items-center space-x-1.5 ml-2 mt-3 mb-3"
      onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when clicking controls
    >
      <WindowControl
        color="bg-red-500"
        hoverColor="bg-red-500"
        onClick={onClose}
        label="Close window"
        icon={<X className="h-2 w-2" />}
      />
      <WindowControl
        color="bg-amber-500"
        hoverColor="bg-amber-500"
        label="Minimize window"
        icon={<Minus className="h-2 w-2" />}
      />
      <WindowControl
        color="bg-green-500"
        hoverColor="bg-green-500"
        label="Maximize window"
        icon={<Plus className="h-2 w-2" />}
      />
    </div>
  );

  return (
    <>
      {/* Snap guides - only render when necessary */}
      <AnimatePresence mode="wait">
        {SHOW_SNAP_GUIDES && isDragging && snapGuides.vertical !== null && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 0.4, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 bottom-0 w-0.5 bg-blue-300/50 origin-center"
            style={{ left: snapGuides.vertical }}
          />
        )}
        {SHOW_SNAP_GUIDES && isDragging && snapGuides.horizontal !== null && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 0.4, scaleY: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 right-0 h-0.5 bg-blue-300/50 origin-center"
            style={{ top: snapGuides.horizontal }}
          />
        )}
      </AnimatePresence>

      <motion.div
        ref={windowRef}
        tabIndex={0}
        role="dialog"
        aria-label={title}
        aria-modal="true"
        style={{
          position: "absolute",
          left: internalPosition.x,
          top: internalPosition.y,
          width: internalSize.width,
          height: internalSize.height,
          zIndex,
        }}
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 25,
        }}
        onClick={handleFocus}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 rounded-xl"
      >
        <Card className="h-full overflow-hidden shadow-lg border border-white/10 rounded-xl bg-card/90 backdrop-blur-md">
          <CardHeader
            onMouseDown={handleMouseDown}
            onDoubleClick={() => {
              // Maximize logic would go here
            }}
            className="h-8 p-0 cursor-move select-none flex items-center rounded-t-xl bg-gradient-to-b from-muted/80 to-muted/50"
          >
            <div className="flex items-center px-3 w-full h-full">
              <div className="flex space-x-2">{windowControls}</div>
              <motion.div
                className="flex-1 flex justify-center"
                animate={{
                  opacity: isDragging ? 0.7 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-xs font-medium text-foreground/80 px-2">
                  {title}
                </span>
              </motion.div>
              <div className="w-[62px] opacity-0" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-2rem)] overflow-hidden">
            {children}
          </CardContent>

          {/* Resize handles with improved visual feedback */}
          <AnimatePresence>
            {isHovered && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-0 right-0 w-1 h-full cursor-ew-resize hover:bg-blue-400/50"
                  onMouseDown={(e) => startResize("right", e)}
                  aria-label="Resize window width"
                  role="button"
                  tabIndex={-1}
                  whileHover={{ opacity: 0.6, width: 2 }}
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-0 right-0 h-1 w-full cursor-ns-resize hover:bg-blue-400/50"
                  onMouseDown={(e) => startResize("bottom", e)}
                  aria-label="Resize window height"
                  role="button"
                  tabIndex={-1}
                  whileHover={{ opacity: 0.6, height: 2 }}
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-0 right-0 h-5 w-5 cursor-se-resize hover:bg-blue-400/30 rounded-bl-xl"
                  onMouseDown={(e) => startResize("corner", e)}
                  aria-label="Resize window"
                  role="button"
                  tabIndex={-1}
                  whileHover={{
                    opacity: 0.8,
                    transition: { duration: 0.2 },
                  }}
                />
              </>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </>
  );
}
