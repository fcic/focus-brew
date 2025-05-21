"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player/youtube";
import {
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Video,
  Edit2,
  Trash2,
  Check,
  X,
  MoreVertical,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Types
interface PlaylistItem {
  id: string;
  url: string;
  title: string;
  addedAt: number;
}

const DEFAULT_VOLUME = 50;
const DEFAULT_PLAYLIST: PlaylistItem[] = [
  {
    id: "jfKfPfyJRdk",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    title: "lofi hip hop radio - beats to relax/study to",
    addedAt: Date.now(),
  },
];

interface DraggablePlaylistItemProps {
  item: PlaylistItem;
  idx: number;
  currentIndex: number;
  editingIndex: number | null;
  editingTitle: string;
  setEditingIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setEditingTitle: React.Dispatch<React.SetStateAction<string>>;
  saveEditedTitle: () => void;
  handleEditTitle: (idx: number) => void;
  handleRemove: (idx: number) => void;
  updateCurrentIndex: (index: number) => void;
  children: React.ReactNode;
}

function DraggablePlaylistItem({item, idx, currentIndex, editingIndex, editingTitle, setEditingIndex, setEditingTitle, saveEditedTitle, updateCurrentIndex, children,}: DraggablePlaylistItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }}
      className={cn(
        "flex items-center gap-2 rounded p-1 group",
        idx === currentIndex && "bg-primary/10 border-l-4 border-primary font-bold"
      )}
      aria-label={`Play ${item.title}`}
      onClick={() => updateCurrentIndex(idx)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") updateCurrentIndex(idx);
      }}
      {...attributes}
      {...listeners}
    >
      {children}
      {editingIndex === idx && (
        <Dialog open={true} onOpenChange={() => setEditingIndex(null)}>
          <DialogContent className="max-w-sm rounded-xl p-6">
            <DialogHeader>
              <DialogTitle>Edit Playlist Item Title</DialogTitle>
              <DialogDescription>
                Update the title for this playlist item.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-2">
              <Input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEditedTitle();
                  if (e.key === "Escape") setEditingIndex(null);
                }}
                className="flex-1"
                autoFocus
              />
              <div className="flex gap-2 justify-end mt-2">
                <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)} type="button">Cancel</Button>
                <Button size="sm" variant="default" onClick={saveEditedTitle} type="button">Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </li>
  );
};

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
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "LIVE";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s}`;
  }
  return `${m.toString().padStart(2, "0")}:${s}`;
};

const isValidYouTubeId = (id: string | null | undefined) => {
  return typeof id === "string" && /^[a-zA-Z0-9_-]{11}$/.test(id);
};

const LOCALSTORAGE_KEYS = {
  playlist: "youtube-playlist",
  currentIndex: "youtube-current-index",
  volume: "youtube-volume",
  muted: "youtube-muted",
  playing: "youtube-playing",
  timestamp: "youtube-timestamp",
};

export function YouTubePlayer() {
  const [playlist, setPlaylist] = useLocalStorage<PlaylistItem[]>(
    "youtube-playlist",
    DEFAULT_PLAYLIST
  );
  const [currentIndex, setCurrentIndex] = useState(() => {
    const stored = localStorage.getItem("youtube-current-index");
    return stored ? parseInt(stored, 10) : 0;
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showFullTitle, setShowFullTitle] = useState(false);
  const playerRef = useRef<ReactPlayer | null>(null);
  const [startTime, setStartTime] = useState(() => {
    const stored = localStorage.getItem("youtube-timestamp");
    return stored ? parseFloat(stored) : 0;
  });
  // --- Handlers ---
  const handlePlay = useCallback(() => setPlaying(true), []);
  const handlePause = useCallback(() => setPlaying(false), []);
  const handleTogglePlay = useCallback(() => setPlaying((prev) => !prev), []);
  const handleToggleMute = useCallback(() => setMuted((prev) => !prev), []);
  const handleToggleVideo = useCallback(
    () => setShowVideo((prev) => !prev),
    []
  );
  const handleError = useCallback((error: any) => {
    setError("An error occurred while playing the video. Please try again.");
    toast.error("Playback Error", {
      description:
        "An error occurred while playing the video. Please try again.",
    });
  }, []);
  const handleReady = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);
  const handleBufferEnd = useCallback(() => setLoading(false), []);
  const handleBufferStart = useCallback(() => setLoading(true), []);
  const updateCurrentIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    setStartTime(0);
    localStorage.setItem("youtube-current-index", index.toString());
    window.dispatchEvent(new Event("youtube-playlist-updated"));
  }, []);
  const handlePrev = useCallback(() => {
    const newIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    updateCurrentIndex(newIndex);
  }, [playlist.length, currentIndex, updateCurrentIndex]);
  const handleNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % playlist.length;
    updateCurrentIndex(newIndex);
  }, [playlist.length, currentIndex, updateCurrentIndex]);
  const handleAdd = useCallback(() => {
    const id = extractYouTubeId(newUrl);
    if (!id) {
      toast.error("Invalid URL", {
        description: "Please enter a valid YouTube URL or video ID",
      });
      return;
    }
    if (playlist.some((item) => item.id === id)) {
      toast("This video is already in your playlist!", {
        description: "You cannot add the same video more than once.",
        duration: 4000,
      });
      setNewUrl("");
      return;
    }
    setLoading(true);
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
          { id, url: newUrl, title: data.title, addedAt: Date.now() },
        ]);
        setNewUrl("");
        toast.success("Video added", {
          description: "The video has been added to your playlist.",
        });
      })
      .catch((error) => {
        toast.error("Error adding video", { description: error.message });
      })
      .finally(() => setLoading(false));
  }, [newUrl, playlist, setPlaylist]);
  const handleRemove = useCallback(
    (idx: number) => {
      setPlaylist((prev) => prev.filter((_, i) => i !== idx));
      if (idx === currentIndex && idx === playlist.length - 1) {
        setCurrentIndex(Math.max(0, idx - 1));
      }
    },
    [currentIndex, playlist.length, setPlaylist]
  );
  const handleEditTitle = useCallback(
    (idx: number) => {
      setEditingIndex(idx);
      setEditingTitle(playlist[idx].title);
    },
    [playlist]
  );
  const saveEditedTitle = useCallback(() => {
    if (editingIndex === null) return;
    setPlaylist((prev) =>
      prev.map((item, idx) =>
        idx === editingIndex
          ? { ...item, title: editingTitle || item.title }
          : item
      )
    );
    setEditingIndex(null);
  }, [editingIndex, editingTitle, setPlaylist]);
  const handleResetAll = useCallback(() => {
    setPlaylist(DEFAULT_PLAYLIST);
    setCurrentIndex(0);
    setPlaying(true);
    setVolume(DEFAULT_VOLUME);
    setMuted(false);
    setShowVideo(true);
    setNewUrl("");
    setEditingIndex(null);
    setStartTime(0);
    setEditingTitle("");
    setLoading(false);
    setError(null);
    toast.success("Reset successful", {
      description: "Playlist and player have been reset.",
    });
  }, [setPlaylist]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement &&
          (e.target.contentEditable === "true" ||
            e.target.closest(".ProseMirror") ||
            e.target.closest(".editor-content")))
      ) {
        return;
      }
      switch (e.code) {
        case "Space":
          e.preventDefault();
          setPlaying((prev) => !prev);
          break;
        case "ArrowLeft":
          if (e.altKey) handlePrev();
          break;
        case "ArrowRight":
          if (e.altKey) handleNext();
          break;
        case "KeyM":
          setMuted((prev) => !prev);
          break;
        case "KeyV":
          setShowVideo((prev) => !prev);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleNext, handlePrev]);

  // --- Validity and sync ---
  useEffect(() => {
    if (playlist.length === 0) {
      if (currentIndex !== 0) setCurrentIndex(0);
      return;
    }
    if (currentIndex < 0 || currentIndex >= playlist.length) {
      setCurrentIndex(0);
    }
  }, [playlist, currentIndex]);

  const hasValidVideo =
    playlist.length > 0 &&
    currentIndex >= 0 &&
    currentIndex < playlist.length &&
    playlist[currentIndex]?.id;
  const videoUrl = hasValidVideo
    ? `https://www.youtube.com/watch?v=${playlist[currentIndex].id}`
    : "";

  useEffect(() => {
    localStorage.setItem("youtube-playlist", JSON.stringify(playlist));
    window.dispatchEvent(new Event("youtube-playlist-updated"));
  }, [playlist]);
  useEffect(() => {
    localStorage.setItem("youtube-current-index", currentIndex.toString());
    window.dispatchEvent(new Event("youtube-playlist-updated"));
  }, [currentIndex]);
  useEffect(() => {
    const handleMiniplayerChange = () => {
      const storedIndex = localStorage.getItem("youtube-current-index");

      if (storedIndex) {
        const index = parseInt(storedIndex, 10);
        if (!isNaN(index) && index >= 0 && index < playlist.length) {
          setCurrentIndex(index);
        }
      }
      const storedTimestamp = localStorage.getItem("youtube-timestamp");
      if (storedTimestamp !== null) {
        setStartTime(parseFloat(storedTimestamp));
      }
    };
    window.addEventListener(
      "youtube-miniplayer-change",
      handleMiniplayerChange
    );
    return () => {
      window.removeEventListener(
        "youtube-miniplayer-change",
        handleMiniplayerChange
      );
    };
  }, [playlist.length]);

  // --- Initialization from localStorage ---
  useEffect(() => {
    // Playlist and index are already handled
    const storedVolume = localStorage.getItem(LOCALSTORAGE_KEYS.volume);
    if (storedVolume !== null) setVolume(Number(storedVolume));
    const storedMuted = localStorage.getItem(LOCALSTORAGE_KEYS.muted);
    if (storedMuted !== null) setMuted(storedMuted === "true");
    const storedPlaying = localStorage.getItem(LOCALSTORAGE_KEYS.playing);
    if (storedPlaying !== null) setPlaying(storedPlaying === "true");
  }, []);

  // --- Sync to localStorage and dispatch event on change ---
  useEffect(() => {
    localStorage.setItem(LOCALSTORAGE_KEYS.playlist, JSON.stringify(playlist));
    window.dispatchEvent(new Event("youtube-state-updated"));
  }, [playlist]);
  useEffect(() => {
    localStorage.setItem(
      LOCALSTORAGE_KEYS.currentIndex,
      currentIndex.toString()
    );
    window.dispatchEvent(new Event("youtube-state-updated"));
  }, [currentIndex]);
  useEffect(() => {
    localStorage.setItem(LOCALSTORAGE_KEYS.volume, volume.toString());
    window.dispatchEvent(new Event("youtube-state-updated"));
  }, [volume]);
  useEffect(() => {
    localStorage.setItem(LOCALSTORAGE_KEYS.muted, muted.toString());
    window.dispatchEvent(new Event("youtube-state-updated"));
  }, [muted]);
  useEffect(() => {
    localStorage.setItem(LOCALSTORAGE_KEYS.playing, playing.toString());
    window.dispatchEvent(new Event("youtube-state-updated"));
  }, [playing]);

  // --- Listen for state updates from miniplayer ---
  useEffect(() => {
    const handleStateUpdate = () => {
      // Only update if not already in sync
      const storedVolume = localStorage.getItem(LOCALSTORAGE_KEYS.volume);
      if (storedVolume !== null && Number(storedVolume) !== volume)
        setVolume(Number(storedVolume));
      const storedMuted = localStorage.getItem(LOCALSTORAGE_KEYS.muted);
      if (storedMuted !== null && (storedMuted === "true") !== muted)
        setMuted(storedMuted === "true");
      const storedPlaying = localStorage.getItem(LOCALSTORAGE_KEYS.playing);
      if (storedPlaying !== null && (storedPlaying === "true") !== playing)
        setPlaying(storedPlaying === "true");
      const storedTimestamp = localStorage.getItem(LOCALSTORAGE_KEYS.timestamp);
      if (storedTimestamp !== null) {
        setStartTime(parseFloat(storedTimestamp));
      }
      // Playlist and index
      const storedIndex = localStorage.getItem(LOCALSTORAGE_KEYS.currentIndex);
      if (storedIndex && Number(storedIndex) !== currentIndex)
        setCurrentIndex(Number(storedIndex));
      const storedPlaylist = localStorage.getItem(LOCALSTORAGE_KEYS.playlist);
      if (storedPlaylist) {
        try {
          const parsed = JSON.parse(storedPlaylist);
          if (
            Array.isArray(parsed) &&
            JSON.stringify(parsed) !== JSON.stringify(playlist)
          ) {
            setPlaylist(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener("youtube-state-updated", handleStateUpdate);
    return () =>
      window.removeEventListener("youtube-state-updated", handleStateUpdate);
  }, [volume, muted, playing, currentIndex, playlist]);

  // --- UI ---
  return (
    <TooltipProvider>
      <Card className="w-full max-w-2xl mx-auto bg-background/90 backdrop-blur-sm border-border/50 p-4 space-y-4 h-full flex flex-col">
        {/* Video Area */}
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video mb-4 w-full">
          {hasValidVideo ? (
            <>
              <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                width="100%"
                height="100%"
                playing={playing}
                volume={volume / 100}
                muted={muted}
                onPlay={handlePlay}
                onPause={handlePause}
                onError={handleError}
                onReady={handleReady}
                onBuffer={handleBufferStart}
                onBufferEnd={handleBufferEnd}
                onEnded={handleNext}
                controls={true}
                config={
                  {
                    youtube: {
                      playerVars: {
                        ...(startTime > 0 && { start: Math.floor(startTime) }),
                        modestbranding: 1,
                        rel: 0,
                        iv_load_policy: 3,
                      },
                    },
                  } as any
                }
                className="absolute inset-0"
                style={{
                  opacity: showVideo ? 1 : 0,
                  pointerEvents: showVideo ? "auto" : "none",
                }}
                onProgress={({ played, playedSeconds }) => {
                  setProgress(played);
                  setStartTime(playedSeconds);
                  localStorage.setItem(
                    LOCALSTORAGE_KEYS.timestamp,
                    playedSeconds.toString()
                  );
                }}
              />
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-muted-foreground/20">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              {/* Overlay for errors and loading */}
              {(error || loading) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                  {error ? (
                    <div className="text-destructive text-center p-4">
                      <span className="block text-lg mb-2">⚠️</span>
                      {error}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center">
                      <div className="animate-spin w-8 h-8 border-2 border-muted border-t-foreground rounded-full mb-2" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  )}
                </div>
              )}
              {/* Overlay for hidden video */}
              {!showVideo && !error && !loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-muted-foreground select-none z-10">
                  Video hidden
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-muted text-muted-foreground">
              No videos in your playlist. Add a YouTube video to get started.
            </div>
          )}
        </div>
        {/* Controls Area */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2 w-full">
          {/* Main Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePrev}
              disabled={playlist.length < 2 || loading}
              aria-label="Previous video"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="default"
              onClick={handleTogglePlay}
              disabled={!playlist[currentIndex] || loading}
              className="bg-foreground hover:bg-foreground/90 text-background"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleNext}
              disabled={playlist.length < 2 || loading}
              aria-label="Next video"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleToggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
          </div>
          {/* Title Area */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {playlist[currentIndex]?.title ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="font-medium truncate overflow-hidden whitespace-nowrap max-w-[300px] cursor-pointer"
                      onClick={() => setShowFullTitle(true)}
                      tabIndex={0}
                      role="button"
                      aria-label="Show full title"
                    >
                      {playlist[currentIndex].title}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {playlist[currentIndex].title}
                  </TooltipContent>
                </Tooltip>
                <Dialog open={showFullTitle} onOpenChange={setShowFullTitle}>
                  <DialogTrigger asChild>
                    <span className="sr-only">Show full title</span>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle className="sr-only">
                      Full Video Title
                    </DialogTitle>
                    <div className="text-lg font-semibold break-words">
                      {playlist[currentIndex].title}
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <span className="text-muted-foreground">No track selected</span>
            )}
          </div>
          {/* Toggle Video Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggleVideo}
            className="hover:bg-muted flex-shrink-0"
          >
            {showVideo ? (
              <Video className="w-4 h-4 mr-2" />
            ) : (
              <X className="w-4 h-4 mr-2" />
            )}
            {showVideo ? "Hide" : "Show"} Video
          </Button>
        </div>
        <Separator className="my-2" />
        {/* Playlist Area */}
        <div className="flex-1 flex flex-col min-h-0 w-full">
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
                if (e.key === "Enter" && !loading && extractYouTubeId(newUrl)) {
                  handleAdd();
                }
              }}
              className="flex-1 min-w-0 bg-muted/50 border-border/50"
              disabled={loading}
            />
            <Button
              onClick={handleAdd}
              disabled={!extractYouTubeId(newUrl) || loading}
              variant="default"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-muted border-t-foreground rounded-full mr-2" />
                  Adding...
                </>
              ) : (
                "Add"
              )}
            </Button>
          </div>
          {/* Playlist */}
          <ScrollArea className="flex-1 w-full rounded-md border border-border/50 bg-muted/50">
            <DndContext
              sensors={useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))}
              collisionDetection={closestCenter}
              onDragEnd={(event) => {
                const { active, over } = event;
                if (active.id !== over?.id) {
                  const oldIndex = playlist.findIndex((i) => i.id === active.id);
                  const newIndex = playlist.findIndex((i) => i.id === over?.id);
                  const newPlaylist = arrayMove(playlist, oldIndex, newIndex);
                  setPlaylist(newPlaylist);
                  // Atualiza o índice atual se necessário
                  if (currentIndex === oldIndex) setCurrentIndex(newIndex);
                  else if (currentIndex === newIndex) setCurrentIndex(oldIndex);
                }
              }}
            >
              <SortableContext items={playlist.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-1 p-2">
                  {playlist.map((item, idx) => (
                    <DraggablePlaylistItem
                      key={item.id}
                      item={item}
                      idx={idx}
                      currentIndex={currentIndex}
                      editingIndex={editingIndex}
                      editingTitle={editingTitle}
                      setEditingIndex={setEditingIndex}
                      setEditingTitle={setEditingTitle}
                      saveEditedTitle={saveEditedTitle}
                      handleEditTitle={handleEditTitle}
                      handleRemove={handleRemove}
                      updateCurrentIndex={updateCurrentIndex}
                    >
                      <span className="text-xs text-muted-foreground w-6 text-center">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate overflow-hidden whitespace-nowrap max-w-[180px] block cursor-pointer">
                              {item.title}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{item.title}</TooltipContent>
                        </Tooltip>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            aria-label="More actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTitle(idx)}>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit Title
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemove(idx)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </DraggablePlaylistItem>
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </ScrollArea>
        </div>
      </Card>
    </TooltipProvider>
  );
}
