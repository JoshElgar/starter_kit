"use client";

import React, { useEffect, useState, useRef } from "react";

const COLUMNS = 40;
const PILLS_PER_COLUMN = 10;
const MIN_ACTIVE_PILLS = 2;
const MAX_ACTIVE_PILLS = 10;

// Colors from the provided image
const colors = [
  "#7B68EE", // medium purple
  "#00BFFF", // deep sky blue
  "#F5F5DC", // cream/beige
  "#FFD700", // gold/yellow
  "#FF69B4", // hot pink
  "#00FA9A", // medium spring green
  "#9370DB", // medium purple
];

interface ColumnProps {
  pills: number;
  color: string;
  index: number;
}

const Column: React.FC<ColumnProps> = ({ pills, color, index }) => {
  const pillsArray = Array.from({ length: PILLS_PER_COLUMN }, (_, i) => i);

  // Generate random colors for each pill
  const pillColors = useRef(
    Array.from(
      { length: PILLS_PER_COLUMN },
      () => colors[Math.floor(Math.random() * colors.length)]
    )
  );

  return (
    <div className="flex flex-col-reverse items-center gap-[6px] h-full justify-start py-2">
      {pillsArray.map((pillIndex) => {
        const isActive = pillIndex < pills;

        return (
          <div
            key={pillIndex}
            className="w-[18px] h-[8px] rounded-full transition-all duration-75"
            style={{
              backgroundColor: isActive
                ? pillColors.current[pillIndex]
                : "transparent",
              opacity: isActive ? 1 : 0,
            }}
          />
        );
      })}
    </div>
  );
};

export function AudioVisualizer() {
  const [columns, setColumns] = useState<ColumnProps[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const animationStates = useRef<
    Array<{
      direction: "up" | "down";
      pauseCounter: number;
      currentHeight: number;
      speed: number;
    }>
  >([]);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Normalize mouse position relative to container (0-1)
        setMousePosition({
          x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
          y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Initialize columns with random colors
  useEffect(() => {
    const newColumns = Array.from({ length: COLUMNS }, (_, i) => ({
      pills: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      index: i,
    }));

    // Initialize animation states with varied speeds and starting positions
    animationStates.current = Array.from({ length: COLUMNS }, () => ({
      direction: Math.random() > 0.5 ? "up" : "down",
      pauseCounter: Math.floor(Math.random() * 8),
      currentHeight: Math.floor(Math.random() * MAX_ACTIVE_PILLS),
      speed: Math.random() * 0.5 + 0.5,
    }));

    setColumns(newColumns);
  }, []);

  // Animation with mouse influence
  useEffect(() => {
    if (columns.length === 0) return;

    const updateHeights = () => {
      return columns.map((column, i) => {
        const state = animationStates.current[i];

        // If pausing, decrement counter and keep same height
        if (state.pauseCounter > 0) {
          state.pauseCounter--;
          return { ...column, pills: state.currentHeight };
        }

        // Apply speed factor - only update some columns each frame based on their speed
        if (Math.random() > state.speed) {
          return { ...column, pills: state.currentHeight };
        }

        // Calculate mouse influence
        // Columns closer to mouse X position get a boost
        const columnPosition = i / COLUMNS;
        const distanceFromMouse = Math.abs(columnPosition - mousePosition.x);
        const mouseInfluence = Math.max(0, 1 - distanceFromMouse * 2);

        // Add a small boost to max height based on mouse proximity
        const effectiveMaxHeight = Math.min(
          MAX_ACTIVE_PILLS,
          MIN_ACTIVE_PILLS +
            (MAX_ACTIVE_PILLS - MIN_ACTIVE_PILLS) * (1 + mouseInfluence * 0.3)
        );

        // Otherwise, move up or down
        if (state.direction === "up") {
          state.currentHeight++;

          // If reached top, change direction and set pause
          if (state.currentHeight >= effectiveMaxHeight) {
            state.direction = "down";
            state.pauseCounter = Math.floor(Math.random() * 3);
          }
        } else {
          state.currentHeight--;

          // If reached bottom, change direction and set pause
          if (state.currentHeight <= MIN_ACTIVE_PILLS) {
            state.direction = "up";
            state.pauseCounter = Math.floor(Math.random() * 3);
          }
        }

        return { ...column, pills: state.currentHeight };
      });
    };

    // Update at a faster interval
    const interval = setInterval(() => {
      setColumns(updateHeights);
    }, 80);

    return () => clearInterval(interval);
  }, [columns, mousePosition]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-end justify-between px-8"
    >
      {columns.map((column, index) => (
        <Column
          key={index}
          pills={column.pills}
          color={column.color}
          index={index}
        />
      ))}
    </div>
  );
}
