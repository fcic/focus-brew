"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface BootloaderProps {
  onComplete: () => void;
  minimumDisplayTime?: number;
}

export const Bootloader = ({
  onComplete,
  minimumDisplayTime = 2000,
}: BootloaderProps) => {
  const [progress, setProgress] = useState(0);
  const [theme] = useLocalStorage("theme", "dark");

  useEffect(() => {
    const startTime = Date.now();
    let frameId: number;
    let completed = false;

    const animateProgress = () => {
      // Gradually increase progress
      setProgress((prev) => {
        const newProgress = Math.min(prev + 0.7, 100);

        // Check if we've reached 100% and minimum time has passed
        if (newProgress >= 100 && !completed) {
          completed = true;
          const elapsedTime = Date.now() - startTime;

          // If minimum display time hasn't passed, wait for it
          if (elapsedTime < minimumDisplayTime) {
            setTimeout(onComplete, minimumDisplayTime - elapsedTime);
          } else {
            onComplete();
          }
          return 100;
        }

        // Continue animation if not yet complete
        if (!completed) {
          frameId = requestAnimationFrame(animateProgress);
        }

        return newProgress;
      });
    };

    frameId = requestAnimationFrame(animateProgress);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [onComplete, minimumDisplayTime]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        backgroundColor: "#000000",
        color: "#ffffff",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-32 h-32 mb-8">
          <Image
            src="/icon.png"
            alt="FocusBrew"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        <div className="w-64 mb-4 relative overflow-hidden rounded-full">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ opacity: 0.6, mixBlendMode: "overlay" }}
          />
          <Progress value={progress} className="h-2 bg-gray-800" />
        </div>

        <motion.p
          className="text-sm text-white/70 mt-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          FocusBrew
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
