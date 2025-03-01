"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { fonts } from "./fonts";

export function FontShowcase() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Split fonts into 3 rows
  const rowSize = Math.ceil(fonts.length / 3);
  const rows = [
    fonts.slice(0, rowSize),
    fonts.slice(rowSize, rowSize * 2),
    fonts.slice(rowSize * 2),
  ];

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 400; // Increased scroll amount for wider view
      const currentScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;

      // Simple approach: if we're near the end/beginning, first jump to the opposite end without animation
      // then animate the small distance for a seamless appearance
      if (direction === "left") {
        if (currentScroll < scrollAmount) {
          // Near the beginning, jump to near the end first
          container.scrollLeft = maxScroll - 50;
          setTimeout(() => {
            container.scrollTo({
              left: maxScroll - scrollAmount + currentScroll,
              behavior: "smooth",
            });
          }, 10);
        } else {
          container.scrollTo({
            left: currentScroll - scrollAmount,
            behavior: "smooth",
          });
        }
      } else {
        if (maxScroll - currentScroll < scrollAmount) {
          // Near the end, jump to near the beginning first
          container.scrollLeft = 50;
          setTimeout(() => {
            container.scrollTo({
              left: scrollAmount - (maxScroll - currentScroll),
              behavior: "smooth",
            });
          }, 10);
        } else {
          container.scrollTo({
            left: currentScroll + scrollAmount,
            behavior: "smooth",
          });
        }
      }
    }
  };

  return (
    <div className="relative w-full max-w-[95vw] mx-auto">
      {/* Navigation buttons - moved further out */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-[-48px] top-1/2 -translate-y-1/2 z-10 bg-background/80 p-2 rounded-full shadow-sm border border-border hover:bg-accent"
        aria-label="Scroll left"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-[-48px] top-1/2 -translate-y-1/2 z-10 bg-background/80 p-2 rounded-full shadow-sm border border-border hover:bg-accent"
        aria-label="Scroll right"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* Carousel container - wider */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-6 py-4 px-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex flex-col gap-6 min-w-[95vw]">
          {rows.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex gap-6">
              {row.map((font) => (
                <div
                  key={font.name}
                  className="min-w-[380px] flex-shrink-0 snap-start space-y-3 border border-border/50 rounded-lg p-4 bg-card"
                >
                  <div className="flex items-center">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {font.name}
                    </p>
                    <div className="h-px flex-1 bg-border/50 ml-4"></div>
                  </div>
                  <p className={cn(font.className, "text-2xl")}>
                    {font.sample}
                  </p>
                </div>
              ))}
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
