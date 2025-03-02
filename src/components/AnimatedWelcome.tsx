"use client";

import React, { useState, useEffect, useRef } from "react";

export function AnimatedWelcome() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fontIndices, setFontIndices] = useState<number[]>(Array(7).fill(0));
  const [isResetting, setIsResetting] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isNearby, setIsNearby] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const text = "Welcome";

  const fonts = [
    "font-array",
    "font-clash",
    "font-luckybones",
    "font-dujitsu",
    "font-atlantico",
    "font-comico",
    "font-advercase",
    "font-airone",
    "font-kihim",
    "font-offbit",
    "font-ppmori",
    "font-jellee",
    "font-hind",
    "font-geist",
    "font-blmelody",
    "font-author",
    "font-generalsans",
    "font-switzer",
    "font-satoshi",
    "font-worksans",
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (componentRef.current) {
        const rect = componentRef.current.getBoundingClientRect();
        const buffer = 50; // 50px buffer around the component

        const isInProximity =
          e.clientX >= rect.left - buffer &&
          e.clientX <= rect.right + buffer &&
          e.clientY >= rect.top - buffer &&
          e.clientY <= rect.bottom + buffer;

        setIsNearby(isInProximity);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleLetterClick = (index: number) => {
    setFontIndices((prev) => {
      const newIndices = [...prev];
      newIndices[index] = (newIndices[index] + 1) % fonts.length;
      return newIndices;
    });
  };

  const resetFonts = () => {
    setIsResetting(true);

    // Staggered reset animation
    const resetDelay = 50; // ms between each letter reset

    text.split("").forEach((_, index) => {
      setTimeout(() => {
        setFontIndices((prev) => {
          const newIndices = [...prev];
          newIndices[index] = 0;
          return newIndices;
        });

        // After the last letter is reset, turn off the resetting state
        if (index === text.length - 1) {
          setTimeout(() => setIsResetting(false), 300);
        }
      }, index * resetDelay);
    });
  };

  // Check if any font has been changed from the default
  const hasChangedFonts = fontIndices.some((index) => index !== 0);

  return (
    <div
      ref={componentRef}
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl relative transition-all duration-700">
        <span className="relative inline-block overflow-hidden">
          <div className="flex p-2">
            {text.split("").map((letter, index) => (
              <span
                key={index}
                className={`inline-block cursor-pointer px-[0.01em] origin-bottom transition-all duration-300 ${
                  isLoaded
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5"
                } ${
                  hoveredIndex === index && !isResetting
                    ? "text-primary -translate-y-2 scale-110 brightness-120"
                    : ""
                } ${isResetting ? "animate-pulse" : ""} ${
                  fonts[fontIndices[index]]
                }`}
                style={{
                  transitionDelay: `${index * 0.1}s`,
                }}
                onMouseEnter={() => !isResetting && setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => !isResetting && handleLetterClick(index)}
              >
                {letter}
                {hoveredIndex === index && !isResetting && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full transition-opacity duration-300" />
                )}
              </span>
            ))}
          </div>
        </span>
        {(isHovering || isNearby) && hasChangedFonts && (
          <button
            onClick={resetFonts}
            disabled={isResetting}
            className={`absolute -right-8 top-1/2 -translate-y-1/2 text-xs p-1 transition-all duration-300 ${
              isResetting
                ? "animate-spin opacity-100 text-primary"
                : "opacity-60 hover:opacity-100 hover:text-primary"
            }`}
            title="Reset fonts"
          >
            ↺
          </button>
        )}
      </h1>
    </div>
  );
}
