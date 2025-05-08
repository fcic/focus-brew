"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedGroupProps {
  children: React.ReactNode;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  className?: string;
  delay?: number;
  staggerChildren?: number;
}

export function AnimatedGroup({
  children,
  variants,
  className,
  delay = 0,
  staggerChildren = 0.1,
}: AnimatedGroupProps) {
  const defaultVariants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren,
          delayChildren: delay,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          bounce: 0.3,
          duration: 1,
        },
      },
    },
  };

  const mergedVariants = {
    container: {
      ...defaultVariants.container,
      ...variants?.container,
    },
    item: {
      ...defaultVariants.item,
      ...variants?.item,
    },
  };

  // Map children to include item variants
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return <motion.div variants={mergedVariants.item}>{child}</motion.div>;
    }
    return child;
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={mergedVariants.container}
      className={cn(className)}
    >
      {childrenWithProps}
    </motion.div>
  );
}
