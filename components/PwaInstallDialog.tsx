"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FirefoxInstallDialog from "./FirefoxInstallDialog";

export default function PwaInstallDialog() {
  const pwaRef = useRef<
    HTMLElement & {
      showDialog: (forced?: boolean) => void;
      install: () => void;
    }
  >(null);
  const [isFirefox, setIsFirefox] = useState(false);
  const [isMacOS, setIsMacOS] = useState(false);
  const [showFirefoxDialog, setShowFirefoxDialog] = useState(false);
  const [isFirefoxMacOS, setIsFirefoxMacOS] = useState(false);
  const router = useRouter();

  useEffect(() => {
    import("@khmyznikov/pwa-install");

    // Handle successful installation through appinstalled event
    if (typeof window !== "undefined" && "onappinstalled" in window) {
      window.addEventListener("appinstalled", (event) => {
        // Set flag for redirection to /app on next launch
        localStorage.setItem("pwa_installed", "true");
        // Close any open dialogs
        const dialogElement = document.querySelector(".pwa-dialog");
        if (dialogElement) {
          dialogElement.remove();
        }
      });
    }
  }, []);

  useEffect(() => {
    if (pwaRef.current) {
      // Expose to window for global access
      // @ts-ignore
      window.pwaInstallDialog = pwaRef.current;

      // Check if PWA is installable
      if (typeof window !== "undefined") {
        // Detect OS and browser
        const firefoxDetected =
          navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
        const macOSDetected =
          navigator.platform.toLowerCase().indexOf("mac") > -1 ||
          /mac/i.test(navigator.userAgent);

        setIsFirefox(firefoxDetected);
        setIsMacOS(macOSDetected);

        // Check if it's not already installed as PWA
        const isStandalone =
          window.matchMedia("(display-mode: standalone)").matches ||
          (window.navigator as any).standalone === true;

        // For Firefox, we'll use forced mode since it doesn't support beforeinstallprompt
        if (firefoxDetected && !isStandalone && !macOSDetected) {
          // Only for non-macOS Firefox browsers, show the default dialog
          if (!sessionStorage.getItem("pwaPromptShown")) {
            // For regular Firefox, show the normal dialog with delay
            setTimeout(() => {
              if (pwaRef.current) {
                // Use forced mode (true parameter) for Firefox
                pwaRef.current.showDialog(true);
                sessionStorage.setItem("pwaPromptShown", "true");

                // Add global Firefox-specific click handler
                const globalClickHandler = (e: MouseEvent) => {
                  const target = e.target as HTMLElement;
                  if (
                    target &&
                    (target.classList.contains("pwa-btn-install") ||
                      target.classList.contains("pwa-btn") ||
                      (target.tagName === "BUTTON" &&
                        target.closest(".pwa-dialog")))
                  ) {
                    setTimeout(() => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsFirefoxMacOS(false);
                      setShowFirefoxDialog(true);
                    }, 50);
                  }
                };

                // Add the event listener
                document.addEventListener("click", globalClickHandler, true);

                // Store reference to remove it later if needed
                // @ts-ignore
                window._firefoxInstallHandler = globalClickHandler;
              }
            }, 1500);
          }
        } else if (!isStandalone && !firefoxDetected) {
          // Standard behavior for Chrome and other supported browsers
          window.addEventListener("beforeinstallprompt", (e) => {
            // Show the install dialog on all routes
            if (pwaRef.current && !sessionStorage.getItem("pwaPromptShown")) {
              // Optional: Delay showing the dialog
              setTimeout(() => {
                if (pwaRef.current) {
                  pwaRef.current.showDialog();
                  // Set session flag to avoid showing dialog too frequently
                  sessionStorage.setItem("pwaPromptShown", "true");
                }
              }, 2000);
            }
          });
        }

        // Handle "Add to Dock" button click
        // @ts-ignore
        window.showPWAInstallDialog = () => {
          if (pwaRef.current) {
            if (firefoxDetected && macOSDetected) {
              // For Firefox on macOS, directly show our custom dialog
              setIsFirefoxMacOS(true);
              setShowFirefoxDialog(true);
            } else {
              // For other browsers, show the standard dialog
              pwaRef.current.showDialog(true);

              // Setup Firefox install button listener for non-macOS Firefox
              if (firefoxDetected && !macOSDetected) {
                const globalClickHandler = (e: MouseEvent) => {
                  const target = e.target as HTMLElement;
                  if (
                    target &&
                    (target.classList.contains("pwa-btn-install") ||
                      target.classList.contains("pwa-btn") ||
                      (target.tagName === "BUTTON" &&
                        target.closest(".pwa-dialog")))
                  ) {
                    setTimeout(() => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsFirefoxMacOS(false);
                      setShowFirefoxDialog(true);
                    }, 50);
                  }
                };

                // Add the event listener
                document.addEventListener("click", globalClickHandler, true);

                // Store reference to remove it later if needed
                // @ts-ignore
                window._firefoxInstallHandler = globalClickHandler;
              }
            }
          }
        };
      }
    }
  }, []);

  return (
    <>
      {/* @ts-ignore - pwa-install is a custom element */}
      <pwa-install
        ref={pwaRef}
        manifest-url="/manifest.json"
        use-local-storage="true"
        disable-android-fallback="false"
        manual-apple="false"
      />

      <FirefoxInstallDialog
        open={showFirefoxDialog}
        onOpenChange={setShowFirefoxDialog}
        isMacOS={isFirefoxMacOS}
      />
    </>
  );
}
