import React from "react";

export function SettingsAboutTab() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-2">About Coffee with Code</h2>
      <p className="text-muted-foreground mt-2 mb-4">Coffee with Code is your all-in-one minimalist productivity suite, crafted for creators and thinkers who love a calm, focused workspace. Enjoy a beautiful desktop with customizable wallpapers and fonts, a distraction-free menu bar, and a dock for quick access to your favorite tools.</p>
      <div className="space-y-4">
        <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
          <li>Ambient Sounds: Mix and play relaxing background sounds for deep work or relaxation.</li>
          <li>Dock: Quick access to your favorite tools.</li>
          <li>Exchange: View live currency exchange rates in your menu bar.</li>
          <li>Focus Timer: Boost your productivity with a Pomodoro-style timer.</li>
          <li>Kanban: Visualize your workflow and manage projects with drag-and-drop boards.</li>
          <li>Notes: Jot down quick notes or ideas in a clean notepad.</li>
          <li>Settings: Personalize your experience with themes, wallpapers, and more.</li>
          <li>Tasks: Organize your todos and stay on top of your day.</li>
          <li>Weather: Check the current weather right from your menu bar.</li>
        </ul>
        <p className="text-muted-foreground">
          Built with Next.js 15, Tailwind CSS, shadcn/ui, and a touch of Vibe Coding for a smooth, delightful experience. Open source, privacy-friendly, and designed for macOS vibes.
        </p>
      </div>
    </div>
  );
}
