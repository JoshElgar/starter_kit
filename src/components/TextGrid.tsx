"use client";

import { useState, useEffect, useRef } from "react";
import { textBoxes } from "./TextGridData";

interface TextGridProps {
  className?: string;
}

export default function TextGrid({ className = "" }: TextGridProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [visibleBoxes, setVisibleBoxes] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Check if we're on mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial state
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle hover changes
  useEffect(() => {
    if (hoveredIndex !== null && hoveredIndex !== previousIndex) {
      setPreviousIndex(previousIndex !== null ? previousIndex : null);
    }
  }, [hoveredIndex, previousIndex]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      // Update visible boxes based on scroll position
      updateVisibleBoxes();
    };

    // Set up scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Initial check for visible boxes
    setTimeout(() => {
      updateVisibleBoxes();
    }, 100);

    // Clean up
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update which boxes should be visible based on scroll position
  const updateVisibleBoxes = () => {
    const viewportHeight = window.innerHeight;
    const newVisibleBoxes = new Set<number>();

    // Check each box to see if it's in the viewport
    boxRefs.current.forEach((boxRef, index) => {
      if (boxRef) {
        const rect = boxRef.getBoundingClientRect();
        const boxTop = rect.top;
        const boxBottom = rect.bottom;

        // Box is visible if it's in the viewport
        if (boxTop < viewportHeight * 0.9 && boxBottom > viewportHeight * 0.1) {
          newVisibleBoxes.add(index);
        }
      }
    });

    setVisibleBoxes(newVisibleBoxes);
  };

  // Set up refs for each box
  const setBoxRef = (el: HTMLDivElement | null, index: number) => {
    boxRefs.current[index] = el;
  };

  // Handle mouse enter
  const handleMouseEnter = (index: number) => {
    if (hoveredIndex !== index) {
      setPreviousIndex(hoveredIndex);
      setHoveredIndex(index);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setPreviousIndex(hoveredIndex);
    setHoveredIndex(null);
  };

  return (
    <div className={`px-2 sm:px-4 ${className} relative`}>
      {/* Background container */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: "black",
          opacity: hoveredIndex !== null || previousIndex !== null ? 1 : 0,
          zIndex: 0,
          transition: "opacity 1.5s ease-in-out",
          overflow: "hidden",
        }}
      >
        {/* Current emoji */}
        {hoveredIndex !== null && (
          <div
            className="absolute inset-0 flex justify-center items-center"
            style={{
              filter: "blur(120px)",
              fontSize: "1000px",
              opacity: 0.6,
              transform: "scale(1.5)",
              transition: "opacity 1.5s ease-in-out",
            }}
          >
            {textBoxes[hoveredIndex].emoji}
          </div>
        )}

        {/* Previous emoji (fading out) */}
        {previousIndex !== null && previousIndex !== hoveredIndex && (
          <div
            className="absolute inset-0 flex justify-center items-center"
            style={{
              filter: "blur(120px)",
              fontSize: "1000px",
              opacity: hoveredIndex !== null ? 0 : 0.6,
              transform: "scale(1.5)",
              transition: "opacity 1.5s ease-in-out",
            }}
          >
            {textBoxes[previousIndex].emoji}
          </div>
        )}
      </div>

      <div
        ref={gridRef}
        className="flex flex-wrap items-stretch justify-center w-full max-w-7xl mx-auto relative z-10"
        style={{ alignContent: "stretch", alignItems: "stretch" }}
      >
        {textBoxes.map((item, index) => {
          // On mobile, show fewer items
          if (isMobile && index >= 12) {
            return null;
          }

          // Determine if this box should be visible
          const isVisible = isMobile || visibleBoxes.has(index);

          return (
            <div
              key={index}
              ref={(el) => setBoxRef(el, index)}
              className={`
                border border-white/30 px-1 sm:px-1.5 py-1 sm:py-4 transition-all duration-300 ease-in-out
                hover:border-white/90 cursor-default flex-grow
                ${isVisible ? "opacity-100" : "opacity-0"}
                w-[calc(50%-1px)] sm:w-auto
              `}
              style={{ marginRight: "-1px", marginBottom: "-1px" }}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <span className="text-xs sm:text-xl text-white/90 p-1 sm:p-2 flex items-center h-full">
                <span className="text-base sm:text-2xl mr-1 sm:mr-2">
                  {item.emoji}
                </span>
                <span className="text-[10px] sm:text-xs md:text-xl leading-tight whitespace-nowrap">
                  {item.text}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
