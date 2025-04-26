"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { X, Minus, Square } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const MotionCard = motion(Card);

interface AppWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
}

export function MotionAppWindow({
  id,
  title,
  children,
  onClose,
  onFocus,
  zIndex,
}: AppWindowProps) {
  const [position, setPosition] = useState({
    x: 50 + zIndex * 20,
    y: 50 + zIndex * 20,
  });
  const [size, setSize] = useState({ width: 650, height: 450 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

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
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      } else if (isResizing && windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();

        switch (resizeDirection) {
          case "right":
            setSize({
              width: Math.max(300, e.clientX - rect.left),
              height: size.height,
            });
            break;
          case "bottom":
            setSize({
              width: size.width,
              height: Math.max(200, e.clientY - rect.top),
            });
            break;
          case "corner":
            setSize({
              width: Math.max(300, e.clientX - rect.left),
              height: Math.max(200, e.clientY - rect.top),
            });
            break;
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeDirection, size]);

  return (
    <MotionCard
      ref={windowRef}
      className="absolute shadow-xl rounded-xl overflow-hidden border border-border/30 bg-background/90 backdrop-blur-md relative"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: zIndex + 10,
      }}
      onClick={onFocus}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <CardHeader
        className="p-0 cursor-move flex flex-row items-center h-9 bg-muted/30 backdrop-blur-sm border-b border-border/20"
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
        {/* Removed ArrowsOut icon as it does not exist in lucide-react */}
      </div>
    </MotionCard>
  );
}
