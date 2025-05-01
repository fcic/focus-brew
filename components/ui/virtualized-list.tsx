import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  className?: string;
  overscan?: number;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  className,
  overscan = 5,
  onEndReached,
  endReachedThreshold = 200,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
    setScrollTop(scrollTop);

    // Check if we're nearing the end of the list
    if (
      onEndReached &&
      scrollHeight - scrollTop - clientHeight < endReachedThreshold
    ) {
      onEndReached();
    }
  }, [onEndReached, endReachedThreshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container) {
          setContainerHeight(entry.contentRect.height);
        }
      }
    });

    resizeObserver.observe(container);
    container.addEventListener("scroll", handleScroll);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Calculate the range of visible items
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * overscan;
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount);

  // Total height of all items
  const totalHeight = items.length * itemHeight;

  // Calculate offset for each item
  const offsetY = startIndex * itemHeight;

  // Visible items
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto relative", className)}
      style={{ willChange: "transform" }}
      role="list"
    >
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: totalHeight }}
      >
        <div
          className="absolute top-0 left-0 right-0"
          style={{ transform: `translateY(${offsetY}px)` }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              className="absolute left-0 right-0"
              style={{
                height: itemHeight,
                transform: `translateY(${
                  (startIndex + index) * itemHeight - offsetY
                }px)`,
              }}
              role="listitem"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
