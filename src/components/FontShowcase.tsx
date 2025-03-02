"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { fonts } from "./fonts";

export function FontShowcase() {
  const tickerRef = useRef<HTMLDivElement>(null);

  // Create a single row of fonts for the ticker
  const tickerFonts = [...fonts, ...fonts]; // Duplicate fonts for seamless looping

  // Set up the animation
  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    // Function to check if we need to reset position
    const checkPosition = () => {
      if (!ticker) return;

      const containerWidth = ticker.offsetWidth;
      const firstRowWidth = ticker.children[0]?.offsetWidth || 0;

      // When we've scrolled past the first set of fonts, reset to beginning
      if (ticker.scrollLeft >= firstRowWidth) {
        ticker.scrollLeft = 0;
      } else {
        // Continue scrolling
        ticker.scrollLeft += 1;
      }

      requestAnimationFrame(checkPosition);
    };

    // Start the animation
    const animationId = requestAnimationFrame(checkPosition);

    // Cleanup
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative w-full mx-auto overflow-hidden">
      {/* Ticker container */}
      <div
        ref={tickerRef}
        className="flex overflow-x-auto scrollbar-hide py-4 px-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          whiteSpace: "nowrap",
        }}
      >
        {/* First set of fonts */}
        <div className="flex gap-8 pr-8">
          {tickerFonts.map((font, index) => (
            <div
              key={`${font.name}-${index}`}
              className="flex-shrink-0 border border-border/50 rounded-lg p-4 bg-card"
            >
              <p className={cn(font.className, "text-3xl")}>{font.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Softer gradient fades for better UX */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background via-background/70 to-transparent pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background via-background/70 to-transparent pointer-events-none"></div>
    </div>
  );
}
