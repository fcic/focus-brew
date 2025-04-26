import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Trash2, Upload } from "lucide-react";

interface Props {
  wallpaper: string;
  setWallpaper: (wallpaper: string) => void;
  selectedWallpaper: string;
  setSelectedWallpaper: (wallpaper: string) => void;
  customWallpapers: string[];
  setCustomWallpapers: (wallpapers: string[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  wallpapers: string[];
}

export function SettingsWallpaperTab({
  wallpaper,
  setWallpaper,
  selectedWallpaper,
  setSelectedWallpaper,
  customWallpapers,
  setCustomWallpapers,
  fileInputRef,
  handleFileUpload,
  wallpapers,
}: Props) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-1">Wallpaper</h2>
        <p className="text-muted-foreground text-xs mb-4">Choose a background for your workspace.</p>
        <div className="grid grid-cols-2 gap-4">
          {wallpapers.map((wp) => (
            <div
              key={wp}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${selectedWallpaper === wp ? "border-primary" : "border-transparent"}`}
              onClick={() => {
                setSelectedWallpaper(wp);
                setWallpaper(wp);
              }}
            >
              <img src={wp || "/placeholder.svg"} alt="Wallpaper" className="w-full h-32 object-cover" />
              {selectedWallpaper === wp && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {customWallpapers.map((wp, index) => (
            <div
              key={`custom-${index}`}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${selectedWallpaper === wp ? "border-primary" : "border-transparent"}`}
              onClick={() => {
                setSelectedWallpaper(wp);
                setWallpaper(wp);
              }}
            >
              <img src={wp || "/placeholder.svg"} alt={`Custom Wallpaper ${index + 1}`} className="w-full h-32 object-cover" />
              {selectedWallpaper === wp && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute bottom-2 right-2 h-6 w-6 min-w-0 p-0"
                onClick={e => {
                  e.stopPropagation();
                  const updated = customWallpapers.filter((_, i) => i !== index);
                  setCustomWallpapers(updated);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("custom_wallpapers", JSON.stringify(updated));
                  }
                  if (selectedWallpaper === wp) {
                    setSelectedWallpaper("/wallpapers/default.png");
                    setWallpaper("/wallpapers/default.png");
                  }
                }}
                aria-label="Delete wallpaper"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-1">Custom Wallpaper</h2>
        <p className="text-muted-foreground text-xs mb-4">Upload your own image as wallpaper.</p>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="bg-background/50">
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </div>
      </div>
    </>
  );
}
