"use client";

import { useState, useEffect, useRef } from "react";
import { setCookie } from "@/utils/cookies";

interface SelfDestructSectionProps {
  className?: string;
  onSelfDestruct: () => void;
}

export default function SelfDestructSection({
  className = "",
  onSelfDestruct,
}: SelfDestructSectionProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showGreatChoice, setShowGreatChoice] = useState(false);
  const [cancelSelfDestruct, setCancelSelfDestruct] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Function to format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Function to speed up the timer
  const speedUpTimer = () => {
    if (timeLeft !== null && timeLeft > 5) {
      setTimeLeft(timeLeft - 5);
    } else if (timeLeft !== null && timeLeft > 0) {
      setTimeLeft(0);
    }
  };

  // Function to reset the timer and show "Great choice" message
  const handleWorkWithUs = (e: React.MouseEvent) => {
    // Don't prevent default - let the link open in a new tab
    setTimeLeft(60); // Reset to 60 seconds
    setShowGreatChoice(true);
    setCancelSelfDestruct(true); // Cancel the self-destruct sequence
  };

  // Set up intersection observer to detect when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.8, // 80% of the element must be visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Start countdown when section becomes visible
  useEffect(() => {
    if (isVisible && timeLeft === null) {
      setTimeLeft(60); // Start with 60 seconds
    }
  }, [isVisible, timeLeft]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || cancelSelfDestruct) return;

    if (timeLeft <= 0) {
      // Set cookie to remember self-destruct
      setCookie("selfDestructed", "true", 30); // Cookie expires in 30 days
      onSelfDestruct();
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, onSelfDestruct, cancelSelfDestruct]);

  return (
    <div
      ref={sectionRef}
      className={`w-full bg-white min-h-screen flex flex-col items-center justify-center p-4 relative ${className}`}
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url(/noise.png)",
          backgroundRepeat: "repeat",
          opacity: 0.85,
          mixBlendMode: "overlay",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.4) 100%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.2) 100%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.05) 100%)",
        }}
      />

      <div className="max-w-4xl mx-auto text-center z-10">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-advercase font-bold mb-8 text-black">
          {showGreatChoice
            ? "Great choice!"
            : "We only work with fast clients."}
        </h2>
        <p className="text-xl sm:text-2xl md:text-2xl font-medium font-geist mb-8 text-black">
          {showGreatChoice
            ? "We're excited to work with you."
            : "This website will self destruct in"}
        </p>
        {showGreatChoice ? (
          <div className="mb-12"></div>
        ) : (
          <div
            className="text-4xl sm:text-5xl md:text-7xl font-mono font-bold text-red-600 mb-12 cursor-pointer select-none hover:scale-105 transition-transform duration-300"
            onClick={speedUpTimer}
          >
            {timeLeft !== null ? formatTime(timeLeft) : "01:00"}
          </div>
        )}
        {/* <p className="text-sm text-white/70 italic">
          Click the timer to speed things up
        </p> */}
      </div>

      <div className="mt-4 z-10">
        <a
          href="https://cal.com/elgar/30min"
          className="bg-black text-white font-medium rounded-none px-6 py-3 transition-all duration-300 hover:scale-105 focus:outline-none z-50 inline-block text-center font-geist"
          onClick={handleWorkWithUs}
          target="_blank"
          rel="noopener noreferrer"
        >
          Work with us
        </a>
      </div>
    </div>
  );
}
