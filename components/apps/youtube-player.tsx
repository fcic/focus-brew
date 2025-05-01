"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";
import {
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
  Edit2,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

// Types
interface PlaylistItem {
  id: string;
  url: string;
  title: string;
  addedAt: number; // Timestamp when added
}

interface PlayerState {
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  showVideo: boolean;
  playing: boolean;
  editingTitle: string;
  error: string | null;
  loading: boolean;
}

// Constants
const DEFAULT_VOLUME = 50;
const PROGRESS_UPDATE_INTERVAL = 1000;
const DEFAULT_PLAYLIST: PlaylistItem[] = [
  {
    id: "jfKfPfyJRdk",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    title: "lofi hip hop radio - beats to relax/study to",
    addedAt: Date.now(),
  },
];

// Utility functions
const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /^[a-zA-Z0-9_-]{11}$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s}` : `${m}:${s}`;
};

// Components
const PlaylistItemComponent: React.FC<{
  item: PlaylistItem;
  index: number;
  isPlaying: boolean;
  isEditing: boolean;
  editingTitle: string;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (title: string) => void;
  onCancel: () => void;
  onTitleChange: (title: string) => void;
}> = ({
  item,
  index,
  isPlaying,
  isEditing,
  editingTitle,
  onPlay,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onTitleChange,
}) => (
  <li
    className={cn(
      "flex items-center gap-2 rounded p-1",
      isPlaying && "bg-muted/50 font-bold"
    )}
  >
    <Button size="sm" variant="ghost" onClick={onPlay}>
      {index + 1}
    </Button>
    <div className="flex items-center flex-1 min-w-0 justify-between">
      {isEditing ? (
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <Input
            value={editingTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSave(editingTitle);
              if (e.key === "Escape") onCancel();
            }}
            className="flex-1"
            autoFocus
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onSave(editingTitle)}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <span className="truncate flex-1">{item.title}</span>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  </li>
);

export function YouTubePlayer() {
  const [playlist, setPlaylist] = useLocalStorage<PlaylistItem[]>(
    "youtube-playlist",
    DEFAULT_PLAYLIST
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [playerState, setPlayerState] = useState<PlayerState>({
    progress: 0,
    duration: 0,
    volume: DEFAULT_VOLUME,
    isMuted: false,
    showVideo: true,
    playing: false,
    editingTitle: "",
    error: null,
    loading: false,
  });

  const playerRef = useRef<any>(null);
  const progressInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  const handlePlayerReady = useCallback(
    (event: YouTubeEvent) => {
      playerRef.current = event.target;
      playerRef.current.setVolume(playerState.volume);
      if (playerState.isMuted) {
        playerRef.current.mute();
      }
      // Set initial duration when player is ready
      const duration = playerRef.current.getDuration();
      setPlayerState((prev) => ({ ...prev, duration }));
    },
    [playerState.volume, playerState.isMuted]
  );

  const handleNext = useCallback(() => {
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
  }, [currentIndex, playlist.length]);

  const onStateChange = useCallback(
    (event: YouTubeEvent) => {
      if (!event) return;
      const isPlaying = event.data === 1;

      // Update duration when video starts playing
      if (isPlaying) {
        const duration = playerRef.current.getDuration();
        setPlayerState((prev) => ({
          ...prev,
          playing: isPlaying,
          duration,
          progress: playerRef.current.getCurrentTime(),
        }));
      } else {
        setPlayerState((prev) => ({ ...prev, playing: isPlaying }));
      }

      if (event.data === 0) {
        handleNext();
      }
    },
    [handleNext]
  );

  const handleAdd = useCallback(() => {
    const id = extractYouTubeId(newUrl);
    if (!id) {
      toast.error("Invalid URL", {
        description: "Please enter a valid YouTube URL or video ID",
      });
      return;
    }

    setPlayerState((prev) => ({ ...prev, loading: true, error: null }));

    // Validate video before adding
    fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
    )
      .then((response) => {
        if (!response.ok) throw new Error("Video not found or not embeddable");
        return response.json();
      })
      .then((data) => {
        setPlaylist((prev) => [
          ...prev,
          {
            id,
            url: newUrl,
            title: data.title,
            addedAt: Date.now(),
          },
        ]);
        setNewUrl("");
        toast.success("Video added", {
          description: "The video has been added to your playlist",
        });
      })
      .catch((error) => {
        toast.error("Error adding video", {
          description: error.message,
        });
      })
      .finally(() => {
        setPlayerState((prev) => ({ ...prev, loading: false }));
      });
  }, [newUrl, setPlaylist, toast]);

  const handleRemove = useCallback(
    (idx: number) => {
      setPlaylist((prev) => prev.filter((_, i) => i !== idx));
      if (idx === currentIndex && idx === playlist.length - 1) {
        setCurrentIndex(Math.max(0, idx - 1));
      }
    },
    [currentIndex, playlist.length, setPlaylist, setCurrentIndex]
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((idx) => (idx - 1 + playlist.length) % playlist.length);
  }, [playlist.length, setCurrentIndex]);

  const handleSeek = useCallback((val: number[]) => {
    if (playerRef.current) {
      playerRef.current.seekTo(val[0]);
      setPlayerState((prev) => ({ ...prev, progress: val[0] }));
    }
  }, []);

  const handleVolume = useCallback((val: number[]) => {
    if (playerRef.current) {
      playerRef.current.setVolume(val[0]);
      setPlayerState((prev) => ({
        ...prev,
        volume: val[0],
        isMuted: val[0] === 0,
      }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      const newMuted = !playerState.isMuted;
      playerRef.current.setVolume(newMuted ? 0 : playerState.volume);
      setPlayerState((prev) => ({ ...prev, isMuted: newMuted }));
    }
  }, [playerState.isMuted, playerState.volume]);

  const handleEditTitle = useCallback(
    (idx: number) => {
      setEditingIndex(idx);
      setPlayerState((prev) => ({
        ...prev,
        editingTitle: playlist[idx].title,
      }));
    },
    [playlist]
  );

  const saveEditedTitle = useCallback(() => {
    if (editingIndex === null) return;

    setPlaylist((prev) =>
      prev.map((item, idx) =>
        idx === editingIndex
          ? { ...item, title: playerState.editingTitle || item.title }
          : item
      )
    );
    setEditingIndex(null);
  }, [editingIndex, playerState.editingTitle, setPlaylist]);

  const handleResetAll = useCallback(() => {
    localStorage.clear();
    setPlaylist(DEFAULT_PLAYLIST);
    setCurrentIndex(0);
    setPlayerState({
      progress: 20,
      duration: 0,
      volume: DEFAULT_VOLUME,
      isMuted: false,
      showVideo: true,
      playing: false,
      editingTitle: "",
      error: null,
      loading: false,
    });
    setNewUrl("");
    setEditingIndex(null);
  }, [setPlaylist, setCurrentIndex]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          setPlayerState((prev) => {
            const newPlaying = !prev.playing;
            if (playerRef.current) {
              if (newPlaying) playerRef.current.playVideo();
              else playerRef.current.pauseVideo();
            }
            return { ...prev, playing: newPlaying };
          });
          break;
        case "ArrowLeft":
          if (e.altKey) handlePrev();
          else if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime();
            playerRef.current.seekTo(Math.max(0, currentTime - 10));
          }
          break;
        case "ArrowRight":
          if (e.altKey) handleNext();
          else if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime();
            playerRef.current.seekTo(currentTime + 10);
          }
          break;
        case "KeyM":
          toggleMute();
          break;
        case "KeyV":
          setPlayerState((prev) => ({ ...prev, showVideo: !prev.showVideo }));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleNext, handlePrev, toggleMute]);

  // Add error handling for player errors
  const handleError = useCallback(
    (event: YouTubeEvent) => {
      const errorMessages: { [key: number]: string } = {
        2: "Invalid video ID",
        5: "HTML5 player error",
        100: "Video not found",
        101: "Video cannot be played in embedded players",
        150: "Video cannot be played in embedded players",
      };

      const errorCode = event.data;
      const errorMessage =
        errorMessages[errorCode] || "An error occurred playing the video";

      setPlayerState((prev) => ({
        ...prev,
        error: errorMessage,
        playing: false,
      }));
      toast.error("Playback Error", {
        description: errorMessage,
      });
    },
    [toast]
  );

  // Update progress more frequently for smoother tracking
  useEffect(() => {
    let progressTimer: number;

    if (playerState.playing && playerRef.current) {
      progressTimer = window.setInterval(() => {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();

        setPlayerState((prev) => ({
          ...prev,
          progress: currentTime,
          duration: duration || prev.duration,
        }));
      }, 250); // Update every 250ms for smoother progress
    }

    return () => {
      if (progressTimer) {
        window.clearInterval(progressTimer);
      }
    };
  }, [playerState.playing]);

  // Improved player style with better aspect ratio handling
  const playerStyle: React.CSSProperties = playerState.showVideo
    ? {
        display: "block",
        width: "100%",
        aspectRatio: "16/9",
        backgroundColor: "#000",
      }
    : {
        position: "absolute",
        left: "-9999px",
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: "none",
      };

  return (
    <Card className="max-w-4xl mx-auto bg-zinc-950/90 backdrop-blur-sm border-zinc-800/50 p-4 space-y-4 h-full flex flex-col">
      {/* YouTube Player */}
      {playlist[currentIndex] && (
        <div className="relative rounded-lg overflow-hidden bg-black">
          <div style={playerStyle} className="relative w-full">
            <YouTube
              videoId={playlist[currentIndex].id}
              opts={{
                width: "100%",
                height: "100%",
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  modestbranding: 1,
                  rel: 0,
                  showinfo: 0,
                  iv_load_policy: 3,
                },
              }}
              onReady={handlePlayerReady}
              onStateChange={onStateChange}
              onError={handleError}
              className="absolute inset-0 w-full h-full"
            />
          </div>
          {/* Overlay for errors and loading */}
          {(playerState.error || playerState.loading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              {playerState.error ? (
                <div className="text-red-400 text-center p-4">
                  <span className="block text-lg mb-2">⚠️</span>
                  {playerState.error}
                </div>
              ) : (
                <div className="text-zinc-400 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-zinc-600 border-t-zinc-200 rounded-full mb-2" />
                  <span className="text-sm">Loading...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Progress and Controls Container */}
      <div className="space-y-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
        {/* Title and Time */}
        <div className="flex justify-between items-center text-sm">
          <div className="font-medium text-zinc-200 truncate pr-4">
            {playlist[currentIndex]?.title || "No track selected"}
          </div>
          <div className="text-zinc-400 flex items-center space-x-2 text-xs">
            <span>{formatTime(playerState.progress)}</span>
            <span>/</span>
            <span>{formatTime(playerState.duration)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative group">
          <Slider
            value={[playerState.progress]}
            max={playerState.duration || 100}
            min={0}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="absolute -bottom-4 left-0 w-full opacity-0 group-hover:opacity-100 transition-opacity text-xs text-center">
            <div className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded inline-block">
              {formatTime(playerState.progress)}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="hover:bg-zinc-800"
            >
              {playerState.isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <div className="w-24">
              <Slider
                value={[playerState.isMuted ? 0 : playerState.volume]}
                max={100}
                min={0}
                step={1}
                onValueChange={handleVolume}
                className="w-full"
              />
            </div>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePrev}
              disabled={playlist.length < 2}
              className="hover:bg-zinc-800"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="default"
              onClick={() => {
                setPlayerState((prev) => {
                  const newPlaying = !prev.playing;
                  if (playerRef.current) {
                    if (newPlaying) playerRef.current.playVideo();
                    else playerRef.current.pauseVideo();
                  }
                  return { ...prev, playing: newPlaying };
                });
              }}
              disabled={!playlist[currentIndex]}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
            >
              {playerState.playing ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleNext}
              disabled={playlist.length < 2}
              className="hover:bg-zinc-800"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setPlayerState((prev) => ({
                  ...prev,
                  showVideo: !prev.showVideo,
                }))
              }
              disabled={!playlist[currentIndex]}
              className="hover:bg-zinc-800"
            >
              <Video className="w-4 h-4 mr-2" />
              {playerState.showVideo ? "Hide" : "Show"}
            </Button>
          </div>
        </div>
      </div>

      {/* Playlist Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-zinc-200">Playlist</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetAll}
            className="text-xs hover:bg-zinc-800"
          >
            Reset All
          </Button>
        </div>

        {/* URL Input */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter YouTube URL or video ID"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !playerState.loading &&
                extractYouTubeId(newUrl)
              ) {
                handleAdd();
              }
            }}
            className="flex-1 min-w-0 bg-zinc-900/50 border-zinc-800/50"
            disabled={playerState.loading}
          />
          <Button
            onClick={handleAdd}
            disabled={!extractYouTubeId(newUrl) || playerState.loading}
            className="bg-zinc-800 hover:bg-zinc-700"
          >
            {playerState.loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-zinc-600 border-t-zinc-200 rounded-full mr-2" />
                Adding...
              </>
            ) : (
              "Add"
            )}
          </Button>
        </div>

        {/* Playlist */}
        <ScrollArea className="flex-1 w-full rounded-md border border-zinc-800/50 bg-zinc-900/50">
          <ul className="space-y-1 p-2">
            {playlist.map((item, idx) => (
              <PlaylistItemComponent
                key={item.id}
                item={item}
                index={idx}
                isPlaying={idx === currentIndex}
                isEditing={editingIndex === idx}
                editingTitle={playerState.editingTitle}
                onPlay={() => setCurrentIndex(idx)}
                onEdit={() => handleEditTitle(idx)}
                onDelete={() => handleRemove(idx)}
                onSave={saveEditedTitle}
                onCancel={() => {
                  setEditingIndex(null);
                }}
                onTitleChange={(title) =>
                  setPlayerState((prev) => ({ ...prev, editingTitle: title }))
                }
              />
            ))}
          </ul>
        </ScrollArea>

        {/* Keyboard Shortcuts */}
        <div className="mt-4 text-xs text-zinc-500 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div>Space: Play/Pause</div>
          <div>←/→: Seek 10s</div>
          <div>Alt+←/→: Prev/Next</div>
          <div>M: Mute</div>
          <div>V: Toggle Video</div>
        </div>
      </div>
    </Card>
  );
}
