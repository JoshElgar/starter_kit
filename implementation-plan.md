# Canvas Implementation Plan for PlantBoids

## Overview

This document outlines the plan to convert the current DOM-based PlantBoids implementation to a Canvas-based approach while maintaining all existing functionality and visual effects.

## Goals

- Improve performance by eliminating DOM manipulation
- Reduce jitter and lag in the animation
- Maintain all existing functionality (portals, boid types, interactions)
- Keep the same visual appearance and behavior

## Implementation Phases

### Phase 1: Setup Canvas Infrastructure

1. **Create Canvas Component**

   - Replace the current container div with a canvas element
   - Set up proper sizing and high DPI support
   - Implement resize handling

2. **Refactor State Management**

   - Keep React state for tracking boids and portals
   - Add refs for Canvas context and animation frame

3. **Create Rendering Loop**
   - Separate logic: state updates vs. rendering
   - Implement `requestAnimationFrame` loop
   - Add FPS monitoring for performance tracking

### Phase 2: Core Rendering Functions

1. **Implement Basic Rendering**

   - Create draw functions for each boid type
   - Implement portal rendering
   - Set up the clear/redraw cycle

2. **Port Visual Effects**

   - Implement opacity/fade effects
   - Add rotation based on velocity
   - Match colors and shapes from current implementation

3. **Add Interaction Layer**
   - Convert click handlers to canvas coordinates
   - Implement boid spawning on click
   - Add any hover effects if needed

### Phase 3: Port Boid Logic

1. **Migrate Flocking Algorithm**

   - Port cohesion logic (`flyTowardsCenter`)
   - Port separation logic (`avoidOthers`)
   - Port alignment logic (`matchVelocity`)
   - Port speed limiting (`limitSpeed`)

2. **Implement Edge Behavior**

   - Port edge driving logic
   - Implement boundary checking

3. **Add Portal Mechanics**
   - Implement portal detection
   - Add portal transit effects
   - Port teleportation logic

### Phase 4: Optimization

1. **Implement Spatial Partitioning**

   - Add quadtree or grid system
   - Optimize neighbor lookups
   - Reduce O(n²) calculations

2. **Batch Processing**

   - Group similar operations
   - Minimize state changes
   - Optimize render path

3. **Visual Enhancements**
   - Add motion blur for smoother appearance
   - Implement interpolation between frames
   - Add subtle particle effects for portals

### Phase 5: Testing & Refinement

1. **Performance Testing**

   - Measure FPS with varying boid counts
   - Test on different devices
   - Optimize bottlenecks

2. **Visual Comparison**

   - Ensure visual parity with original
   - Match colors, sizes, and behaviors
   - Fine-tune animations

3. **Final Adjustments**
   - Add any missing features
   - Fix edge cases
   - Document the implementation

## Technical Details

### Canvas Setup

```typescript
// Canvas initialization
const canvasRef = useRef<HTMLCanvasElement>(null);
const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

useEffect(() => {
  if (canvasRef.current) {
    // Get context
    const ctx = canvasRef.current.getContext("2d");
    ctxRef.current = ctx;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasRef.current.getBoundingClientRect();

    canvasRef.current.width = rect.width * dpr;
    canvasRef.current.height = rect.height * dpr;

    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.translate(0.5, 0.5); // For crisp lines
    }
  }
}, []);
```

### Rendering Loop

```typescript
const animate = useCallback(() => {
  const ctx = ctxRef.current;
  if (!ctx || !canvasRef.current) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

  // Update boid positions
  updateBoids();

  // Render boids
  renderBoids(ctx);

  // Render portals
  renderPortals(ctx);

  // Continue animation
  animationRef.current = requestAnimationFrame(animate);
}, []);
```

### Boid Rendering

```typescript
const renderBoids = (ctx: CanvasRenderingContext2D) => {
  boids.forEach((boid) => {
    // Skip if in portal transit
    if (
      boid.inPortal &&
      boid.portalProgress > 0.1 &&
      boid.portalProgress < 0.9
    ) {
      return;
    }

    // Calculate opacity
    const opacity = Math.min(
      1,
      boid.lifespan / 20,
      (boid.maxLifespan - boid.lifespan) / 20
    );

    // Draw boid
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(boid.x, boid.y);
    ctx.rotate((boid.rotation * Math.PI) / 180);
    ctx.scale(boid.scale, boid.scale);

    // Set fill color
    ctx.fillStyle = boid.color;

    // Draw shape (paper airplane)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-6, -4);
    ctx.lineTo(6, 0);
    ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  });
};
```

### Spatial Partitioning

```typescript
class QuadTree {
  boundary: Rect;
  capacity: number;
  points: Boid[];
  divided: boolean;
  northeast: QuadTree | null;
  northwest: QuadTree | null;
  southeast: QuadTree | null;
  southwest: QuadTree | null;

  constructor(boundary: Rect, capacity: number) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
    this.northeast = null;
    this.northwest = null;
    this.southeast = null;
    this.southwest = null;
  }

  // Methods for inserting boids and querying regions
  // ...
}
```

## Migration Strategy

1. **Parallel Implementation**

   - Create new Canvas component alongside existing implementation
   - Toggle between implementations for testing
   - Gradually phase out DOM version

2. **Feature Parity Checklist**

   - Boid movement and flocking ✓
   - Portal system ✓
   - Click interaction ✓
   - Visual appearance ✓
   - Lifecycle management ✓

3. **Performance Metrics**
   - Track FPS before and after
   - Measure CPU usage
   - Monitor memory consumption

## Potential Challenges

1. **Matching Visual Effects**

   - Canvas doesn't have built-in transitions
   - Need to manually implement fading and smooth movement

2. **Event Handling**

   - Canvas uses different event model
   - Need to translate coordinates and detect objects

3. **Integration with React**
   - Managing state between React and Canvas
   - Handling component lifecycle

## Timeline Estimate

- **Phase 1**: 1 day
- **Phase 2**: 2 days
- **Phase 3**: 2 days
- **Phase 4**: 2-3 days
- **Phase 5**: 1-2 days

Total: ~8-10 days of development time
