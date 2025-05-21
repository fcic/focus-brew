"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Maximize2,
  X,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import ReactPlayer from "react-player/youtube";

// Constants
const MENU_BAR_HEIGHT = 28; // Height of the top menu bar
const DOCK_HEIGHT = 96; // Height of the dock at the bottom
const DEFAULT_VOLUME = 50;
const SAFE_PADDING = 20; // Safe padding from edges

interface YouTubeMiniPlayerProps {
  onClose: () => void;
  onMaximize: () => void;
}

interface PlaylistItem {
  id: string;
  url: string;
  title: string;
  addedAt: number;
}

export function YouTubeMiniPlayer({
  onClose,
  onMaximize,
}: YouTubeMiniPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [offsetPos, setOffsetPos] = useState({ x: 0, y: 0 });

  // Remove useLocalStorage for playlist, always read from localStorage directly
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [startTimestamp, setStartTimestamp] = useState(0);

  // Set initial position at bottom right
  useEffect(() => {
    if (typeof window !== "undefined") {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const playerWidth = 320; // Default width estimate
      const playerHeight = 230; // Default height estimate - includes controls

      // Position at bottom right with safe padding
      const posX = Math.max(
        SAFE_PADDING,
        windowWidth - playerWidth - SAFE_PADDING
      );
      // Ensure it stays visible above the dock
      const posY = Math.max(
        MENU_BAR_HEIGHT + SAFE_PADDING,
        windowHeight - playerHeight - DOCK_HEIGHT - SAFE_PADDING
      );

      setPosition({ x: posX, y: posY });
    }
  }, []);

  // Always re-read playlist and index from localStorage when mounted or when notified
  const readPlaylistAndIndex = useCallback(() => {
    setLoading(true);
    try {
      const storedPlaylist = localStorage.getItem("youtube-playlist");
      const parsedPlaylist = storedPlaylist ? JSON.parse(storedPlaylist) : [];
      setPlaylist(Array.isArray(parsedPlaylist) ? parsedPlaylist : []);
      const storedTimestamp = localStorage.getItem("youtube-timestamp");
      if (storedTimestamp !== null) {
        setStartTimestamp(parseFloat(storedTimestamp));
      }
      const storedIndex = localStorage.getItem("youtube-current-index");
      let index = storedIndex ? parseInt(storedIndex, 10) : 0;
      if (isNaN(index) || index < 0 || index >= parsedPlaylist.length) {
        index = 0;
      }
      setCurrentIndex(index);
    } catch (error) {
      setPlaylist([]);
      setCurrentIndex(0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    readPlaylistAndIndex();
    // Listen for playlist/index updates
    window.addEventListener("youtube-playlist-updated", readPlaylistAndIndex);
    return () => {
      window.removeEventListener(
        "youtube-playlist-updated",
        readPlaylistAndIndex
      );
    };
  }, [readPlaylistAndIndex]);

  // Handle maximize button click
  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag from starting
    onMaximize();
  };

  // Handle close button click
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag from starting
    onClose();
  };

  // Handle drag events
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest("button") ||
        !e.target.closest(".drag-handle") ||
        e.target.closest(".player-controls"))
    ) {
      return;
    }

    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setOffsetPos({ x: position.x, y: position.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;

      // Calculate new position
      const newX = offsetPos.x + dx;
      const newY = offsetPos.y + dy;

      // Get window boundaries
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const playerWidth = containerRef.current?.offsetWidth || 320;
      const playerHeight = containerRef.current?.offsetHeight || 230;

      // Constrain to window boundaries, accounting for menu bar at top and dock at bottom
      const boundedX = Math.max(
        SAFE_PADDING,
        Math.min(newX, windowWidth - playerWidth - SAFE_PADDING)
      );
      const boundedY = Math.max(
        MENU_BAR_HEIGHT + SAFE_PADDING,
        Math.min(newY, windowHeight - playerHeight - DOCK_HEIGHT - SAFE_PADDING)
      );

      setPosition({ x: boundedX, y: boundedY });
    },
    [isDragging, startPos, offsetPos, containerRef]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Playlist controls
  const handlePrev = () => {
    if (playlist.length < 2) return;
    const newIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(newIndex);
    localStorage.setItem("youtube-current-index", newIndex.toString());
    localStorage.setItem("youtube-timestamp", "0");
  };

  const handleNext = () => {
    if (playlist.length < 2) return;
    const newIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(newIndex);
    localStorage.setItem("youtube-current-index", newIndex.toString());
    localStorage.setItem("youtube-timestamp", "0");
  };

  // Playback controls
  const handleTogglePlay = () => {
    setPlaying((prev) => !prev);
  };

  const handleToggleMute = () => {
    setMuted((prev) => !prev);
  };

  // Add/remove global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  // Current video ID and title with fallbacks
  const videoId =
    playlist.length > 0 && currentIndex < playlist.length
      ? playlist[currentIndex]?.id
      : null;

  const currentTitle =
    playlist.length > 0 && currentIndex < playlist.length
      ? playlist[currentIndex]?.title || "Untitled video"
      : "No video selected";

  if (loading) {
    return (
      <div className="fixed z-50 w-80 rounded-lg overflow-hidden shadow-lg bg-background border border-border/50 flex items-center justify-center h-[230px]">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-50 w-80 rounded-lg overflow-hidden shadow-lg bg-background border border-border/50",
        isDragging ? "opacity-80 cursor-grabbing" : "opacity-100"
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: "none",
      }}
    >
      {/* Header Controls */}
      <div
        className="bg-muted/80 p-2 flex items-center justify-between cursor-grab drag-handle"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleMaximize}
      >
        <p className="text-xs font-medium truncate flex-1 pl-1">
          {currentTitle}
        </p>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleMaximize}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* YouTube Player Component */}
      <div className="aspect-video w-full h-[160px] overflow-hidden relative">
        {videoId ? (
          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${videoId}`}
            playing={playing}
            muted={muted}
            volume={volume / 100}
            controls={false}
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0 }}
            onProgress={({ playedSeconds }) => {
              localStorage.setItem(
                "youtube-timestamp",
                playedSeconds.toString()
              );
            }}
            config={{
              playerVars: {
                start: Math.floor(startTimestamp),
              },
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-black text-white text-sm">
            No video selected
          </div>
        )}
      </div>

      {/* Player Controls */}
      <div className="bg-muted/80 p-2 player-controls">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handlePrev}
              disabled={playlist.length < 2}
            >
              <SkipBack className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleTogglePlay}
              disabled={!videoId}
            >
              {playing ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleNext}
              disabled={playlist.length < 2}
            >
              <SkipForward className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleToggleMute}
              disabled={!videoId}
            >
              {muted ? (
                <VolumeX className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </Button>
            <div className="w-16">
              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                className="h-1"
                onValueChange={(value) => setVolume(value[0])}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
