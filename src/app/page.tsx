"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "../lib/utils";
import gsap from "gsap";

// Accordion component with minimal design
const Accordion = ({ title, content }: { title: string; content: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-3">
      <button
        className="flex w-full justify-between items-center text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium text-gray-800">{title}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-40 mt-2" : "max-h-0"
        }`}
      >
        <p className="text-xs text-gray-600 leading-relaxed">{content}</p>
      </div>
    </div>
  );
};

export default function Home() {
  const headerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    // Update time every minute
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentTime(timeString);
    };

    // Initial time update
    updateTime();

    // Set interval for time updates
    const timeInterval = setInterval(updateTime, 60000);

    // Header animation
    gsap.set(headerRef.current, {
      y: -20,
      opacity: 0,
    });

    gsap.to(headerRef.current, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
    });

    // Canvas setup
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    let cw = (canvas.width = window.innerWidth);
    let ch = (canvas.height = window.innerHeight);

    // Simple pixelation settings
    const pixelSize = 5; // Size of each pixel block
    let centerX = cw / 2;
    let centerY = ch / 2;

    // Colors for the vortex
    const vortexColors = [
      "#112D4E", // Dark blue
      "#1A4B8C", // Medium blue
      // "#3F72AF", // Light blue
      // "#295288", // Between medium and light blue
      // "#3F72AF", // Light blue again
      // "#112D4E", // Back to dark blue
    ];

    // Function to calculate distance from center
    const getDistance = (x: number, y: number) => {
      const dx = x - centerX;
      const dy = y - centerY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Function to calculate angle from center
    const getAngle = (x: number, y: number) => {
      return Math.atan2(y - centerY, x - centerX);
    };

    // Draw the swirling vortex
    function drawVortex(timestamp: number) {
      if (!ctx) return;

      // Calculate delta time - for consistent animation
      const newTime = timestamp || 0;
      const delta = newTime - (timeRef.current || newTime);
      timeRef.current = newTime;

      // Increase time speed multiplier for faster animation
      const timeSpeed = 3; // Much faster than previous 0.05
      const time = newTime * timeSpeed;

      // Clear canvas
      ctx.fillStyle = "#112D4E"; // Dark background
      ctx.fillRect(0, 0, cw, ch);

      // Calculate max distance for normalization
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

      // Draw pixelated vortex
      for (let x = 0; x < cw; x += pixelSize) {
        for (let y = 0; y < ch; y += pixelSize) {
          // Get distance and angle from center
          const distance = getDistance(x, y);
          const angle = getAngle(x, y);

          // Normalize distance for color selection
          const normalizedDist = distance / maxDistance;

          // Create swirl effect with faster rotation
          const swirl = angle + (1 - normalizedDist) * (time / 2000); // Faster rotation (was 10000)

          // Faster pulsing effect
          const pulse = Math.sin(time / 2000) * 0.15; // Faster pulse (was 5000)

          // Calculate color index based on angle and distance
          const colorIndex = Math.floor(
            ((swirl / (Math.PI * 2)) * vortexColors.length + pulse) %
              vortexColors.length
          );

          // Get color
          const color =
            vortexColors[Math.abs(colorIndex) % vortexColors.length];

          // Skip some pixels based on distance and angle to create gaps in the swirl
          const skipPixel =
            Math.sin(swirl * 5) * Math.cos(normalizedDist * 6 + time / 3000) <
            -0.35;

          if (!skipPixel) {
            ctx.fillStyle = color;

            // Make pixels smaller as they get closer to center
            const dynamicSize = pixelSize * (0.5 + normalizedDist * 0.5);

            // Draw pixel with more movement for faster swirl effect
            ctx.fillRect(
              x - dynamicSize / 2 + Math.cos(swirl) * (1 - normalizedDist) * 2,
              y - dynamicSize / 2 + Math.sin(swirl) * (1 - normalizedDist) * 2,
              dynamicSize,
              dynamicSize
            );
          }
        }
      }

      // Create a circular gradient that's stronger at the center
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        maxDistance * 0.5
      );
      gradient.addColorStop(0, "rgba(63, 114, 175, 0.18)"); // Light blue glow
      gradient.addColorStop(1, "rgba(17, 45, 78, 0)"); // Fade to transparent

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, cw, ch);

      // Grid lines - rotate faster
      ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
      ctx.lineWidth = 0.4;

      // Draw spiral grid lines - faster rotation
      const spiralCount = 6; // More spiral lines
      for (let r = 0; r < Math.max(cw, ch); r += maxDistance / spiralCount) {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.02) {
          const spiralR = r + (a * maxDistance) / 12;
          const x = centerX + Math.cos(a + time / 8000) * spiralR; // Faster rotation (was 30000)
          const y = centerY + Math.sin(a + time / 8000) * spiralR;

          if (a === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Animate
      animationRef.current = requestAnimationFrame(drawVortex);
    }

    // Start animation
    animationRef.current = requestAnimationFrame(drawVortex);

    // Handle resize
    const handleResize = () => {
      cw = canvas.width = window.innerWidth;
      ch = canvas.height = window.innerHeight;
      // Update center position
      centerX = cw / 2;
      centerY = ch / 2;
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(timeInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Sample accordion data
  const accordionItems = [
    {
      title: "About",
      content:
        "Designer and developer based in New York. Specializing in minimal and functional interfaces.",
    },
    {
      title: "Experience",
      content:
        "Over 10 years of experience in web and mobile development. Worked with various startups and established companies.",
    },
    {
      title: "Skills",
      content:
        "JavaScript, React, TypeScript, Node.js, UI/UX Design, Product Development",
    },
    {
      title: "Projects",
      content:
        "Portfolio websites, e-commerce platforms, mobile applications, and digital experiences.",
    },
    {
      title: "Contact",
      content: "hello@joshelgar.com",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0" />

      {/* Top left name */}
      <div className="fixed top-8 left-8 z-20">
        <div className="text-3xl font-bold text-white">Josh Elgar</div>
      </div>

      <main className="flex-1 relative z-10">
        {/* Empty main content as requested */}
      </main>

      {/* Floating white card on right side */}
      <div
        className="fixed right-8 top-8 bottom-8 z-10 
                    w-1/3 
                    md:w-1/3 
                    sm:w-3/4 sm:right-0 sm:top-0 sm:bottom-0
                    bg-white shadow-xl rounded-l-xl
                    h-auto max-h-[calc(100vh-64px)]"
      >
        <div className="p-6 sm:p-4 h-full overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xs uppercase tracking-widest text-gray-500">
              Information
            </h2>
          </div>

          {/* Accordions */}
          <div className="space-y-1">
            {accordionItems.map((item, index) => (
              <Accordion
                key={index}
                title={item.title}
                content={item.content}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Large time display in bottom left */}
      <div className="fixed bottom-8 left-8 z-20">
        <div className="text-5xl font-bold text-white">{currentTime}</div>
      </div>
    </div>
  );
}
