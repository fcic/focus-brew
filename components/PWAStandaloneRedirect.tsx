"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function PWAStandaloneRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if app is running in standalone mode (installed PWA)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    // Listen for app installation
    if ("onappinstalled" in window) {
      window.addEventListener("appinstalled", (event) => {
        // Set a flag to redirect to /app on next launch
        localStorage.setItem("pwa_installed", "true");

        // Optionally redirect immediately if desired
        if (pathname !== "/app") {
          router.replace("/app");
        }
      });
    }

    // Redirect to /app in these cases:
    // 1. App is running in standalone mode and not already on /app
    // 2. App was just installed and this is the first load after installation
    if (
      (isStandalone || localStorage.getItem("pwa_installed") === "true") &&
      pathname !== "/app"
    ) {
      router.replace("/app");

      // Clear the installation flag after redirection
      if (!isStandalone && localStorage.getItem("pwa_installed") === "true") {
        localStorage.removeItem("pwa_installed");
      }
    }
  }, [pathname, router]);

  return null;
}
