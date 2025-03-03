"use client";

import { useRef } from "react";
import PeopleCanvas from "@/components/PeopleCanvas";
import PlantBoidsCanvas from "@/components/PlantBoidsCanvas";
import TextGrid from "@/components/TextGrid";
import { FontShowcase } from "@/components/FontShowcase";

export default function Home() {
  const buildSectionRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    if (ref.current) {
      window.scrollTo({
        top: ref.current.offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col relative"
      style={{
        background: "#F2F2F2",
        color: "#000000", // Black text color
      }}
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

      {/* Hero section with Plant Boids simulation */}
      <div className="relative h-screen overflow-hidden">
        {/* Plant Boids simulation */}
        <PlantBoidsCanvas />

        <main className="relative flex flex-col items-center justify-between h-full px-4 pt-0 pb-16 sm:justify-center sm:pb-0">
          <h1 className="text-xl sm:text-2xl text-center md:text-4xl font-bold mt-32 sm:mt-0 mb-0 sm:mb-24 md:mb-48 mx-auto px-4 md:px-8 font-advercase uppercase">
            Building products you keep coming back to.
          </h1>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="https://cal.com/elgar/30min"
              className="bg-black text-white font-medium rounded-none px-6 py-3 transition-all duration-300 hover:scale-105 focus:outline-none z-50 inline-block text-center"
              style={{ fontFamily: "Geist" }}
            >
              Work with us
            </a>
            <button
              onClick={() => scrollToSection(buildSectionRef)}
              className="bg-white text-black border border-black font-medium rounded-none px-6 py-3 transition-all duration-300 hover:scale-105 focus:outline-none z-50 inline-block"
              style={{ fontFamily: "Geist" }}
            >
              See what we can make
            </button>
          </div>
        </main>
      </div>

      {/* People animation canvas */}
      {/* <PeopleCanvas className="z-0" /> */}

      <div
        id="build-section"
        ref={buildSectionRef}
        className="w-full bg-black min-h-screen p-0 m-0 overflow-hidden"
      >
        <div className="pt-24 sm:pt-32 md:pt-64 pb-0 mb-8 sm:mb-16 md:mb-32">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-geist font-bold text-center upper text-white px-4">
            We build
          </h2>
        </div>

        <TextGrid className="z-10" />
      </div>
    </div>
  );
}
