# Multi-Segment Line and Arrow

## Overview

Extend existing Line and Arrow tools to support multi-segment drawing (polylines) while maintaining backward compatibility with single-segment drag behavior.

## User Interaction

### Multi-segment (click-move-click)
1. Click → place first point (enter drawing mode, pending stage)
2. Move → preview next segment
3. Click → place second point (stay in pending)
4. Move → preview next segment
5. Click → place third point (stay in pending)
6. Repeat...
7. **Double-click OR ESC** → finalize line/arrow

### Single-segment (drag) - Backward Compatible
1. Click → first point
2. Drag → active stage (switches after DRAGGING_THRESHOLD)
3. Release → finalize (current behavior)

## Implementation

### 1. Element Types

**File:** `apps/web/src/element/linear.ts`

Added optional `points` array to LinearElement:
```typescript
export interface LinearElement extends ElementCommons {
  len: number;
  direction: LinearDirection;
  points?: Point[]; // Optional: for multi-segment lines/arrows
}
```

Line and Arrow extend LinearElement, so they inherit this property. Single-segment lines use `len/direction`, multi-segment use `points[]`.

### 2. Geometry Generation

**File:** `apps/web/src/geometry.ts`

Added `polyline()` function that creates a grid and draws segments:

```typescript
export function polyline(points: Point[]): Shape {
  if (points.length < 2) return [[]];
  
  // Single segment - use existing line function
  if (points.length === 2) {
    const dx = Math.abs(points[1].x - points[0].x) / X_SCALE;
    const dy = Math.abs(points[1].y - points[0].y) / Y_SCALE;
    const horizontal = dx > dy;
    const len = Math.floor(horizontal ? dx : dy);
    return line(len, horizontal);
  }
  
  // Multi-segment - calculate bounding box and create grid
  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));
  
  const width = Math.floor((maxX - minX) / X_SCALE) + 1;
  const height = Math.floor((maxY - minY) / Y_SCALE) + 1;
  
  const grid: string[][] = Array(height).fill(null).map(() => 
    Array(width).fill(' ')
  );
  
  // Draw each segment with tolerance (snap to dominant direction)
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    const x1 = Math.floor((p1.x - minX) / X_SCALE);
    const y1 = Math.floor((p1.y - minY) / Y_SCALE);
    const x2 = Math.floor((p2.x - minX) / X_SCALE);
    const y2 = Math.floor((p2.y - minY) / Y_SCALE);
    
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    
    if (dx <= 1 && dy > 0) {
      // Vertical - snap to x1
      const startY = Math.min(y1, y2);
      const endY = Math.max(y1, y2);
      for (let y = startY; y <= endY; y++) {
        grid[y][x1] = SYMBOLS.VERTICAL;
      }
    } else if (dy <= 1 && dx > 0) {
      // Horizontal - snap to y1
      const startX = Math.min(x1, x2);
      const endX = Math.max(x1, x2);
      for (let x = startX; x <= endX; x++) {
        grid[y1][x] = SYMBOLS.HORIZONTAL;
      }
    }
  }
  
  // Place corners at junction points
  for (let i = 1; i < points.length - 1; i++) {
    const corner = getCornerChar(points[i - 1], points[i], points[i + 1]);
    const gridX = Math.floor((points[i].x - minX) / X_SCALE);
    const gridY = Math.floor((points[i].y - minY) / Y_SCALE);
    grid[gridY][gridX] = corner;
  }
  
  return grid.map(row => row.join(''));
}
```

Corner detection uses direction changes to pick the right box-drawing character (┐┘└┌).

### 3. Drawing Mode

**File:** `apps/web/src/editor/modes/drawing.ts`

**onPointerDown:** Adds points on click, skips duplicates and double-clicks
```typescript
if (interactionMode.stage === 'pending' && 
    (interactionMode.element.type === ElementType.Line || 
     interactionMode.element.type === ElementType.Arrow)) {
  
  // Skip double-click (handled by Canvas.tsx)
  if ((e.nativeEvent as MouseEvent).detail === 2) return;
  
  const newPoint = { x: clipToScale(e.clientX, X_SCALE), y: clipToScale(e.clientY, Y_SCALE) };
  
  // Initialize points array if first click
  if (!interactionMode.element.points) {
    interactionMode.element.points = [{ x: interactionMode.element.x, y: interactionMode.element.y }];
  }
  
  // Skip duplicate points
  const lastPoint = interactionMode.element.points[interactionMode.element.points.length - 1];
  if (lastPoint.x === newPoint.x && lastPoint.y === newPoint.y) return;
  
  // Add point and update state
  const updatedElement = {
    ...interactionMode.element,
    points: [...interactionMode.element.points, newPoint],
  };
  
  useStore.setState({
    interactionMode: { ...interactionMode, element: updatedElement },
    draft: { element: updatedElement, stage: 'pending' },
  });
}
```

**onPointerMove:** Shows preview by calling element's create function
```typescript
if (interactionMode.stage === 'pending' &&
    (interactionMode.element.type === ElementType.Line || 
     interactionMode.element.type === ElementType.Arrow) &&
    interactionMode.element.points) {
  
  // Use element's create function to generate preview with snapping
  utilFor(interactionMode.element).create(interactionMode.element, mouseMove, (updated) => {
    useStore.setState({
      draft: { element: updated, stage: 'pending' },
    });
  });
}
```

**File:** `apps/web/src/element/line.ts`

**create function:** Snaps preview point to dominant direction
```typescript
if (line.points && line.points.length > 0) {
  const lastPoint = line.points[line.points.length - 1];
  let previewPoint = {
    x: mouseMove.currentEvent?.clientX || line.x,
    y: mouseMove.currentEvent?.clientY || line.y,
  };
  
  // Snap to dominant direction
  const dx = Math.abs(previewPoint.x - lastPoint.x);
  const dy = Math.abs(previewPoint.y - lastPoint.y);
  
  if (dx > dy) {
    previewPoint.y = lastPoint.y; // Lock to horizontal
  } else {
    previewPoint.x = lastPoint.x; // Lock to vertical
  }
  
  const allPoints = [...line.points, previewPoint];
  const minX = Math.min(...allPoints.map(p => p.x));
  const minY = Math.min(...allPoints.map(p => p.y));
  
  callback({
    ...line,
    x: minX,
    y: minY,
    points: allPoints,
    shape: g.polyline(allPoints),
  });
}
```

### 4. Finalization

**File:** `apps/web/src/editor/Canvas.tsx`

Both ESC and double-click regenerate the shape from points before adding to store:

```typescript
// ESC handler
if (e.key === 'Escape' && interactionMode.type === 'drawing') {
  if ((interactionMode.element.type === ElementType.Line || 
       interactionMode.element.type === ElementType.Arrow) &&
      interactionMode.element.points && 
      interactionMode.element.points.length >= 2) {
    
    // Regenerate shape from points
    const finalPoints = interactionMode.element.points;
    const minX = Math.min(...finalPoints.map(p => p.x));
    const minY = Math.min(...finalPoints.map(p => p.y));
    
    const finalElement = {
      ...interactionMode.element,
      x: minX,
      y: minY,
      points: finalPoints,
      shape: g.polyline(finalPoints),
    };
    
    actions.addElement(santizeElement(finalElement), false);
    actions.select(finalElement.id, true);
    
    if (!toolLocked) {
      actions.setTool(Tool.Select);
    }
    
    useStore.setState({
      interactionMode: { type: 'idle' },
      draft: null,
    });
  }
}

// Double-click handler (similar logic)
if (e.detail === 2 && interactionMode.type === 'drawing') {
  // Same finalization code
}
```

Key: Must regenerate shape with `g.polyline(finalPoints)` because `interactionMode.element` has stale shape from initial creation.

### 5. Dimension Calculation

**File:** `apps/web/src/geometry.ts`

Updated `getWidth()` and `getHeight()` to handle multi-segment lines:

```typescript
function getWidth(element: Element): number {
  switch (element.type) {
    case ElementType.Line:
      // Multi-segment - use shape width
      if ((element as any).points) {
        return Math.max(...element.shape.map(row => row.length));
      }
      return isHorizontal(element) ? element.len : 1;
    // ...
  }
}

function getHeight(element: Element): number {
  switch (element.type) {
    case ElementType.Line:
      // Multi-segment - use shape height
      if ((element as any).points) {
        return element.shape.length;
      }
      return isHorizontal(element) ? 1 : element.len;
    // ...
  }
}
```

This fixes scene array sizing in `merge()` function.

## Corner Characters

Using box drawing characters for clean junctions:

```
┌  top-left corner
┐  top-right corner
└  bottom-left corner
┘  bottom-right corner
─  horizontal line
│  vertical line
```

## Example

```
Point 1 ─────┐ Point 2
             │
             │
Point 4 ─────┘ Point 3
```

4 points create 3 segments with 2 corners.

## Migration Notes

- Existing single-segment Line/Arrow elements use `len` and `direction` properties
- Multi-segment lines add `points[]` array alongside these properties
- Both formats coexist - functions check for `points` to determine which format
- No migration needed for existing diagrams

## Testing

1. Single-segment drag (existing behavior)
2. Multi-segment click-move-click
3. Double-click to finalize
4. ESC to finalize
5. Corner rendering at junctions
6. Arrow head on last segment
7. Backspace to undo last point


## Current Status (2025-11-24)

### Working
- ✅ Click-move-click to add points
- ✅ Preview with snapping to horizontal/vertical
- ✅ ESC and double-click to finalize
- ✅ Multi-segment rendering with corners
- ✅ Shape generation from points array

### Rough Edges to Fix

#### 1. Selection Bounds
**Issue:** Selection box only shows first segment bounds (using old `len` property)
**Fix needed:** Update `LinearElementUtils.outlineBounds()` to calculate bounds from shape dimensions for multi-segment lines

#### 2. Dimension Label
**Issue:** Shows "12 x 1" (old len x 1) instead of actual shape dimensions
**Fix needed:** Update dimension calculation to use shape width/height for multi-segment

#### 3. Click to Select
**Issue:** Unknown if click detection works for all segments
**Test needed:** Verify `inVicinity()` works for multi-segment lines

#### 4. Move Behavior
**Issue:** Unknown if moving the selected line works correctly
**Test needed:** Verify drag-to-move updates all points correctly

#### 5. Edit Handles
**Open question:** What should editing behavior be?

Options:
- A) Show edit handles at each point, allow dragging to reshape
- B) Only allow moving whole line, no reshaping after creation
- C) Show handles at endpoints only, middle points fixed
- D) Allow adding/removing points after creation

**Decision needed before implementing**

#### 6. Copy/Paste
**Issue:** Unknown if copy/paste preserves points array
**Test needed:** Verify serialization/deserialization

#### 7. Undo/Redo
**Issue:** Unknown if undo/redo works with multi-segment
**Test needed:** Verify state management

#### 8. Export to Text
**Issue:** Unknown if text export works correctly
**Test needed:** Verify shape is exported properly

### Technical Debt

1. Element still has old `len` and `direction` properties alongside `points`
   - Should clean these up or handle both formats for backward compatibility
   
2. `getWidth()` and `getHeight()` check for `points` with `(element as any).points`
   - Should properly type multi-segment lines

3. Finalization code duplicated in Canvas.tsx for ESC and double-click
   - Should extract to shared function

4. Duplicate point detection happens in onPointerDown
   - Could be cleaner

### Future Enhancements

- Backspace to remove last point during drawing
- Show point count or distance while drawing
- Snap to existing line endpoints
- Convert single-segment to multi-segment
- Smooth curves between points (optional)
