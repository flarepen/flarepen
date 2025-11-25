# Element V2 Architecture

## Goals

1. Self-contained shape modules - add new shape in one file
2. Type-agnostic rendering - merge() doesn't know element types
3. Shape is always correct - invariant maintained by element handlers

## How It Works

Two independent loops connected by store state:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EVENT LOOP                                        │
│                                                                             │
│  User Action          Mode Handler              Element Handler    Store    │
│  ───────────          ────────────              ───────────────    ─────    │
│                                                                             │
│  mousedown ─────────▶ onPointerDown() ─────────▶ create() ────────▶ draft   │
│                                                                             │
│  mousemove ─────────▶ onPointerMove() ─────────▶ preview() ───────▶ draft   │
│                                                                             │
│  mouseup ───────────▶ onPointerUp() ──────────────────────────────▶ elements│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         RENDER LOOP (independent)                           │
│                                                                             │
│  useRenderLoop                                                              │
│  ─────────────                                                              │
│                                                                             │
│  useEffect([elements, draft, selectedIds, ...]) {                           │
│      requestAnimationFrame(drawScene)                                       │
│  }                                                                          │
│                                                                             │
│  drawScene() {                                                              │
│      read elements ◄──────────────────────────────────────────── store      │
│      read draft ◄───────────────────────────────────────────────            │
│      read selectedIds ◄─────────────────────────────────────────            │
│                                                                             │
│      buildScene(elements) → canvasDraw.scene()                              │
│      buildScene(draft) → canvasDraw.scene()                                 │
│      elementHandlerFor(selected).bounds() → canvasDraw.rect()               │
│  }                                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Event loop**: User actions → Mode handlers → Element handlers → Update store
- **Render loop**: useEffect watches store → Triggers redraw when state changes

They never call each other directly. Store is the single source of truth.

## Layer Overview

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│  Canvas.tsx + ModeHandlers                                                                    │
│  - Event handling                                                                             │
│  - Calls element handlers: create(), preview(), applyEdit()                                   │
│  - Stores elements with correct rows                                                          │
└───────────────┬───────────────────────────────────────────┬───────────────────────────────────┘
                │                                           │
                │ store.elements                            │ element handler calls
                ▼                                           ▼
┌───────────────────────────────────┐   ┌───────────────────────────────────┐   ┌──────────────────────────┐
│  useRenderLoop                    │   │  Element Handlers                 │   │  geometry-v2             │
│  - Render loop                    │   │                                   │   │  - rectangle()           │
│  - Reads element.rows             │   │  create()     ◄── Canvas          │──▶│  - polyline()            │
│  - buildScene() → canvasDraw      │──▶│  preview()    ◄── Canvas          │   │  - buildScene()          │
│    .scene()                       │   │  applyEdit()  ◄── Canvas          │   │  - boundsFromRows()      │
│  - Calls element handlers:        │   │  bounds()     ◄── useRenderLoop   │   │                          │
│    bounds(), editHandles()        │   │  editHandles()◄── useRenderLoop   │   │  (pure shape functions)  │
│  - Calls canvasDraw.*             │   │  inVicinity() ◄── Select          │   └──────────────────────────┘
└───────────────┬───────────────────┘   └───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────┐
│  canvasDraw.ts                    │
│  - scene(ctx, scene)              │
│  - rect(), dashedRect()           │
│  - line(), circle()               │
│                                   │
│  (canvas primitives)              │
└───────────────────────────────────┘
```

## Element Type

```typescript
interface Element {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rows: RenderedRows;     // ASCII representation
  data: ElementData;      // Type-specific data
  labelEnabled: boolean;
  label?: string;
}

type ElementData = 
  | RectangleData 
  | LineData 
  | ArrowData 
  | TextData;

interface RectangleData {
  type: 'rectangle';
  width: number;
  height: number;
  borderType: BorderType;
}

interface LineData {
  type: 'line';
  points: Point[];
}

interface ArrowData {
  type: 'arrow';
  points: Point[];
}

interface TextData {
  type: 'text';
  content: string;
}
```

## ElementHandler Interface

```typescript
interface ElementHandler<T extends ElementData> {
  // Create new element with initial rows
  create(x: number, y: number): Element;
  
  // Live preview with snapping/constraints
  preview(element: Element, mouseMove: MouseMove): Element;
  
  // Selection bounds
  bounds(element: Element): IBounds;
  
  // Hit testing
  inVicinity(element: Element, point: Point): boolean;
  
  // Optional
  editHandles?(element: Element): EditHandle[];
  applyEdit?(element: Element, handle: EditHandle, delta: Point): Element;
}
```

## ElementHandler Methods

```
┌─────────────────┬──────────────────────────────┬─────────────────┬─────────────────────────────┐
│ Method          │ Purpose                      │ Called by       │ When                        │
├─────────────────┼──────────────────────────────┼─────────────────┼─────────────────────────────┤
│ create()        │ New element with init rows   │ Mode handlers   │ mousedown starts drawing    │
├─────────────────┼──────────────────────────────┼─────────────────┼─────────────────────────────┤
│ preview()       │ Live drawing with snapping   │ Mode handlers   │ mousemove during draw       │
├─────────────────┼──────────────────────────────┼─────────────────┼─────────────────────────────┤
│ applyEdit()     │ Resize/reshape element       │ Mode handlers   │ Dragging edit handle        │
├─────────────────┼──────────────────────────────┼─────────────────┼─────────────────────────────┤
│ bounds()        │ Selection outline box        │ useRenderLoop   │ Drawing selection box       │
├─────────────────┼──────────────────────────────┼─────────────────┼─────────────────────────────┤
│ editHandles()   │ Resize handle positions      │ useRenderLoop   │ Drawing handles             │
├─────────────────┼──────────────────────────────┼─────────────────┼─────────────────────────────┤
│ inVicinity()    │ Hit testing                  │ Select mode     │ Click to select             │
└─────────────────┴──────────────────────────────┴─────────────────┴─────────────────────────────┘
```

Internally, `create()`, `preview()`, and `applyEdit()` call geometry functions (e.g., `g.polyline()`) to generate `RenderedRows`.

## File Structure

```
element/
├── types.ts              # Element, ElementData types
├── index.ts              # createElement, elementHandlerFor
└── handlers/
    ├── types.ts          # ElementHandler interface
    ├── registry.ts       # ElementHandlerRegistry
    ├── rectangle.ts      # RectangleData + RectangleHandler
    ├── line.ts           # LineData + LineHandler
    ├── arrow.ts          # ArrowData + ArrowHandler
    └── text.ts           # TextData + TextHandler

geometry-v2/
├── types.ts              # RenderedRows, Point, Bounds, Scene
├── shapes.ts             # rectangle(), polyline(), polyarrow(), text()
├── scene.ts              # buildScene()
├── bounds.ts             # boundsFromRows()
└── scale.ts              # X_SCALE, Y_SCALE, conversions
```

## Self-Contained Shape Module

Each shape in one file:

```typescript
// element/handlers/line.ts
import * as g from '../../geometry-v2';

export interface LineData {
  type: 'line';
  points: Point[];
}

export const LineHandler: ElementHandler<LineData> = {
  create(x, y) {
    const points = [{ x, y }];
    return {
      id: generateId(),
      type: ElementType.Line,
      x, y,
      rows: g.polyline(points),
      data: { type: 'line', points },
      labelEnabled: false,
    };
  },

  preview(element, mouseMove) {
    const data = element.data as LineData;
    const lastPoint = data.points[data.points.length - 1];
    
    // Snap to dominant direction
    const snappedPoint = snapToDirection(lastPoint, mouseMove);
    const newPoints = [...data.points, snappedPoint];
    
    const minX = Math.min(...newPoints.map(p => p.x));
    const minY = Math.min(...newPoints.map(p => p.y));
    
    return {
      ...element,
      x: minX,
      y: minY,
      rows: g.polyline(newPoints),  // calls geometry directly
      data: { type: 'line', points: newPoints },
    };
  },

  bounds(element) {
    return g.boundsFromRows(element.rows, { x: element.x, y: element.y });
  },

  inVicinity(element, point) {
    const data = element.data as LineData;
    return g.pointNearPolyline(point, data.points);
  },

  editHandles(element) {
    const data = element.data as LineData;
    return data.points.map((p, i) => ({
      id: `point-${i}`,
      bounds: { x: p.x - 4, y: p.y - 4, width: 8, height: 8 },
      handleType: 'point',
    }));
  },

  applyEdit(element, handle, delta) {
    const data = element.data as LineData;
    const idx = parseInt(handle.id.split('-')[1]);
    const newPoints = [...data.points];
    newPoints[idx] = { x: newPoints[idx].x + delta.x, y: newPoints[idx].y + delta.y };
    
    const minX = Math.min(...newPoints.map(p => p.x));
    const minY = Math.min(...newPoints.map(p => p.y));
    
    return {
      ...element,
      x: minX,
      y: minY,
      rows: g.polyline(newPoints),  // calls geometry directly
      data: { type: 'line', points: newPoints },
    };
  },
};
```

## Registry

```typescript
// element/handlers/registry.ts
class ElementHandlerRegistry {
  private handlers = new Map<string, ElementHandler<any>>();

  register<T extends ElementData>(type: string, handler: ElementHandler<T>) {
    this.handlers.set(type, handler);
  }

  get(type: string): ElementHandler<any> {
    const h = this.handlers.get(type);
    if (!h) throw new Error(`No element handler for: ${type}`);
    return h;
  }
}

export const registry = new ElementHandlerRegistry();

// Register all
registry.register('rectangle', RectangleHandler);
registry.register('line', LineHandler);
registry.register('arrow', ArrowHandler);
registry.register('text', TextHandler);

export function elementHandlerFor(element: Element): ElementHandler<any> {
  return registry.get(element.data.type);
}
```

## Data Flow

### 1. Drawing (ModeHandler calls element handler)

```typescript
// User clicks to start line
const element = elementHandlerFor(type).create('line', x, y);
store.setDraft(element);

// User moves mouse - mode handler calls element handler
const updated = elementHandlerFor(element).preview(element, mouseMove);
store.setDraft(updated);  // shape is correct

// User finalizes
store.addElement(draft);  // rows already correct
```

### 2. Rendering (useRenderLoop)

```typescript
function drawScene() {
  // ASCII content - type agnostic
  const positionedRows = Object.values(elements).map(e => ({
    rows: e.rows,
    position: { x: e.x, y: e.y }
  }));
  const scene = buildScene(positionedRows);
  canvasDraw.scene(ctx, scene);

  // Draft
  if (draft) {
    canvasDraw.scene(ctx, buildScene([{ rows: draft.rows, position: { x: draft.x, y: draft.y } }]));
  }

  // Selection bounds - uses element handler
  selectedElements.forEach(el => {
    canvasDraw.rect(ctx, elementHandlerFor(el).bounds(el));
  });

  // Edit handles - uses element handler
  if (selected) {
    const handles = elementHandlerFor(selected).editHandles?.(selected) || [];
    handles.forEach(h => canvasDraw.rect(ctx, h.bounds));
  }
}
```

### 3. Hit Testing

```typescript
// In select mode, find element under cursor
function findElementAt(point: Point): Element | null {
  return Object.values(elements).find(el => 
    elementHandlerFor(el).inVicinity(el, point)
  );
}
```

## Adding New Shape

1. Create `element/handlers/diamond.ts`:

```typescript
export interface DiamondData {
  type: 'diamond';
  size: number;
}

export const DiamondHandler: ElementHandler<DiamondData> = {
  create(x, y) {
    return {
      id: generateId(),
      type: ElementType.Diamond,
      x, y,
      rows: g.diamond(1),
      data: { type: 'diamond', size: 1 },
      labelEnabled: false,
    };
  },
  preview(element, mouseMove) { ... },
  bounds(element) { ... },
  inVicinity(element, point) { ... },
};
```

2. Add to geometry-v2/shapes.ts:

```typescript
export function diamond(size: number): RenderedRows { ... }
```

3. Register:

```typescript
registry.register('diamond', DiamondHandler);
```

4. Add to ElementData union:

```typescript
type ElementData = ... | DiamondData;
```

Done. No changes to Canvas, useRenderLoop, canvasDraw.ts, or buildScene.

## Migration

### Phase 1: New Element Types
- Create `element/types.ts` with new Element interface
- Create `element/handlers/` with all element handlers
- Keep old element code working

### Phase 2: Switch useRenderLoop
- Rename useDraw → useRenderLoop
- Rename draw.ts → canvasDraw.ts
- Update to use `elementHandlerFor().bounds()` instead of `utilFor().outlineBounds()`
- Update buildScene call (trivial conversion)

### Phase 3: Switch ModeHandlers
- Update mode handlers to use element handlers
- Remove old ElementUtils

### Phase 4: Cleanup
- Remove old element/*.ts files
- Remove old geometry.ts merge/getWidth/getHeight
