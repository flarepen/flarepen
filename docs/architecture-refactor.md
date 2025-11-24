# Architecture Refactoring Plan

## Problem Statement

Adding multi-segment lines required changes across 10+ files with type casting, format checking, and duplicated logic. New shapes will face the same issues.

**Root causes:**
1. No clear separation between element data and rendering
2. Mixed element formats (len/direction vs points)
3. Geometry functions tightly coupled to element types
4. No single source of truth for dimensions/bounds
5. Type safety bypassed with `(element as any)`

## Proposed Architecture

### Core Principle: Shape is Source of Truth

Every element always has a correct, up-to-date `shape`. All dimensions, bounds, and rendering derive from shape. Element-specific data (points, width, etc.) is metadata for editing only.

### Layer Boundaries

```
┌─────────────────────────────────────────┐
│  UI Layer (Canvas, Toolbar, Handlers)   │
│  - User interactions                    │
│  - Mode handlers                        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Element Layer                          │
│  - Element types & interfaces           │
│  - ElementRenderer implementations      │
│  - Create, edit, transform operations   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Geometry Layer                         │
│  - Pure shape generation functions      │
│  - Grid operations                      │
│  - Bounds calculations                  │
│  - No knowledge of element types        │
└─────────────────────────────────────────┘
```

### New Type System

```typescript
// Core types
export interface Element {
  id: string;
  type: ElementType;
  x: number;        // Origin x
  y: number;        // Origin y
  shape: Shape;     // Always present, always correct
  labelEnabled: boolean;
  
  // Optional metadata for editing (type-specific)
  data?: ElementData;
}

export type ElementData = 
  | RectangleData
  | LineData
  | ArrowData
  | TextData;

export interface RectangleData {
  type: 'rectangle';
  width: number;
  height: number;
}

export interface LineData {
  type: 'line';
  points: Point[];  // Always use points, even for single segment
}

export interface ArrowData {
  type: 'arrow';
  points: Point[];
  direction: LinearDirection;  // For arrowhead
}

export interface TextData {
  type: 'text';
  content: string;
}

// Bounds always calculated from shape
export interface Bounds {
  x: number;
  y: number;
  width: number;   // In grid cells
  height: number;  // In grid cells
}
```

### ElementRenderer Interface

```typescript
export interface ElementRenderer<T extends ElementData> {
  /**
   * Generate shape from element data
   * Returns shape and its bounds
   */
  generate(data: T, origin: Point): GeneratedShape;
  
  /**
   * Create preview during drawing
   * Takes current element state and mouse position
   */
  preview(element: Element, mouseMove: MouseMove): Element;
  
  /**
   * Calculate bounds from shape
   * Pure function - just measures the shape
   */
  bounds(shape: Shape, origin: Point): Bounds;
  
  /**
   * Get edit handles for this element
   */
  editHandles(element: Element): EditHandle[];
  
  /**
   * Apply edit handle drag
   */
  applyEdit(element: Element, handle: EditHandle, delta: Point): Element;
  
  /**
   * Check if point is near element
   */
  inVicinity(element: Element, point: Point): boolean;
}

export interface GeneratedShape {
  shape: Shape;
  bounds: Bounds;
}
```

### Renderer Implementations

```typescript
// apps/web/src/element/renderers/line.ts
export class LineRenderer implements ElementRenderer<LineData> {
  generate(data: LineData, origin: Point): GeneratedShape {
    const shape = g.polyline(data.points);
    const bounds = this.bounds(shape, origin);
    return { shape, bounds };
  }
  
  preview(element: Element, mouseMove: MouseMove): Element {
    const data = element.data as LineData;
    const lastPoint = data.points[data.points.length - 1];
    
    // Snap to dominant direction
    let previewPoint = {
      x: mouseMove.currentEvent?.clientX || element.x,
      y: mouseMove.currentEvent?.clientY || element.y,
    };
    
    const dx = Math.abs(previewPoint.x - lastPoint.x);
    const dy = Math.abs(previewPoint.y - lastPoint.y);
    
    if (dx > dy) {
      previewPoint.y = lastPoint.y;
    } else {
      previewPoint.x = lastPoint.x;
    }
    
    const previewPoints = [...data.points, previewPoint];
    const { shape, bounds } = this.generate(
      { type: 'line', points: previewPoints },
      { x: element.x, y: element.y }
    );
    
    return {
      ...element,
      x: bounds.x,
      y: bounds.y,
      shape,
      data: { type: 'line', points: previewPoints },
    };
  }
  
  bounds(shape: Shape, origin: Point): Bounds {
    return g.shapeBounds(shape, origin);
  }
  
  editHandles(element: Element): EditHandle[] {
    const data = element.data as LineData;
    // Return handle for each point
    return data.points.map((point, i) => ({
      id: `point-${i}`,
      type: 'point',
      position: point,
      bounds: g.handleBounds(point),
    }));
  }
  
  applyEdit(element: Element, handle: EditHandle, delta: Point): Element {
    const data = element.data as LineData;
    const pointIndex = parseInt(handle.id.split('-')[1]);
    
    const newPoints = [...data.points];
    newPoints[pointIndex] = {
      x: newPoints[pointIndex].x + delta.x,
      y: newPoints[pointIndex].y + delta.y,
    };
    
    const { shape, bounds } = this.generate(
      { type: 'line', points: newPoints },
      { x: element.x, y: element.y }
    );
    
    return {
      ...element,
      x: bounds.x,
      y: bounds.y,
      shape,
      data: { type: 'line', points: newPoints },
    };
  }
  
  inVicinity(element: Element, point: Point): boolean {
    return g.pointNearShape(point, element.shape, element);
  }
}
```

### Renderer Registry

```typescript
// apps/web/src/element/renderers/index.ts
export class RendererRegistry {
  private renderers = new Map<ElementType, ElementRenderer<any>>();
  
  register<T extends ElementData>(
    type: ElementType, 
    renderer: ElementRenderer<T>
  ): void {
    this.renderers.set(type, renderer);
  }
  
  get(type: ElementType): ElementRenderer<any> {
    const renderer = this.renderers.get(type);
    if (!renderer) {
      throw new Error(`No renderer for element type: ${type}`);
    }
    return renderer;
  }
}

// Global registry
export const renderers = new RendererRegistry();

// Register all renderers
renderers.register(ElementType.Line, new LineRenderer());
renderers.register(ElementType.Arrow, new ArrowRenderer());
renderers.register(ElementType.Rectangle, new RectangleRenderer());
renderers.register(ElementType.Text, new TextRenderer());

// Usage
export function rendererFor(element: Element): ElementRenderer<any> {
  return renderers.get(element.type);
}
```

### Refactored Geometry Layer

Break down `geometry.ts` into focused modules:

```
apps/web/src/geometry/
├── index.ts              # Public API
├── types.ts              # Shape, Point, Bounds types
├── shapes/
│   ├── polyline.ts       # Polyline generation
│   ├── rectangle.ts      # Rectangle generation
│   ├── arrow.ts          # Arrow generation
│   └── text.ts           # Text shape
├── grid/
│   ├── grid.ts           # Grid creation and manipulation
│   ├── draw.ts           # Drawing lines/corners on grid
│   └── corners.ts        # Corner character detection
├── bounds/
│   ├── calculate.ts      # Bounds calculation from shapes
│   └── merge.ts          # Merge multiple bounds
└── utils/
    ├── scale.ts          # X_SCALE, Y_SCALE utilities
    └── vicinity.ts       # Point-in-shape detection
```

**geometry/shapes/polyline.ts:**
```typescript
import { Point, Shape } from '../types';
import { createGrid, drawLine, placeCorner } from '../grid';
import { X_SCALE, Y_SCALE } from '../utils/scale';

export function polyline(points: Point[]): Shape {
  if (points.length < 2) return [[]];
  
  if (points.length === 2) {
    return singleSegment(points[0], points[1]);
  }
  
  return multiSegment(points);
}

function singleSegment(p1: Point, p2: Point): Shape {
  const dx = Math.abs(p2.x - p1.x) / X_SCALE;
  const dy = Math.abs(p2.y - p1.y) / Y_SCALE;
  const horizontal = dx > dy;
  const len = Math.floor(horizontal ? dx : dy);
  return line(len, horizontal);
}

function multiSegment(points: Point[]): Shape {
  const bounds = calculateBounds(points);
  const grid = createGrid(bounds.width, bounds.height);
  
  // Draw segments
  for (let i = 0; i < points.length - 1; i++) {
    drawLine(grid, points[i], points[i + 1], bounds.origin);
  }
  
  // Place corners
  for (let i = 1; i < points.length - 1; i++) {
    placeCorner(grid, points[i - 1], points[i], points[i + 1], bounds.origin);
  }
  
  return gridToShape(grid);
}
```

**geometry/bounds/calculate.ts:**
```typescript
import { Shape, Point, Bounds } from '../types';
import { X_SCALE, Y_SCALE } from '../utils/scale';

export function shapeBounds(shape: Shape, origin: Point): Bounds {
  const width = Math.max(...shape.map(row => row.length));
  const height = shape.length;
  
  return {
    x: origin.x,
    y: origin.y,
    width,
    height,
  };
}

export function pointsBounds(points: Point[]): Bounds {
  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));
  
  return {
    x: minX,
    y: minY,
    width: Math.floor((maxX - minX) / X_SCALE) + 1,
    height: Math.floor((maxY - minY) / Y_SCALE) + 1,
  };
}
```

### Migration Strategy

#### Phase 1: Add Renderer Layer (Non-breaking)
1. Create renderer interfaces and implementations
2. Keep existing element utils working
3. Add renderers alongside current code
4. Test renderers match current behavior

#### Phase 2: Update Element Creation
1. Modify drawing modes to use renderers
2. Ensure elements always have correct shape
3. Update finalization to use renderers
4. Keep backward compatibility

#### Phase 3: Refactor Geometry
1. Break down geometry.ts into modules
2. Remove element type dependencies
3. Make functions pure (shape in, shape out)
4. Update all callers

#### Phase 4: Update Element Utils
1. Migrate to new Element interface
2. Remove old len/direction format
3. Normalize all lines to use points
4. Update serialization/deserialization

#### Phase 5: Cleanup
1. Remove old ElementUtils interface
2. Remove type casting
3. Remove format checking
4. Update tests

### Benefits

1. **Add new shape:** Implement one renderer class, register it. Done.
2. **Type safety:** No more `(element as any)`, proper discriminated unions
3. **Testability:** Pure functions, easy to test in isolation
4. **Maintainability:** Clear boundaries, single responsibility
5. **Performance:** Shape cached, only regenerate on edit
6. **Extensibility:** Easy to add features (snapping, constraints, etc.)

### Example: Adding a Circle

```typescript
// 1. Define data type
export interface CircleData {
  type: 'circle';
  radius: number;
}

// 2. Implement renderer
export class CircleRenderer implements ElementRenderer<CircleData> {
  generate(data: CircleData, origin: Point): GeneratedShape {
    const shape = g.circle(data.radius);
    const bounds = g.shapeBounds(shape, origin);
    return { shape, bounds };
  }
  
  preview(element: Element, mouseMove: MouseMove): Element {
    const data = element.data as CircleData;
    const dx = mouseMove.accX;
    const dy = mouseMove.accY;
    const radius = Math.floor(Math.sqrt(dx * dx + dy * dy) / X_SCALE);
    
    const { shape, bounds } = this.generate(
      { type: 'circle', radius },
      { x: element.x, y: element.y }
    );
    
    return { ...element, shape, data: { type: 'circle', radius } };
  }
  
  // ... other methods
}

// 3. Register
renderers.register(ElementType.Circle, new CircleRenderer());

// 4. Add to geometry/shapes/circle.ts
export function circle(radius: number): Shape {
  // ASCII circle generation
}
```

That's it. No changes to Canvas.tsx, drawing modes, or other elements.

## Rendering Flow

### Current Flow (What Stays)

```
Elements in Store
    ↓
merge(elements) → MergedElements { origin, content: string[][] }
    ↓
draw.merged(ctx, merged) → Renders to canvas
```

The `merge()` function and canvas drawing stay the same. They work with shapes, not element types.

### What Changes: How Elements Get Their Shapes

**Before (Current):**
```typescript
// Element has shape, but might be stale
element = { id, type, x, y, shape, len, direction }

// merge() uses getWidth/getHeight which checks element type
function getWidth(element) {
  switch (element.type) {
    case Line: return element.len;  // Wrong for multi-segment!
    // ...
  }
}

// Scene array sized incorrectly, crash
```

**After (Refactored):**
```typescript
// Element always has correct shape
element = { id, type, x, y, shape, data }

// merge() just uses shape dimensions directly
function merge(elements: Element[]): MergedElements {
  const bounds = calculateBoundsFromShapes(elements);
  const grid = createGrid(bounds.width, bounds.height);
  
  elements.forEach(element => {
    writeShapeToGrid(grid, element.shape, element.x, element.y, bounds.origin);
  });
  
  return {
    origin: bounds.origin,
    content: grid,
  };
}

// No element type checking needed!
```

### Detailed Rendering Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Element Creation/Edit                                │
│    User draws or edits element                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Renderer.generate()                                  │
│    renderer.generate(data, origin)                      │
│    → { shape: Shape, bounds: Bounds }                   │
│                                                          │
│    Example for Line:                                    │
│    data = { type: 'line', points: [...] }               │
│    shape = g.polyline(points)                           │
│    bounds = g.shapeBounds(shape, origin)                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Element Stored                                       │
│    element = {                                          │
│      id, type, x, y,                                    │
│      shape: ['───┐', '   │', '───┘'],  ← Always correct│
│      data: { type: 'line', points: [...] }              │
│    }                                                    │
│    store.elements[id] = element                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Render Trigger (useEffect in useDraw)               │
│    When elements change, trigger redraw                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 5. merge(elements) - Type Agnostic                     │
│                                                          │
│    // Calculate scene bounds from all shapes            │
│    const bounds = {                                     │
│      x: min(elements.map(e => e.x)),                    │
│      y: min(elements.map(e => e.y)),                    │
│      width: max(elements.map(e =>                       │
│        e.x + maxRowLength(e.shape))),                   │
│      height: max(elements.map(e =>                      │
│        e.y + e.shape.length))                           │
│    }                                                    │
│                                                          │
│    // Create scene grid                                 │
│    const grid = Array(bounds.height)                    │
│      .fill(null)                                        │
│      .map(() => Array(bounds.width).fill(' '))          │
│                                                          │
│    // Write each element's shape to grid                │
│    elements.forEach(element => {                        │
│      const offsetX = (element.x - bounds.x) / X_SCALE   │
│      const offsetY = (element.y - bounds.y) / Y_SCALE   │
│                                                          │
│      element.shape.forEach((row, rowNum) => {           │
│        row.split('').forEach((char, colNum) => {        │
│          if (char !== ' ') {                            │
│            grid[rowNum + offsetY][colNum + offsetX] = char│
│          }                                              │
│        })                                               │
│      })                                                 │
│    })                                                   │
│                                                          │
│    return { origin: bounds, content: grid }             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 6. draw.merged(ctx, merged)                            │
│    Iterate through grid, draw each character to canvas  │
│                                                          │
│    merged.content.forEach((row, y) => {                 │
│      row.forEach((char, x) => {                         │
│        ctx.fillText(char,                               │
│          merged.origin.x + x * X_SCALE,                 │
│          merged.origin.y + y * Y_SCALE)                 │
│      })                                                 │
│    })                                                   │
└─────────────────────────────────────────────────────────┘
```

### Key Insight: merge() Doesn't Care About Element Types

**Current problem:**
```typescript
// merge() calls getBoundingRect()
// which calls getWidth(element)
// which has switch(element.type) ← Type coupling!

function getWidth(element: Element): number {
  switch (element.type) {
    case ElementType.Line:
      if ((element as any).points) {  // ← Ugly!
        return Math.max(...element.shape.map(row => row.length));
      }
      return element.len;  // ← Wrong for multi-segment
    // ...
  }
}
```

**After refactor:**
```typescript
// merge() just reads shape dimensions
function merge(elements: Element[]): MergedElements {
  // No getWidth/getHeight needed!
  // Just use shape.length and max(row.length)
  
  const bounds = calculateSceneBounds(elements);
  const grid = createSceneGrid(bounds);
  
  elements.forEach(element => {
    writeShapeToGrid(grid, element.shape, element, bounds.origin);
  });
  
  return { origin: bounds.origin, content: grid };
}

// Pure function - no element type knowledge
function calculateSceneBounds(elements: Element[]): Bounds {
  const minX = Math.min(...elements.map(e => e.x));
  const minY = Math.min(...elements.map(e => e.y));
  
  const maxX = Math.max(...elements.map(e => {
    const shapeWidth = Math.max(...e.shape.map(row => row.length));
    return e.x + shapeWidth * X_SCALE;
  }));
  
  const maxY = Math.max(...elements.map(e => {
    const shapeHeight = e.shape.length;
    return e.y + shapeHeight * Y_SCALE;
  }));
  
  return {
    x: minX,
    y: minY,
    width: Math.floor((maxX - minX) / X_SCALE),
    height: Math.floor((maxY - minY) / Y_SCALE),
  };
}
```

### Refactored geometry/scene.ts

```typescript
import { Element, Bounds, Point } from './types';
import { X_SCALE, Y_SCALE } from './utils/scale';

export interface MergedElements {
  origin: Point;
  content: string[][];
}

export function merge(elements: Element[]): MergedElements {
  if (elements.length === 0) {
    return { origin: { x: 0, y: 0 }, content: [[]] };
  }
  
  const bounds = calculateSceneBounds(elements);
  const grid = createSceneGrid(bounds.width, bounds.height);
  
  elements.forEach(element => {
    writeShapeToGrid(grid, element.shape, element, bounds.origin);
  });
  
  return {
    origin: { x: bounds.x, y: bounds.y },
    content: grid,
  };
}

function calculateSceneBounds(elements: Element[]): Bounds {
  const minX = Math.min(...elements.map(e => e.x));
  const minY = Math.min(...elements.map(e => e.y));
  
  const maxX = Math.max(...elements.map(e => {
    const shapeWidth = Math.max(0, ...e.shape.map(row => row.length));
    return e.x + shapeWidth * X_SCALE;
  }));
  
  const maxY = Math.max(...elements.map(e => {
    const shapeHeight = e.shape.length;
    return e.y + shapeHeight * Y_SCALE;
  }));
  
  const width = Math.floor((maxX - minX) / X_SCALE);
  const height = Math.floor((maxY - minY) / Y_SCALE);
  
  return { x: minX, y: minY, width, height };
}

function createSceneGrid(width: number, height: number): string[][] {
  return Array(height)
    .fill(null)
    .map(() => Array(width).fill(' '));
}

function writeShapeToGrid(
  grid: string[][],
  shape: Shape,
  element: Element,
  sceneOrigin: Point
): void {
  const offsetX = Math.floor((element.x - sceneOrigin.x) / X_SCALE);
  const offsetY = Math.floor((element.y - sceneOrigin.y) / Y_SCALE);
  
  shape.forEach((row, rowNum) => {
    const chars = row.split('');
    chars.forEach((char, colNum) => {
      if (char !== ' ') {
        const gridY = rowNum + offsetY;
        const gridX = colNum + offsetX;
        
        // Bounds check
        if (gridY >= 0 && gridY < grid.length &&
            gridX >= 0 && gridX < grid[0].length) {
          grid[gridY][gridX] = char;
        }
      }
    });
  });
}
```

### Summary

**What changes:**
- Elements always have correct shape (via renderers)
- `merge()` simplified - no type checking
- Bounds calculated from shape dimensions directly

**What stays the same:**
- `merge()` creates scene grid
- `draw.merged()` renders to canvas
- Overall rendering pipeline

**Key benefit:**
- Add new element type → No changes to merge() or drawing code
- Shape is the contract, not element type



1. Review and approve architecture
2. Create feature branch
3. Implement Phase 1 (renderers)
4. Validate with existing elements
5. Proceed with remaining phases
