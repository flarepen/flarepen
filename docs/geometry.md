# Geometry System

The geometry system generates ASCII shapes and combines them into scenes for rendering on canvas.

## Core Concepts

### Point
A position in pixel coordinates:
```typescript
{ x: 100, y: 200 }  // 100 pixels from left, 200 pixels from top
```

### RenderedRows
ASCII shape as an array of strings:
```typescript
[
  '┌───┐',
  '│   │',
  '└───┘'
]  // A rectangle
```

Each string is one row of characters. This is the output of all shape generation functions.

### PositionedRows
A shape with its position in the scene:
```typescript
{
  rows: [
    '┌───┐',
    '│   │',
    '└───┘'
  ],
  position: { x: 100, y: 200 }
}
```

### Scene
The final combined output of all positioned shapes:
```typescript
{
  origin: { x: 0, y: 0 },      // Top-left corner of scene
  content: [                    // 2D grid of characters
    ['┌', '─', '┐', ' ', '─', '─', '▶'],
    ['└', '─', '┘', ' ', ' ', ' ', ' ']
  ]
}
```

### Bounds
Bounding box for a shape or set of points:
```typescript
{
  origin: { x: 100, y: 200 },  // Top-left corner in pixels
  width: 5,                     // Width in grid cells
  height: 3                     // Height in grid cells
}
```

## Grid System

The canvas uses a character grid where each cell has fixed dimensions:
- **X_SCALE**: 13 pixels per cell width
- **Y_SCALE**: 20 pixels per cell height

```
Pixel coordinates → Grid coordinates:
  (130, 60) → (10, 3)
  
Grid coordinates → Pixel coordinates:
  (10, 3) → (130, 60)
```

## Architecture

```
┌─────────────────────────────────────────────┐
│  Shape Generation (shapes.ts)               │
│  - rectangle(width, height, borderType)     │
│  - line(len, horizontal)                    │
│  - arrow(len, direction)                    │
│  - text(content)                            │
│  - polyline(points)                         │
│  - polyarrow(points, startArrow, endArrow)  │
│                                             │
│  Input: dimensions/points                   │
│  Output: RenderedRows                       │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Bounds Calculation (bounds.ts)             │
│  - boundsOfRenderedRows(rows, origin)       │
│  - boundsOfPoints(points)                   │
│  - mergeBounds(bounds[])                    │
│                                             │
│  Input: shapes or points                    │
│  Output: Bounds                             │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Scene Building (scene.ts)                  │
│  - buildScene(positionedRows[])             │
│                                             │
│  Input: PositionedRows[]                    │
│  Output: Scene                              │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Canvas Rendering (draw.ts)                 │
│  - Draws Scene to HTML canvas               │
└─────────────────────────────────────────────┘
```

## Shape Generation Examples

### Rectangle
```typescript
rectangle(5, 3, BorderType.Normal)
// Returns:
[
  '┌───┐',
  '│   │',
  '└───┘'
]

rectangle(8, 3, BorderType.Double, 'Button')
// Returns:
[
  '╔Button═╗',
  '║       ║',
  '╚═══════╝'
]
```

### Line
```typescript
line(5, true)   // Horizontal
// Returns:
['─────']

line(3, false)  // Vertical
// Returns:
[
  '│',
  '│',
  '│'
]
```

### Arrow
```typescript
arrow(5, LinearDirection.Right)
// Returns: 
['────▶']

arrow(3, LinearDirection.Down)
// Returns:
[
  '│',
  '│',
  '▼'
]
```

### Polyline
Multi-segment line with automatic corner detection:

```typescript
polyline([
  { x: 0, y: 0 },
  { x: 130, y: 0 },   // Right
  { x: 130, y: 60 }   // Down
])
// Returns:
[
  '──────────┐',
  '          │',
  '          │',
  '          │'
]
```

Corner characters are automatically placed at junction points:
- `┐` top-right
- `┘` bottom-right
- `┌` top-left
- `└` bottom-left


### Polyarrow
Multi-segment arrow with optional start/end arrowheads:

```typescript
// End arrow only (default)
polyarrow([
  { x: 0, y: 0 },
  { x: 130, y: 0 },
  { x: 130, y: 60 }
])
// Returns:
[
  '──────────┐',
  '          │',
  '          │',
  '          ▼'
]

// Both arrows
polyarrow([...], true, true)
// Returns:
[
  '◀─────────┐',
  '          │',
  '          │',
  '          ▼'
]
```

Arrow direction follows point order:
```
[{x:0,y:0}, {x:130,y:0}, {x:130,y:60}]
     ↓          ↓            ↓
   start   →  right    →   down
```

## Scene Building

Combining multiple shapes into one scene:

```typescript
const positioned = [
  {
    rows: [
      '┌─────┐',
      '│ Box │',
      '└─────┘'
    ],
    position: { x: 0, y: 0 }
  },
  {
    rows: ['────▶'],
    position: { x: 104, y: 20 }
  },
  {
    rows: [
      '┌─────┐',
      '│ Box │',
      '└─────┘'
    ],
    position: { x: 182, y: 0 }
  }
];

buildScene(positioned)
// Returns Scene:
{
  origin: { x: 0, y: 0 },
  content: [
    ['┌','─','─','─','─','─','┐',' ',' ','┌','─','─','─','─','─','┐'],
    ['│',' ','B','o','x',' ','│','─','▶','│',' ','B','o','x',' ','│'],
    ['└','─','─','─','─','─','┘',' ',' ','└','─','─','─','─','─','┘']
  ]
}
```

The scene building process:
1. Calculate bounding box from all positioned rows
2. Create empty grid with calculated dimensions
3. Write each shape to grid at its position
4. Later shapes overwrite earlier ones at overlapping positions

## Scale Utilities

Helper functions for coordinate conversion:

```typescript
// Convert point to grid coordinates
pointToGrid({ x: 130, y: 60 }, { x: 0, y: 0 })
// Returns: { x: 10, y: 3 }

// Convert pixel deltas to grid dimensions
pixelDeltaToGridWidth(130)   // Returns: 10
pixelDeltaToGridHeight(60)   // Returns: 3

// Check movement direction
isHorizontalMovement(130, 20)  // Returns: true (more horizontal)
isHorizontalMovement(20, 60)   // Returns: false (more vertical)
```

## Polyline Implementation

Multi-segment lines are built using a grid-based approach:

1. **Calculate bounds** from all points
2. **Create empty grid** with calculated dimensions
3. **Draw segments**:
   - Convert points to grid coordinates
   - For each segment, determine if horizontal or vertical
   - Draw line characters (`─` or `│`) on grid
4. **Place corners** at junction points:
   - Analyze direction change at each middle point
   - Select appropriate corner character
5. **Convert grid to rows**

Example flow:
```
Points: [{x:0,y:0}, {x:130,y:0}, {x:130,y:60}]
         ↓
Bounds: {origin: {x:0,y:0}, width: 11, height: 4}
         ↓
Grid: 11×4 empty grid filled with spaces
         ↓
Draw segments:
  - (0,0) → (10,0): horizontal line
  - (10,0) → (10,3): vertical line
         ↓
Place corner at (10,0):
  - Coming from left, going down → '┐'
         ↓
Result:
[
  '──────────┐',
  '          │',
  '          │',
  '          │'
]
```

## Design Principles

1. **Pure functions**: All shape generation is pure - same input always produces same output
2. **No element coupling**: Geometry functions don't know about Element types
3. **Composable**: Small functions combine to build complex shapes
4. **Testable**: Each function can be tested in isolation
5. **Type-safe**: Strong typing prevents errors

## Adding New Shapes

To add a new shape:

1. Create generation function in `shapes.ts`:
```typescript
export function diamond(size: number): RenderedRows {
  // Generate diamond pattern
  return rows;
}
```

2. Add tests in `__tests__/shapes.test.ts`:
```typescript
describe('diamond', () => {
  it('creates diamond shape', () => {
    expect(diamond(3)).toEqual([
      '  ▲  ',
      ' ◀ ▶ ',
      '  ▼  '
    ]);
  });
});
```

3. Export from `shapes.ts` - done!

No changes needed to scene building, bounds calculation, or rendering.
