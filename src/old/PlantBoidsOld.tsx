"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Portals from "../components/Portal";

// Boid type definition
interface Boid {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: "leaf" | "bud" | "seed";
  color: string;
  rotation: number;
  scale: number;
  lifespan: number;
  maxLifespan: number;
  inPortal?: string; // ID of the portal this boid is currently in
  portalProgress?: number; // Progress of transit through portal (0-1)
}

// Portal definition
interface Portal {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  isSource: boolean; // true = exit portal, false = entrance portal
  pairId: string; // ID of the paired portal
  isBorder?: boolean; // This is a border portal
  width?: number;
  height?: number;
}

// Configuration options based on the reference implementation
const BOID_CONFIG = {
  visualRange: 400, // How far a boid can "see" (was perceptionRadius: 100)
  minDistance: 30, // Minimum distance to maintain from other boids (was separation: 25)
  centeringFactor: 0.0015, // For cohesion - moving toward center (was cohesion: 0.05)
  avoidFactor: 0.0001, // For separation - avoiding others
  matchingFactor: 0.0025, // For alignment - matching velocity (was alignment: 0.05)
  speedLimit: 3, // Maximum speed (was maxSpeed: 2)
  turnFactor: 1, // Factor for staying within bounds (not used with border portal)
  boundaryMargin: 20, // Margin from the edge to trigger portal teleport (was 200)
  maxBoids: 100, // Maximum number of boids to allow
  spawnCount: 5, // How many boids to spawn per click
  minLifespan: 600, // Minimum frames a boid will live
  maxLifespan: 900, // Maximum frames a boid will live
  initialBoids: 1, // Number of boids to spawn at start
  portalTransitTime: 20, // Faster transit through smaller portals
  portalPullStrength: 20, // Stronger pull for smaller portals
  portalPullRange: 200, // Smaller pull range for smaller portals
  borderPortalWidth: 100, // Width of the border portal effect
  edgeDriveFactor: 2, // How strongly boids are driven toward the edge
};

export default function PlantBoids() {
  const [boids, setBoids] = useState<Boid[]>([]);
  const boidsRef = useRef<Boid[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const idCounterRef = useRef<number>(0);
  const initializedRef = useRef<boolean>(false);

  // Portal state
  const [portals, setPortals] = useState<Portal[]>([]);
  const portalsInitializedRef = useRef<boolean>(false);

  // Create a boid with random properties
  const createRandomBoid = (x: number, y: number): Boid => {
    const type = ["leaf", "bud", "seed"][Math.floor(Math.random() * 3)] as
      | "leaf"
      | "bud"
      | "seed";
    const color = Math.random() < 0.5 ? "#000000" : "#FFFFFF";
    const vx = Math.random() * 10 - 5;
    const vy = Math.random() * 10 - 5;
    const lifespan = Math.floor(
      BOID_CONFIG.minLifespan +
        Math.random() * (BOID_CONFIG.maxLifespan - BOID_CONFIG.minLifespan)
    );

    return {
      id: idCounterRef.current++,
      x,
      y,
      vx,
      vy,
      type,
      color,
      rotation: Math.random() * 360,
      scale: 0.7 + Math.random() * 0.6,
      lifespan,
      maxLifespan: lifespan,
    };
  };

  // Initialize portals
  useEffect(() => {
    if (containerRef.current && !portalsInitializedRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();

      // Create portal pair
      const portalPair = [
        {
          id: "portal-1",
          x: 0, // Not used for border portal
          y: 0, // Not used for border portal
          radius: BOID_CONFIG.borderPortalWidth,
          color: "#f2f2f2", // Pure white entrance portal (was #F5F5F5 off-white)
          isSource: false, // Entrance portal
          pairId: "portal-2",
          isBorder: true, // This is a border portal
          width: width,
          height: height,
        },
        {
          id: "portal-2",
          x: width * 0.5, // Center of screen
          y: height * 0.5, // Center of screen
          radius: 25,
          color: "#000000", // Black exit portal
          isSource: true, // Exit portal
          pairId: "portal-1",
        },
      ];

      setPortals(portalPair);
      portalsInitializedRef.current = true;
    }
  }, []);

  // Initialize with some boids
  useEffect(() => {
    if (containerRef.current && !initializedRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const initialBoids: Boid[] = [];

      for (let i = 0; i < BOID_CONFIG.initialBoids; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        initialBoids.push(createRandomBoid(x, y));
      }

      setBoids(initialBoids);
      boidsRef.current = initialBoids;
      initializedRef.current = true;
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Adjust boids that are outside of bounds after resize
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();

        // Update boid positions
        setBoids((prevBoids) =>
          prevBoids.map((boid) => ({
            ...boid,
            x: Math.min(boid.x, width),
            y: Math.min(boid.y, height),
          }))
        );

        // Update portal positions
        setPortals((prevPortals) =>
          prevPortals.map((portal, index) => {
            if (index === 0) {
              // Border portal
              return {
                ...portal,
                width: width,
                height: height,
              };
            } else {
              // Exit portal
              return {
                ...portal,
                x: width * 0.5, // Center of screen
                y: height * 0.5, // Center of screen
                radius: 25,
              };
            }
          })
        );
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Spawn new boids on click
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Don't spawn if we've reached the max
      if (boidsRef.current.length >= BOID_CONFIG.maxBoids) return;

      const newBoids: Boid[] = [];

      // Create new boids at click position
      for (let i = 0; i < BOID_CONFIG.spawnCount; i++) {
        const type = ["leaf", "bud", "seed"][Math.floor(Math.random() * 3)] as
          | "leaf"
          | "bud"
          | "seed";
        const color = Math.random() < 0.5 ? "#000000" : "#FFFFFF";

        // Random velocity - matching the reference implementation
        // dx/dy in the reference are vx/vy in our implementation
        const vx = Math.random() * 10 - 5;
        const vy = Math.random() * 10 - 5;

        // Random lifespan
        const lifespan = Math.floor(
          BOID_CONFIG.minLifespan +
            Math.random() * (BOID_CONFIG.maxLifespan - BOID_CONFIG.minLifespan)
        );

        newBoids.push({
          id: idCounterRef.current++,
          x: mouseX + (Math.random() * 20 - 10),
          y: mouseY + (Math.random() * 20 - 10),
          vx,
          vy,
          type,
          color,
          rotation: Math.random() * 360,
          scale: 0.7 + Math.random() * 0.6,
          lifespan,
          maxLifespan: lifespan,
        });
      }

      // Update state
      setBoids((prev) => [...prev, ...newBoids]);
      boidsRef.current = [...boidsRef.current, ...newBoids];
    }
  }, []);

  // Helper function to calculate distance between two boids
  const distance = (boid1: Boid, boid2: Boid): number => {
    return Math.sqrt(
      (boid1.x - boid2.x) * (boid1.x - boid2.x) +
        (boid1.y - boid2.y) * (boid1.y - boid2.y)
    );
  };

  // Helper function to calculate distance between a boid and a point
  const distanceToPoint = (boid: Boid, x: number, y: number): number => {
    return Math.sqrt((boid.x - x) * (boid.x - x) + (boid.y - y) * (boid.y - y));
  };

  // Handle portal effects on boids
  const handlePortalEffect = (portalId: string, boidId: number) => {
    // This is called when a boid enters a portal
    const boidIndex = boidsRef.current.findIndex((b) => b.id === boidId);
    if (boidIndex === -1) return;

    const boid = boidsRef.current[boidIndex];
    const portal = portals.find((p) => p.id === portalId);

    if (!portal || portal.isSource) return; // Only entrance portals can capture boids

    // Start the portal transit
    const updatedBoid = {
      ...boid,
      inPortal: portalId,
      portalProgress: 0,
    };

    // Update the boid
    const updatedBoids = [...boidsRef.current];
    updatedBoids[boidIndex] = updatedBoid;
    boidsRef.current = updatedBoids;
    setBoids(updatedBoids);
  };

  // Animation loop using useEffect
  useEffect(() => {
    const animate = () => {
      if (!containerRef.current) return;

      const { width, height } = containerRef.current.getBoundingClientRect();

      const updatedBoids = boidsRef.current
        .map((boid) => {
          // Skip normal update logic if boid is in a portal
          if (boid.inPortal) {
            const entrancePortal = portals.find((p) => p.id === boid.inPortal);
            if (!entrancePortal) return boid;

            const exitPortal = portals.find(
              (p) => p.id === entrancePortal.pairId
            );
            if (!exitPortal) return boid;

            // Update portal progress
            const portalProgress =
              (boid.portalProgress || 0) + 1 / BOID_CONFIG.portalTransitTime;

            // If transit is complete, teleport to the exit portal
            if (portalProgress >= 1) {
              // Calculate new position and velocity based on exit portal
              // Maintain the same direction but from the new portal
              const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);

              // Random direction from center of exit portal
              const angle = Math.random() * Math.PI * 2;
              const dx = Math.cos(angle);
              const dy = Math.sin(angle);

              return {
                ...boid,
                // Adjust the distance from center for the smaller portal
                x: exitPortal.x + dx * (exitPortal.radius * 0.8),
                y: exitPortal.y + dy * (exitPortal.radius * 0.8),
                vx: dx * speed * 1.5, // Slightly boost speed out of portal
                vy: dy * speed * 1.5,
                inPortal: undefined,
                portalProgress: undefined,
              };
            }

            // Still in transition, just update progress
            return {
              ...boid,
              // During transit, make the boid invisible by moving it to the center of the entrance portal
              x: entrancePortal.x,
              y: entrancePortal.y,
              portalProgress,
            };
          }

          // Check for border portal effect
          const borderPortal = portals.find((p) => p.isBorder);
          if (borderPortal) {
            // Check if boid is near the edge of the screen
            const isNearLeftEdge = boid.x < BOID_CONFIG.boundaryMargin;
            const isNearRightEdge = boid.x > width - BOID_CONFIG.boundaryMargin;
            const isNearTopEdge = boid.y < BOID_CONFIG.boundaryMargin;
            const isNearBottomEdge =
              boid.y > height - BOID_CONFIG.boundaryMargin;

            if (
              isNearLeftEdge ||
              isNearRightEdge ||
              isNearTopEdge ||
              isNearBottomEdge
            ) {
              // Start portal transit
              return {
                ...boid,
                inPortal: borderPortal.id,
                portalProgress: 0,
              };
            }
          }

          // Check for regular portal influence on normal boids
          for (const portal of portals) {
            // Skip exit portals and border portals for influence
            if (portal.isSource || portal.isBorder) continue;

            const distToPortal = distanceToPoint(boid, portal.x, portal.y);

            // Check if boid is within portal pull range
            if (distToPortal < BOID_CONFIG.portalPullRange) {
              // Calculate pull strength based on distance (stronger as boid gets closer)
              const pullFactor =
                BOID_CONFIG.portalPullStrength *
                (1 - distToPortal / BOID_CONFIG.portalPullRange);

              // Direction to portal
              const dx = portal.x - boid.x;
              const dy = portal.y - boid.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              // Normalize direction
              const dirX = dx / (dist || 1);
              const dirY = dy / (dist || 1);

              // Apply pull force
              boid.vx += dirX * pullFactor;
              boid.vy += dirY * pullFactor;

              // Check if boid is now inside the portal
              if (distToPortal < portal.radius * 0.7) {
                // Start portal transit
                return {
                  ...boid,
                  inPortal: portal.id,
                  portalProgress: 0,
                };
              }
            }
          }

          // Create a copy of the boid to update
          let newBoid = { ...boid };

          // Apply all the flocking rules like in the reference implementation
          newBoid = flyTowardsCenter(newBoid, boidsRef.current);
          newBoid = avoidOthers(newBoid, boidsRef.current);
          newBoid = matchVelocity(newBoid, boidsRef.current);
          newBoid = driveTowardsEdge(newBoid, width, height); // Drive boids toward the edge
          newBoid = limitSpeed(newBoid);
          // We no longer need keepWithinBounds since the border portal handles this

          // Update position based on velocity
          newBoid.x += newBoid.vx;
          newBoid.y += newBoid.vy;

          // Calculate rotation based on direction
          const rotation = Math.atan2(newBoid.vy, newBoid.vx) * (180 / Math.PI);

          // Decrease lifespan
          const lifespan = newBoid.lifespan - 1;

          return {
            ...newBoid,
            rotation,
            lifespan,
          };
        })
        .filter((boid) => boid.lifespan > 0);

      // Update refs and state
      boidsRef.current = updatedBoids;
      setBoids(updatedBoids);

      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);

    // Clean up
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [portals]);

  // Rule 1: Find the center of mass of neighbors and move towards it
  const flyTowardsCenter = (boid: Boid, allBoids: Boid[]): Boid => {
    let centerX = 0;
    let centerY = 0;
    let numNeighbors = 0;

    for (let otherBoid of allBoids) {
      if (
        otherBoid.id !== boid.id &&
        !otherBoid.inPortal && // Skip boids in portals
        distance(boid, otherBoid) < BOID_CONFIG.visualRange
      ) {
        centerX += otherBoid.x;
        centerY += otherBoid.y;
        numNeighbors += 1;
      }
    }

    if (numNeighbors > 0) {
      centerX = centerX / numNeighbors;
      centerY = centerY / numNeighbors;

      // Adjust velocity by the centering factor
      return {
        ...boid,
        vx: boid.vx + (centerX - boid.x) * BOID_CONFIG.centeringFactor,
        vy: boid.vy + (centerY - boid.y) * BOID_CONFIG.centeringFactor,
      };
    }

    return boid;
  };

  // Rule 2: Avoid crowding neighbors
  const avoidOthers = (boid: Boid, allBoids: Boid[]): Boid => {
    let moveX = 0;
    let moveY = 0;
    let numClose = 0;

    for (let otherBoid of allBoids) {
      if (otherBoid.id !== boid.id && !otherBoid.inPortal) {
        // Skip boids in portals
        const dist = distance(boid, otherBoid);
        if (dist < BOID_CONFIG.minDistance) {
          // The closer they are, the stronger the avoidance
          const factor = 1.0 - dist / BOID_CONFIG.minDistance;
          moveX += (boid.x - otherBoid.x) * factor;
          moveY += (boid.y - otherBoid.y) * factor;
          numClose++;
        }
      }
    }

    // Add a small random jitter to break symmetrical patterns
    const jitterAmount = 0.0;
    const jitterX = (Math.random() * 2 - 1) * jitterAmount;
    const jitterY = (Math.random() * 2 - 1) * jitterAmount;

    // Increase avoidance strength when there are more neighbors
    const avoidStrength =
      numClose > 3 ? BOID_CONFIG.avoidFactor * 1.5 : BOID_CONFIG.avoidFactor;

    return {
      ...boid,
      vx: boid.vx + moveX * avoidStrength + jitterX,
      vy: boid.vy + moveY * avoidStrength + jitterY,
    };
  };

  // Rule 3: Match velocity with neighbors
  const matchVelocity = (boid: Boid, allBoids: Boid[]): Boid => {
    let avgVX = 0;
    let avgVY = 0;
    let numNeighbors = 0;

    for (let otherBoid of allBoids) {
      if (
        otherBoid.id !== boid.id &&
        !otherBoid.inPortal && // Skip boids in portals
        distance(boid, otherBoid) < BOID_CONFIG.visualRange
      ) {
        avgVX += otherBoid.vx;
        avgVY += otherBoid.vy;
        numNeighbors += 1;
      }
    }

    if (numNeighbors > 0) {
      avgVX = avgVX / numNeighbors;
      avgVY = avgVY / numNeighbors;

      return {
        ...boid,
        vx: boid.vx + (avgVX - boid.vx) * BOID_CONFIG.matchingFactor,
        vy: boid.vy + (avgVY - boid.vy) * BOID_CONFIG.matchingFactor,
      };
    }

    return boid;
  };

  // Rule 4: Limit speed
  const limitSpeed = (boid: Boid): Boid => {
    const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);

    if (speed > BOID_CONFIG.speedLimit) {
      return {
        ...boid,
        vx: (boid.vx / speed) * BOID_CONFIG.speedLimit,
        vy: (boid.vy / speed) * BOID_CONFIG.speedLimit,
      };
    }

    return boid;
  };

  // New function: Drive boids toward the edge of the screen
  const driveTowardsEdge = (
    boid: Boid,
    width: number,
    height: number
  ): Boid => {
    // Calculate the center of the screen
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate vector from center to boid
    const dx = boid.x - centerX;
    const dy = boid.y - centerY;

    // Calculate distance from center
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);

    // Normalize the direction vector
    const dirX = dx / (distFromCenter || 1);
    const dirY = dy / (distFromCenter || 1);

    // Apply a force that increases as boids get closer to the center
    // This creates a stronger push when near the center, weaker near the edges
    const centerRepelFactor = Math.max(
      0,
      1 - distFromCenter / (Math.min(width, height) / 2)
    );
    const forceFactor = BOID_CONFIG.edgeDriveFactor * centerRepelFactor;

    return {
      ...boid,
      vx: boid.vx + dirX * forceFactor,
      vy: boid.vy + dirY * forceFactor,
    };
  };

  // Render each boid based on its type
  const renderBoid = (boid: Boid) => {
    // Don't render boids that are in transit through a portal
    if (
      boid.inPortal &&
      boid.portalProgress !== undefined &&
      boid.portalProgress > 0.1 &&
      boid.portalProgress < 0.9
    ) {
      return null;
    }

    // Calculate opacity based on lifespan and portal state
    let opacity = Math.min(
      1,
      boid.lifespan / 20,
      (boid.maxLifespan - boid.lifespan) / 20
    );

    // Fade out when entering a portal or fade in when exiting
    if (boid.inPortal && boid.portalProgress !== undefined) {
      if (boid.portalProgress < 0.5) {
        // Entering portal - fade out
        opacity *= 1 - boid.portalProgress * 2;
      } else {
        // Exiting portal - fade in
        opacity *= (boid.portalProgress - 0.5) * 2;
      }
    }

    // Get base dimensions for plane shape
    const width = 12 * boid.scale;
    const height = 8 * boid.scale;

    // Common styles for all boid types
    const style = {
      position: "absolute" as const,
      left: `${boid.x}px`,
      top: `${boid.y}px`,
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: boid.color,
      transform: `rotate(${boid.rotation}deg)`,
      opacity,
      transition: "opacity 0.3s",
      boxShadow: "0 0 2px rgba(0,0,0,0.2)",
      clipPath: "polygon(0% 50%, 20% 0%, 100% 50%, 20% 100%)", // Paper airplane shape
    };

    return <div key={boid.id} style={style} />;
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="absolute inset-0 overflow-hidden pointer-events-auto z-10"
      style={{
        pointerEvents: "all",
        height: "100vh", // Limit to viewport height
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: "auto", // Don't extend beyond viewport height
        overflow: "hidden", // Ensure boids don't render outside container
      }}
    >
      <Portals portals={portals} onPortalEffect={handlePortalEffect} />
      {boids.map(renderBoid)}
    </div>
  );
}
