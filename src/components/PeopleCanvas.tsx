"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// Utility functions
const randomRange = (min: number, max: number) =>
  min + Math.random() * (max - min);
const randomIndex = (array: any[]) => Math.floor(randomRange(0, array.length));
const removeFromArray = (array: any[], i: number) => array.splice(i, 1)[0];
const removeItemFromArray = (array: any[], item: any) =>
  removeFromArray(array, array.indexOf(item));
const removeRandomFromArray = (array: any[]) =>
  removeFromArray(array, randomIndex(array));

// Person class to manage each person image
class Person {
  image: HTMLImageElement;
  width: number;
  height: number;
  x: number = 0;
  y: number = 0;
  anchorY: number = 0;
  scaleX: number = 1;
  walk: gsap.core.Timeline | null = null;

  constructor(image: HTMLImageElement) {
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scaleX, 1);
    ctx.drawImage(this.image, 0, 0, this.width, this.height);
    ctx.restore();
  }
}

// Reset person position and return properties for animation
function resetPerson({
  person,
  stage,
}: {
  person: Person;
  stage: { width: number; height: number };
}) {
  const direction = Math.random() > 0.5 ? 1 : -1;
  // Using an ease function to skew random to lower values
  const offsetY = 60 - 50 * gsap.parseEase("power2.in")(Math.random());
  const startY = stage.height - person.height + offsetY;
  let startX;
  let endX;

  if (direction === 1) {
    startX = -person.width;
    endX = stage.width;
    person.scaleX = 1;
  } else {
    startX = stage.width + person.width;
    endX = 0;
    person.scaleX = -1;
  }

  person.x = startX;
  person.y = startY;
  person.anchorY = startY;

  return {
    startX,
    startY,
    endX,
  };
}

interface PeopleCanvasProps {
  className?: string;
}

export default function PeopleCanvas({ className = "" }: PeopleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stage = {
      width: 0,
      height: 0,
    };

    const allPeople: Person[] = [];
    const availablePeople: Person[] = [];
    const crowd: Person[] = [];

    // Get all image files from the people directory
    const loadPeopleImages = async () => {
      try {
        // Get all files from the public/people directory
        const response = await fetch("/api/people-images");
        if (!response.ok) {
          throw new Error("Failed to fetch people images");
        }

        const imageFiles = await response.json();

        // Load all images
        let loadedCount = 0;
        const totalImages = imageFiles.length;

        if (totalImages === 0) {
          console.error("No people images found");
          setIsLoaded(true);
          return;
        }

        imageFiles.forEach((filename: string) => {
          const img = new Image();
          img.onload = () => {
            // Scale down large images
            const maxSize = 150;
            let width = img.width;
            let height = img.height;

            if (width > height && width > maxSize) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else if (height > width && height > maxSize) {
              width = (width / height) * maxSize;
              height = maxSize;
            }

            img.width = width;
            img.height = height;

            allPeople.push(new Person(img));
            loadedCount++;

            if (loadedCount === totalImages) {
              // All images loaded, initialize the animation
              setIsLoaded(true);
              availablePeople.push(...allPeople);
              resize();
            }
          };

          img.onerror = () => {
            console.error(`Failed to load image: ${filename}`);
            // Skip failed images
            loadedCount++;
            if (loadedCount === totalImages) {
              setIsLoaded(true);
              availablePeople.push(...allPeople);
              resize();
            }
          };

          img.src = `/people/${filename}`;
        });
      } catch (error) {
        console.error("Error loading people images:", error);
        setIsLoaded(true);
      }
    };

    // Start loading images
    loadPeopleImages();

    function resize() {
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      canvas.width = stage.width * window.devicePixelRatio;
      canvas.height = stage.height * window.devicePixelRatio;

      crowd.forEach((person) => {
        if (person.walk) person.walk.kill();
      });

      crowd.length = 0;
      availablePeople.length = 0;
      availablePeople.push(...allPeople);

      // Only initialize crowd if we have people
      if (availablePeople.length > 0) {
        initCrowd();
      }
    }

    function initCrowd() {
      while (availablePeople.length) {
        // Setting random tween progress spreads the people out
        addPersonToCrowd().walk?.progress(Math.random());
      }
    }

    function addPersonToCrowd() {
      const person = removeRandomFromArray(availablePeople);
      const props = resetPerson({
        person,
        stage,
      });

      const xDuration = randomRange(8, 15); // Randomize duration for more natural movement
      const yDuration = 0.25;

      const tl = gsap.timeline();
      tl.timeScale(randomRange(0.5, 1.5));
      tl.to(
        person,
        {
          duration: xDuration,
          x: props.endX,
          ease: "none",
        },
        0
      );
      tl.to(
        person,
        {
          duration: yDuration,
          repeat: xDuration / yDuration,
          yoyo: true,
          y: props.startY - randomRange(5, 15), // Randomize bounce height
        },
        0
      );

      tl.eventCallback("onComplete", () => {
        removePersonFromCrowd(person);
        addPersonToCrowd();
      });

      person.walk = tl;

      crowd.push(person);
      crowd.sort((a, b) => a.anchorY - b.anchorY);

      return person;
    }

    function removePersonFromCrowd(person: Person) {
      removeItemFromArray(crowd, person);
      availablePeople.push(person);
    }

    function render() {
      if (!ctx) return;

      canvas.width = canvas.width; // Clear canvas
      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      crowd.forEach((person) => {
        person.render(ctx);
      });

      ctx.restore();

      requestAnimationFrame(render);
    }

    // Start animation when loaded
    if (isLoaded) {
      resize();
      render();
    }

    // Add event listeners
    window.addEventListener("resize", resize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", resize);
      crowd.forEach((person) => {
        if (person.walk) person.walk.kill();
      });
    };
  }, [isLoaded]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full absolute inset-0 ${className}`}
    />
  );
}
