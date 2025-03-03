"use client";

import { useState, useEffect } from "react";

interface SecondChanceScreenProps {
  onGiveSecondChance: () => void;
}

export default function SecondChanceScreen({
  onGiveSecondChance,
}: SecondChanceScreenProps) {
  return (
    <div className="fixed inset-0 w-full h-full bg-black z-[9999] flex flex-col items-center justify-center p-4">
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

      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-geist font-bold mb-8 text-white">
          Everyone deserves a second chance
        </h1>
        <button
          onClick={onGiveSecondChance}
          className="bg-white text-black font-medium rounded-none px-6 py-3 transition-all duration-300 hover:scale-105 focus:outline-none z-50 inline-block"
          style={{ fontFamily: "Geist" }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
