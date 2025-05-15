"use client";
import { useEffect } from "react";

export default function PWAServiceWorker() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker as soon as the component mounts
      // rather than waiting for window load event
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log(
            "Service Worker registered successfully:",
            registration.scope
          );
        })
        .catch((err) =>
          console.error("Service Worker registration failed:", err)
        );

      // Listen for any service worker updates
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("Service Worker updated");
      });
    }
  }, []);

  return null;
}
