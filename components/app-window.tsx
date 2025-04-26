"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { X, Minus, Square } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface AppWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onUpdate: (position: { x: number; y: number }, size: { width: number; height: number }) => void;
}

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
  const [internalPosition, setInternalPosition] = useState(position);
  const [internalSize, setInternalSize] = useState(size);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Sync internal state with props
  useEffect(() => {
    setInternalPosition(position);
  }, [position.x, position.y]);
  useEffect(() => {
    setInternalSize(size);
  }, [size.width, size.height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      onFocus();
    }
  };

  const startResize = (direction: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    onFocus();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPos = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        };
        setInternalPosition(newPos);
      } else if (isResizing && windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        let newSize = { ...internalSize };
        switch (resizeDirection) {
          case "right":
            newSize = {
              width: Math.max(300, e.clientX - rect.left),
              height: internalSize.height,
            };
            break;
          case "bottom":
            newSize = {
              width: internalSize.width,
              height: Math.max(200, e.clientY - rect.top),
            };
            break;
          case "corner":
            newSize = {
              width: Math.max(300, e.clientX - rect.left),
              height: Math.max(200, e.clientY - rect.top),
            };
            break;
        }
        setInternalSize(newSize);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
      // Notify parent of new position/size
      onUpdate(internalPosition, internalSize);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, isResizing, dragOffset, resizeDirection, internalSize, internalPosition]);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "absolute",
        left: `${internalPosition.x}px`,
        top: `${internalPosition.y}px`,
        width: `${internalSize.width}px`,
        height: `${internalSize.height}px`,
        zIndex: zIndex + 10,
      }}
    >
      <Card
        ref={windowRef}
        className="h-full w-full shadow-xl rounded-xl overflow-hidden border border-zinc-200/30 dark:border-zinc-800/30 bg-background/90 backdrop-blur-md transition-shadow duration-200 relative"
        onClick={onFocus}
      >
        <CardHeader
          className="p-0 cursor-move flex flex-row items-center h-9 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200/20 dark:border-zinc-800/20"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2 px-3 w-full">
            <div className="flex space-x-1.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-3 w-3 rounded-full bg-red-500 hover:bg-red-600 group"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <X className="h-2 w-2 text-red-800 opacity-0 group-hover:opacity-100" />
                <span className="sr-only">Close</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-3 w-3 rounded-full bg-yellow-500 hover:bg-yellow-600 group"
              >
                <Minus className="h-2 w-2 text-yellow-800 opacity-0 group-hover:opacity-100" />
                <span className="sr-only">Minimize</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-3 w-3 rounded-full bg-green-500 hover:bg-green-600 group"
              >
                <Square className="h-2 w-2 text-green-800 opacity-0 group-hover:opacity-100" />
                <span className="sr-only">Maximize</span>
              </Button>
            </div>
            <span className="text-xs font-medium text-center w-full">
              {title}
            </span>
          </div>
        </CardHeader>
        <CardContent
          className="p-0 overflow-auto"
          style={{ height: "calc(100% - 36px)" }}
        >
          {children}
        </CardContent>

        {/* Resize handles */}
        <div
          className="absolute bottom-0 right-0 w-4 h-full cursor-ew-resize"
          onMouseDown={(e) => startResize("right", e)}
        />
        <div
          className="absolute bottom-0 right-0 h-4 w-full cursor-ns-resize"
          onMouseDown={(e) => startResize("bottom", e)}
        />
        <div
          className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize"
          onMouseDown={(e) => startResize("corner", e)}
          style={{
            background: "transparent",
            zIndex: 20,
          }}
        >
          {/* <ArrowsOut className="h-4 w-4 absolute bottom-1 right-1 opacity-50" /> */}
        </div>
      </Card>
    </motion.div>
  );
}
