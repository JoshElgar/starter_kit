"use client";

import { useRef, useState, useEffect } from "react";
import PeopleCanvas from "@/components/PeopleCanvas";
import PlantBoidsCanvas from "@/components/PlantBoidsCanvas";
import TextGrid from "@/components/TextGrid";
import { FontShowcase } from "@/components/FontShowcase";
import SelfDestructSection from "@/components/SelfDestructSection";
import SecondChanceScreen from "@/components/SecondChanceScreen";
import { getCookie, setCookie } from "@/utils/cookies";

export default function Home() {
  const buildSectionRef = useRef<HTMLDivElement>(null);
  const [isSelfDestructed, setIsSelfDestructed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for self-destruct cookie on mount
  useEffect(() => {
    const hasDestructed = getCookie("selfDestructed") === "true";
    if (hasDestructed) {
      setIsSelfDestructed(true);
      // Prevent scrolling when self-destructed
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    setIsLoading(false);
  }, []);

  const handleSelfDestruct = () => {
    setIsSelfDestructed(true);
    document.body.style.overflow = "hidden";
    // Set page to blank
    document.body.innerHTML = "";
    document.body.style.backgroundColor = "black";

    // Redirect to Google with search query
    window.location.href =
      "https://www.google.com/search?q=Where+can+I+find+a+good+dev+agency?";
  };

  const handleGiveSecondChance = () => {
    setIsSelfDestructed(false);
    document.body.style.overflow = "";
    setCookie("selfDestructed", "false", 30);
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    if (ref.current) {
      window.scrollTo({
        top: ref.current.offsetTop,
        behavior: "smooth",
      });
    }
  };

  // Show loading state while checking cookies
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-black animate-pulse"></div>
          <div className="w-4 h-4 bg-black animate-pulse delay-150"></div>
          <div className="w-4 h-4 bg-black animate-pulse delay-300"></div>
        </div>
      </div>
    );
  }

  // If the site has self-destructed, show only the second chance screen
  if (isSelfDestructed) {
    return <SecondChanceScreen onGiveSecondChance={handleGiveSecondChance} />;
  }

  // Otherwise, show the regular content
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
              className="bg-black text-white font-medium rounded-none px-6 py-3 transition-all duration-300 hover:scale-105 focus:outline-none z-50 inline-block text-center font-geist"
            >
              Work with us
            </a>
            <button
              onClick={() => scrollToSection(buildSectionRef)}
              className="bg-white text-black border border-black font-medium rounded-none px-6 py-3 transition-all duration-300 hover:scale-105 focus:outline-none z-50 inline-block"
              style={{ fontFamily: "Geist" }}
            >
              See what we can build
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
        <p className="text-lg sm:text-xl md:text-2xl font-geist text-center text-white/80 mt-24 px-4">
          and more.
        </p>
      </div>

      {/* Self Destruct Section */}
      <SelfDestructSection
        className="z-10"
        onSelfDestruct={handleSelfDestruct}
      />
    </div>
  );
}
