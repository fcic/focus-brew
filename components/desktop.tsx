"use client";

import type React from "react";
import { motion } from "framer-motion";
import { DonationDialog } from "@/components/ui/donation-dialog";

interface DesktopProps {
  children: React.ReactNode;
}

export function Desktop({ children }: DesktopProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 pt-7 pb-20 px-4 overflow-hidden bg-gradient-to-br from-black/5 to-black/10 dark:from-background dark:to-muted/20"
    >
      <div className="relative w-full h-full">
        <div
          className="absolute inset-0 bg-grid-white/[0.02] bg-grid-pattern"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent, black, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, black, transparent)",
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
      <DonationDialog />
    </motion.div>
  );
}
