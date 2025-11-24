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

```typescript
export function line(points: Point[]): Shape {
  if (points.length < 2) return [[]];
  
  if (points.length === 2) {
    // Single segment - current Bresenham algorithm
    return lineSegment(points[0], points[1]);
  }
  
  // Multi-segment
  let result: Shape = [[]];
  
  for (let i = 0; i < points.length - 1; i++) {
    const segment = lineSegment(points[i], points[i + 1]);
    result = mergeShapes(result, segment);
    
    // Add corner character at intermediate points
    if (i > 0 && i < points.length - 1) {
      const corner = getCornerChar(points[i - 1], points[i], points[i + 1]);
      result = placeCharAt(result, points[i], corner);
    }
  }
  
  return result;
}

function getCornerChar(prev: Point, current: Point, next: Point): string {
  // Calculate direction from prev to current
  const fromDir = getDirection(prev, current);
  // Calculate direction from current to next
  const toDir = getDirection(current, next);
  
  // Return appropriate corner character
  if (fromDir === LEFT && toDir === DOWN) return '┐';
  if (fromDir === UP && toDir === RIGHT) return '└';
  if (fromDir === RIGHT && toDir === UP) return '┘';
  if (fromDir === DOWN && toDir === LEFT) return '┌';
  // ... handle all 8 combinations
}
```

**For arrows:** Same as line but add arrowhead at last segment.

### 3. Update DrawingMode

**File:** `apps/web/src/editor/modes/drawing.ts`

```typescript
onPointerDown: (e, mouseMove) => {
  const { interactionMode } = useStore.getState();
  if (interactionMode.type !== 'drawing') return;

  // Handle Line/Arrow multi-segment
  if (interactionMode.element.type === ElementType.Line || 
      interactionMode.element.type === ElementType.Arrow) {
    
    // Only add points in pending mode (click-move-click)
    if (interactionMode.stage === 'pending') {
      const newPoint = {
        x: clipToScale(e.clientX, X_SCALE),
        y: clipToScale(e.clientY, Y_SCALE)
      };
      
      const updatedElement = {
        ...interactionMode.element,
        points: [...interactionMode.element.points, newPoint]
      };
      
      useStore.setState({
        interactionMode: {
          ...interactionMode,
          element: updatedElement
        }
      });
      return;
    }
  }

  // Other element types (Rectangle) - current behavior
  if (interactionMode.stage === 'pending') {
    // Finalize
    actions.addElement(sanitizeElement(interactionMode.element), false);
    // ...
  }
}

onPointerMove: (e, mouseMove) => {
  // If Line/Arrow in pending mode, show preview with temporary point
  if ((element.type === Line || element.type === Arrow) && 
      stage === 'pending') {
    const previewPoint = { x: clipToScale(e.clientX, X_SCALE), y: ... };
    const previewElement = {
      ...element,
      points: [...element.points, previewPoint]
    };
    // Update preview
  }
  
  // Current behavior for active stage (drag)
}
```

### 4. Finalization

**Double-click detection:**
```typescript
// In Canvas.tsx handleClick
if (e.detail === 2 && interactionMode.type === 'drawing') {
  if (interactionMode.element.type === Line || Arrow) {
    // Finalize multi-segment line/arrow
    actions.addElement(sanitizeElement(interactionMode.element), false);
    useStore.setState({ interactionMode: { type: 'idle' } });
  }
}
```

**ESC key:**
```typescript
// In Canvas.tsx handleKeyDown
if (e.key === 'Escape' && interactionMode.type === 'drawing') {
  if (interactionMode.element.type === Line || Arrow) {
    // Finalize if at least 2 points
    if (interactionMode.element.points.length >= 2) {
      actions.addElement(sanitizeElement(interactionMode.element), false);
    }
    useStore.setState({ interactionMode: { type: 'idle' } });
  }
}
```

### 5. Optional: Backspace to Remove Last Point

```typescript
if (e.key === 'Backspace' && interactionMode.type === 'drawing') {
  if (interactionMode.element.points.length > 1) {
    const updatedElement = {
      ...interactionMode.element,
      points: interactionMode.element.points.slice(0, -1)
    };
    useStore.setState({
      interactionMode: { ...interactionMode, element: updatedElement }
    });
  }
}
```

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

- Existing Line/Arrow elements with `x1,y1,x2,y2` need migration to `points: [{x: x1, y: y1}, {x: x2, y: y2}]`
- Or handle both formats in geometry generation for backward compatibility
- Draft state already syncs with interactionMode, so no changes needed there

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
