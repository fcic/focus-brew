"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FirefoxInstallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMacOS?: boolean;
}

export function FirefoxInstallDialog({
  open,
  onOpenChange,
  isMacOS = false,
}: FirefoxInstallDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Install FocusBrew in Firefox{isMacOS ? " for macOS" : ""}
          </DialogTitle>
          {isMacOS ? (
            <DialogDescription>
              For the best experience, we recommend installing FocusBrew as a
              PWA using Safari on macOS.
            </DialogDescription>
          ) : (
            <DialogDescription>
              Follow these steps to install FocusBrew in Firefox.
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-4 py-4">
          {isMacOS ? (
            <div className="text-sm">
              <p className="mb-4">
                Safari provides the best PWA experience on macOS:
              </p>
              <ol className="ml-5 mb-5 space-y-2 list-decimal">
                <li>Open Safari browser</li>
                <li>
                  Visit{" "}
                  <code className="px-1.5 py-0.5 bg-muted rounded font-semibold text-primary">
                    https://focusbrew.vercel.app/app
                  </code>{" "}
                  in Safari
                </li>
                <li>Click the share icon in the toolbar</li>
                <li>Select "Add to Dock" or "Add to Home Screen"</li>
                <li>Name it "FocusBrew" and click Add</li>
              </ol>
              <p className="mb-4">
                You can now launch FocusBrew as a standalone app from your dock.
              </p>
              <p className="text-muted-foreground text-xs italic">
                Note: Firefox on macOS has limited PWA support. Safari provides
                a better installation experience.
              </p>
            </div>
          ) : (
            <div className="text-sm">
              <p className="mb-4">In Firefox, you need to:</p>
              <ol className="ml-5 mb-5 space-y-2 list-decimal">
                <li>Click on the address bar at the top</li>
                <li>Click the + icon on the right side of the address bar</li>
                <li>Select "Add to Home Screen" or "Install"</li>
              </ol>
              <p>
                Firefox will guide you through the rest of the installation
                process.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FirefoxInstallDialog;
