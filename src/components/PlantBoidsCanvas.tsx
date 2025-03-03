"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  minDistance: 50, // Minimum distance to maintain from other boids (was separation: 25)
  centeringFactor: 0.0015, // For cohesion - moving toward center (was cohesion: 0.05)
  avoidFactor: 0.01, // For separation - avoiding others
  matchingFactor: 0.025, // For alignment - matching velocity (was alignment: 0.05)
  speedLimit: 2, // Maximum speed (was maxSpeed: 2)
  turnFactor: 1, // Factor for staying within bounds (not used with border portal)
  boundaryMargin: 20, // Margin from the edge to trigger portal teleport (was 200)
  maxBoids: 500, // Maximum number of boids to allow
  spawnCount: 3, // How many boids to spawn per click
  minLifespan: 600, // Minimum frames a boid will live
  maxLifespan: 900, // Maximum frames a boid will live
  initialBoids: 8, // Number of boids to spawn at start
  portalTransitTime: 10, // Faster transit through smaller portals
  portalPullStrength: 20, // Stronger pull for smaller portals
  portalPullRange: 400, // Smaller pull range for smaller portals
  borderPortalWidth: 10, // Width of the border portal effect
  edgeDriveFactor: 8, // How strongly boids are driven toward the edge
};

export default function PlantBoidsCanvas() {
  const [boids, setBoids] = useState<Boid[]>([]);
  const boidsRef = useRef<Boid[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
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
    const lifespan = 10000000;
    // const lifespan = Math.floor(
    //   BOID_CONFIG.minLifespan +
    //     Math.random() * (BOID_CONFIG.maxLifespan - BOID_CONFIG.minLifespan)
    // );

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

  // Initialize canvas and create initial boids
  useEffect(() => {
    if (!canvasRef.current || initializedRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctxRef.current = ctx;
    console.log("Canvas context initialized");

    // Set canvas size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Update portal positions and sizes
      setPortals((prevPortals) =>
        prevPortals.map((portal) => {
          if (portal.isBorder) {
            return {
              ...portal,
              width: rect.width,
              height: rect.height,
            };
          } else {
            return {
              ...portal,
              x: rect.width * 0.5,
              y: rect.height * 0.5,
              radius: Math.min(rect.width, rect.height) * 0.03,
            };
          }
        })
      );

      console.log(`Canvas size set to ${canvas.width}x${canvas.height}`);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create initial boids
    const portalPair = [
      {
        id: "portal-1",
        x: 0,
        y: 0,
        radius: BOID_CONFIG.borderPortalWidth,
        color: "#f2f2f2",
        isSource: false,
        pairId: "portal-2",
        isBorder: true,
        width: canvas.width,
        height: canvas.height,
      },
      {
        id: "portal-2",
        x: canvas.width * 0.5,
        y: canvas.height * 0.5,
        radius: Math.min(canvas.width, canvas.height) * 0.03, // Make portal size relative to screen size
        color: "#000000",
        isSource: true,
        pairId: "portal-1",
      },
    ];

    setPortals(portalPair);

    // Determine initial boids count based on screen size
    const isSmallScreen = canvas.width < 768;
    const initialBoidsCount = isSmallScreen ? 8 : 20;

    // Create initial boids with updated count
    const initialBoids: Boid[] = [];
    for (let i = 0; i < initialBoidsCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      initialBoids.push(createRandomBoid(x, y));
    }

    console.log(`Created ${initialBoids.length} initial boids`);
    setBoids(initialBoids);
    boidsRef.current = initialBoids;

    initializedRef.current = true;
    portalsInitializedRef.current = true;

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Helper functions for boid movement
  const distance = (boid1: Boid, boid2: Boid): number => {
    return Math.sqrt(
      (boid1.x - boid2.x) * (boid1.x - boid2.x) +
        (boid1.y - boid2.y) * (boid1.y - boid2.y)
    );
  };

  const distanceToPoint = (boid: Boid, x: number, y: number): number => {
    return Math.sqrt((boid.x - x) * (boid.x - x) + (boid.y - y) * (boid.y - y));
  };

  // Flocking rules
  const flyTowardsCenter = (boid: Boid, allBoids: Boid[]): Boid => {
    let centerX = 0;
    let centerY = 0;
    let numNeighbors = 0;

    for (let otherBoid of allBoids) {
      if (
        otherBoid.id !== boid.id &&
        !otherBoid.inPortal &&
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

      return {
        ...boid,
        vx: boid.vx + (centerX - boid.x) * BOID_CONFIG.centeringFactor,
        vy: boid.vy + (centerY - boid.y) * BOID_CONFIG.centeringFactor,
      };
    }

    return boid;
  };

  const avoidOthers = (boid: Boid, allBoids: Boid[]): Boid => {
    let moveX = 0;
    let moveY = 0;
    let numClose = 0;

    for (let otherBoid of allBoids) {
      if (otherBoid.id !== boid.id && !otherBoid.inPortal) {
        const dist = distance(boid, otherBoid);
        if (dist < BOID_CONFIG.minDistance) {
          const factor = 1.0 - dist / BOID_CONFIG.minDistance;
          moveX += (boid.x - otherBoid.x) * factor;
          moveY += (boid.y - otherBoid.y) * factor;
          numClose++;
        }
      }
    }

    // Detect if boid is stuck (very low velocity but has neighbors)
    const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
    const isStuck = speed < 0.1 && numClose > 1;

    // Apply stronger jitter if stuck
    // const jitterAmount = isStuck ? 3 : 0.1;
    // const jitterX = (Math.random() * 2 - 1) * jitterAmount;
    // const jitterY = (Math.random() * 2 - 1) * jitterAmount;

    const avoidStrength =
      numClose > 3 ? BOID_CONFIG.avoidFactor * 1.5 : BOID_CONFIG.avoidFactor;

    return {
      ...boid,
      vx: boid.vx + moveX * avoidStrength, // + jitterX,
      vy: boid.vy + moveY * avoidStrength, // + jitterY,
    };
  };

  const matchVelocity = (boid: Boid, allBoids: Boid[]): Boid => {
    let avgVX = 0;
    let avgVY = 0;
    let numNeighbors = 0;

    for (let otherBoid of allBoids) {
      if (
        otherBoid.id !== boid.id &&
        !otherBoid.inPortal &&
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

  const driveTowardsEdge = (
    boid: Boid,
    width: number,
    height: number
  ): Boid => {
    const centerX = width / 2;
    const centerY = height / 2;
    const dx = boid.x - centerX;
    const dy = boid.y - centerY;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);
    const dirX = dx / (distFromCenter || 1);
    const dirY = dy / (distFromCenter || 1);
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

  // Spawn new boids on click
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
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
      const color = Math.random() < 0.5 ? "#01ABDD" : "#FFFFFF";
      const vx = Math.random() * 10 - 5;
      const vy = Math.random() * 10 - 5;
      const lifespan = 10000000; // Infinite lifespan for clicked boids too

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
  }, []);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !ctxRef.current || boids.length === 0) return;

    console.log("Starting animation loop with", boids.length, "boids");

    const animate = () => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;

      if (!canvas || !ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw border portal
      if (portals.length > 0) {
        const borderPortal = portals.find((p) => p.isBorder);
        if (borderPortal) {
          ctx.strokeStyle = borderPortal.color;
          ctx.lineWidth = 8;
          ctx.strokeRect(0, 0, canvas.width, canvas.height);
        }

        // Draw center portal
        const centerPortal = portals.find((p) => !p.isBorder);
        if (centerPortal) {
          ctx.beginPath();
          ctx.arc(
            centerPortal.x,
            centerPortal.y,
            centerPortal.radius,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = centerPortal.color;
          ctx.fill();
        }
      }

      // Update and draw boids
      const updatedBoids = boidsRef.current
        .map((boid) => {
          // Skip if in portal
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

            // If transit complete, teleport
            if (portalProgress >= 1) {
              const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
              const angle = Math.random() * Math.PI * 2;
              const dx = Math.cos(angle);
              const dy = Math.sin(angle);

              return {
                ...boid,
                x: exitPortal.x + dx * (exitPortal.radius * 0.8),
                y: exitPortal.y + dy * (exitPortal.radius * 0.8),
                vx: dx * speed * 1.5,
                vy: dy * speed * 1.5,
                inPortal: undefined,
                portalProgress: undefined,
              };
            }

            // Still in transit
            return {
              ...boid,
              x: entrancePortal.x,
              y: entrancePortal.y,
              portalProgress,
            };
          }

          // Check for border portal
          const borderPortal = portals.find((p) => p.isBorder);
          if (borderPortal) {
            const isNearLeftEdge = boid.x < BOID_CONFIG.boundaryMargin;
            const isNearRightEdge =
              boid.x > canvas.width - BOID_CONFIG.boundaryMargin;
            const isNearTopEdge = boid.y < BOID_CONFIG.boundaryMargin;
            const isNearBottomEdge =
              boid.y > canvas.height - BOID_CONFIG.boundaryMargin;

            if (
              isNearLeftEdge ||
              isNearRightEdge ||
              isNearTopEdge ||
              isNearBottomEdge
            ) {
              return {
                ...boid,
                inPortal: borderPortal.id,
                portalProgress: 0,
              };
            }
          }

          // Check for center portal influence
          for (const portal of portals) {
            if (portal.isSource || portal.isBorder) continue;

            const distToPortal = distanceToPoint(boid, portal.x, portal.y);

            if (distToPortal < BOID_CONFIG.portalPullRange) {
              const pullFactor =
                BOID_CONFIG.portalPullStrength *
                (1 - distToPortal / BOID_CONFIG.portalPullRange);
              const dx = portal.x - boid.x;
              const dy = portal.y - boid.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const dirX = dx / (dist || 1);
              const dirY = dy / (dist || 1);

              boid.vx += dirX * pullFactor;
              boid.vy += dirY * pullFactor;

              if (distToPortal < portal.radius * 0.7) {
                return {
                  ...boid,
                  inPortal: portal.id,
                  portalProgress: 0,
                };
              }
            }
          }

          // Apply flocking rules
          let newBoid = { ...boid };
          newBoid = flyTowardsCenter(newBoid, boidsRef.current);
          newBoid = avoidOthers(newBoid, boidsRef.current);
          newBoid = matchVelocity(newBoid, boidsRef.current);
          newBoid = driveTowardsEdge(newBoid, canvas.width, canvas.height);
          newBoid = limitSpeed(newBoid);

          // Update position
          newBoid.x += newBoid.vx;
          newBoid.y += newBoid.vy;

          // Update rotation and lifespan
          const rotation = Math.atan2(newBoid.vy, newBoid.vx) * (180 / Math.PI);
          const lifespan = newBoid.lifespan - 1;

          return {
            ...newBoid,
            rotation,
            lifespan,
          };
        })
        .filter((boid) => boid.lifespan > 0);

      // Update state
      boidsRef.current = updatedBoids;
      setBoids(updatedBoids);

      // Draw boids
      updatedBoids.forEach((boid) => {
        // Skip if in portal transit
        if (
          boid.inPortal &&
          boid.portalProgress !== undefined &&
          boid.portalProgress > 0.1 &&
          boid.portalProgress < 0.9
        ) {
          return;
        }

        // Calculate opacity
        let opacity = Math.min(
          1,
          boid.lifespan / 20,
          (boid.maxLifespan - boid.lifespan) / 20
        );

        // Fade for portal transit
        if (boid.inPortal && boid.portalProgress !== undefined) {
          if (boid.portalProgress < 0.5) {
            opacity *= 1 - boid.portalProgress * 2;
          } else {
            opacity *= (boid.portalProgress - 0.5) * 2;
          }
        }

        // Draw boid
        const width = 12 * boid.scale;
        const height = 8 * boid.scale;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.translate(boid.x, boid.y);
        ctx.rotate((boid.rotation * Math.PI) / 180);

        // Draw paper airplane shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-width * 0.2, -height * 0.5);
        ctx.lineTo(width * 0.8, 0);
        ctx.lineTo(-width * 0.2, height * 0.5);
        ctx.closePath();

        // Add black border for white boids
        if (boid.color === "#FFFFFF") {
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.fillStyle = boid.color;
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fill();

        ctx.restore();
      });

      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [boids, portals]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="absolute inset-0 overflow-hidden pointer-events-auto z-10"
      style={{
        pointerEvents: "all",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: "auto",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "transparent",
      }}
    />
  );
}
