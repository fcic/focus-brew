"use client";

import React, { useRef, useState, useEffect } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import {
  Volume2,
  VolumeX,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Video,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";

interface PlaylistItem {
  id: string;
  url: string;
  title: string;
}

function extractYouTubeId(url: string): string | null {
  const regExp =
    /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
}

export default function YouTubeAudioPlayer() {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [input, setInput] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const current = playlist[currentIdx];

  // Fetch video title for display
  useEffect(() => {
    if (!current) return;
    fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${current.id}`
    )
      .then((res) => res.json())
      .then((data) => {
        setPlaylist((pl) =>
          pl.map((item, idx) =>
            idx === currentIdx
              ? { ...item, title: data.title || item.title }
              : item
          )
        );
      });
  }, [currentIdx, current?.id]);

  // Set default video if playlist is empty on mount
  useEffect(() => {
    if (playlist.length === 0) {
      setPlaylist([
        {
          id: "lTRiuFIWV54",
          url: "https://youtu.be/lTRiuFIWV54?t=20",
          title: "lofi hip hop radio - beats to relax/study to",
        },
      ]);
      setCurrentIdx(0);
      setPlaying(true);
      setProgress(20); // Start at 20 seconds
    }
  }, []);

  // Seek to 20s on first load or when switching to default video
  useEffect(() => {
    if (
      playlist.length > 0 &&
      playlist[currentIdx]?.id === "lTRiuFIWV54" &&
      playerRef.current &&
      progress < 20
    ) {
      playerRef.current.seekTo(20, true);
      setProgress(20);
    } else if (
      playlist.length > 0 &&
      playlist[currentIdx]?.id !== "lTRiuFIWV54" &&
      playerRef.current &&
      progress !== 0
    ) {
      playerRef.current.seekTo(0, true);
      setProgress(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, playlist.length]);

  // Progress sync
  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
    setDuration(event.target.getDuration());
    setVolume(event.target.getVolume());
    // Always seek to 20s if default video
    if (playlist.length > 0 && playlist[currentIdx]?.id === "lTRiuFIWV54") {
      event.target.seekTo(20, true);
      setProgress(20);
    } else if (
      playlist.length > 0 &&
      playlist[currentIdx]?.id !== "lTRiuFIWV54"
    ) {
      event.target.seekTo(0, true);
      setProgress(0);
    }
    if (!playing) event.target.pauseVideo();
    else event.target.playVideo();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setProgress(event.target.getCurrentTime());
      setDuration(event.target.getDuration());
    }, 500);
  };

  const onStateChange: YouTubeProps["onStateChange"] = (event) => {
    if (event.data === 0) handleNext(); // Ended
    if (event.data === 2) setPlaying(false); // Paused
    if (event.data === 1) setPlaying(true); // Playing
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleAdd = () => {
    const id = extractYouTubeId(input);
    if (id && !playlist.some((item) => item.id === id)) {
      setPlaylist([...playlist, { id, url: input, title: "YouTube Video" }]);
      if (playlist.length === 0) setCurrentIdx(0);
      setInput("");
    }
  };

  const handleRemove = (idx: number) => {
    const newList = playlist.filter((_, i) => i !== idx);
    setPlaylist(newList);
    if (currentIdx >= newList.length)
      setCurrentIdx(Math.max(0, newList.length - 1));
  };

  const handleNext = () => {
    if (playlist.length > 0) setCurrentIdx((currentIdx + 1) % playlist.length);
  };

  const handlePrev = () => {
    if (playlist.length > 0)
      setCurrentIdx((currentIdx - 1 + playlist.length) % playlist.length);
  };

  const handleSeek = (val: number[]) => {
    setProgress(val[0]);
    if (playerRef.current) playerRef.current.seekTo(val[0], true);
  };

  const handleVolume = (val: number[]) => {
    setVolume(val[0]);
    setIsMuted(val[0] === 0);
    if (playerRef.current) playerRef.current.setVolume(val[0]);
  };

  const toggleMute = () => {
    setIsMuted((m) => {
      if (playerRef.current) playerRef.current.setVolume(m ? volume : 0);
      return !m;
    });
  };

  const handleEditTitle = (idx: number) => {
    setEditingIndex(idx);
    setEditingTitle(playlist[idx].title);
  };

  const saveEditedTitle = () => {
    if (editingIndex === null) return;
    setPlaylist((pl) =>
      pl.map((item, idx) =>
        idx === editingIndex
          ? { ...item, title: editingTitle.trim() || item.title }
          : item
      )
    );
    setEditingIndex(null);
    setEditingTitle("");
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingTitle("");
  };

  const handleResetAll = () => {
    localStorage.clear();
    setPlaylist([
      {
        id: "lTRiuFIWV54",
        url: "https://youtu.be/lTRiuFIWV54?t=20",
        title: "lofi hip hop radio - beats to relax/study to",
      },
    ]);
    setCurrentIdx(0);
    setPlaying(true);
    setProgress(20);
    setDuration(0);
    setVolume(70);
    setIsMuted(false);
    setInput("");
    setEditingIndex(null);
    setEditingTitle("");
    setShowVideo(false);
  };

  function formatTime(sec: number) {
    if (!sec || isNaN(sec)) return "0:00";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s}` : `${m}:${s}`;
  }

  // Only one YouTube player instance, always in the DOM
  // Use CSS to hide/show video
  const playerStyle: React.CSSProperties = showVideo
    ? { display: "block", width: "100%" }
    : {
        position: "absolute",
        left: "-9999px",
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: "none",
      };

  return (
    <Card className="max-w-md mx-auto p-4 space-y-4 h-full flex flex-col">
      {/* Player */}
      <div className="flex flex-col gap-2 items-center">
        <Slider
          value={[progress]}
          max={duration || 100}
          min={0}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between w-full text-xs text-muted-foreground">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="flex items-center gap-4 justify-center mt-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handlePrev}
            disabled={playlist.length < 2}
          >
            <SkipBack />
          </Button>
          <Button
            size="icon"
            variant="default"
            onClick={() => {
              setPlaying((p) => {
                if (playerRef.current) {
                  if (p) playerRef.current.pauseVideo();
                  else playerRef.current.playVideo();
                }
                return !p;
              });
            }}
            disabled={!current}
          >
            {playing ? <Pause /> : <Play />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleNext}
            disabled={playlist.length < 2}
          >
            <SkipForward />
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full mt-2">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted ? <VolumeX /> : <Volume2 />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={100}
            min={0}
            step={1}
            onValueChange={handleVolume}
            className="flex-1"
          />
          <span className="text-xs">{isMuted ? 0 : volume}%</span>
        </div>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => setShowVideo((v) => !v)}
          disabled={!current}
        >
          <Video className="mr-2 h-4 w-4" />
          {showVideo ? "Hide Video" : "Show Video"}
        </Button>
        {/* YouTube Player - always in DOM, visibility toggled by CSS */}
        {current && (
          <div
            style={playerStyle}
            className="aspect-video w-full rounded overflow-hidden mt-2"
          >
            <YouTube
              videoId={current.id}
              opts={{
                width: "100%",
                height: "315",
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  modestbranding: 1,
                  rel: 0,
                },
              }}
              onReady={onPlayerReady}
              onStateChange={onStateChange}
            />
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <Input
          placeholder="Enter YouTube URL"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAdd();
              // Start playing the newly added video
              setTimeout(() => setPlaying(true), 0);
            }
          }}
          className="flex-1 min-w-0"
        />
        <Button
          onClick={() => {
            handleAdd();
            setTimeout(() => setPlaying(true), 0);
          }}
          disabled={!extractYouTubeId(input)}
        >
          Add
        </Button>
      </div>
      {/* Playlist */}
      <div className="flex-1 flex flex-col">
        <div className="font-semibold mb-2">Playlist</div>
        <ScrollArea className="max-h-40 w-full rounded-md border">
          <ul className="space-y-1 p-1">
            {playlist.map((item, idx) => (
              <li
                key={item.id}
                className={`flex items-center gap-2 rounded ${
                  idx === currentIdx ? "bg-muted/50 font-bold" : ""
                }`}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCurrentIdx(idx)}
                >
                  {idx + 1}
                </Button>
                <div className="flex items-center flex-1 min-w-0 justify-between">
                  {editingIndex === idx ? (
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditedTitle();
                          if (e.key === "Escape") cancelEditing();
                        }}
                        className="p-1 text-sm"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={saveEditedTitle}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={cancelEditing}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="truncate flex-1 min-w-0 max-w-[120px]">
                      {item.title}
                    </span>
                  )}
                  <div className="flex-shrink-0 flex gap-1 ml-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditTitle(idx)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleRemove(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    </Card>
  );
}
