# Adding Tests During Refactoring

## Strategy: Test-Driven Refactoring

Write tests FIRST for current behavior, then refactor. Tests ensure no regressions.

```
1. Write tests for current behavior
2. Refactor code
3. Tests should still pass
4. Add new tests for new functionality
```

## Phase-by-Phase Testing

### Phase 1: Renderer Layer Tests

**Before implementing renderers, write tests:**

```typescript
// __tests__/unit/renderers/line.test.ts
describe('LineRenderer', () => {
  it('generates shape from points', () => {
    const renderer = new LineRenderer();
    const data = { 
      type: 'line', 
      points: [{ x: 0, y: 0 }, { x: 130, y: 0 }]
    };
    
    const { shape, bounds } = renderer.generate(data, { x: 0, y: 0 });
    
    expect(shape).toEqual(['──────────']);
    expect(bounds).toEqual({ x: 0, y: 0, width: 10, height: 1 });
  });
  
  it('generates multi-segment shape', () => {
    const renderer = new LineRenderer();
    const data = { 
      type: 'line', 
      points: [
        { x: 0, y: 0 },
        { x: 130, y: 0 },
        { x: 130, y: 60 }
      ]
    };
    
    const { shape, bounds } = renderer.generate(data, { x: 0, y: 0 });
    
    expect(shape).toEqual([
      '──────────┐',
      '          │',
      '          │'
    ]);
  });
  
  it('snaps preview to dominant direction', () => {
    const renderer = new LineRenderer();
    const element = {
      id: 'e1',
      type: ElementType.Line,
      x: 0, y: 0,
      shape: [''],
      data: { type: 'line', points: [{ x: 0, y: 0 }] }
    };
    
    const mouseMove = { 
      currentEvent: { clientX: 130, clientY: 5 }  // Mostly horizontal
    };
    
    const preview = renderer.preview(element, mouseMove);
    
    // Should snap to horizontal (y locked to 0)
    expect(preview.data.points[1].y).toBe(0);
  });
  
  it('calculates bounds from shape', () => {
    const renderer = new LineRenderer();
    const shape = ['──┐', '  │', '──┘'];
    
    const bounds = renderer.bounds(shape, { x: 100, y: 200 });
    
    expect(bounds).toEqual({
      x: 100,
      y: 200,
      width: 3,
      height: 3
    });
  });
});

// __tests__/unit/renderers/rectangle.test.ts
describe('RectangleRenderer', () => {
  it('generates rectangle shape', () => {
    const renderer = new RectangleRenderer();
    const data = { type: 'rectangle', width: 5, height: 3 };
    
    const { shape, bounds } = renderer.generate(data, { x: 0, y: 0 });
    
    expect(shape).toEqual([
      '┌───┐',
      '│   │',
      '└───┘'
    ]);
  });
  
  it('handles zero dimensions', () => {
    const renderer = new RectangleRenderer();
    const data = { type: 'rectangle', width: 0, height: 0 };
    
    const { shape } = renderer.generate(data, { x: 0, y: 0 });
    
    expect(shape).toEqual(['']);
  });
});
```

### Phase 2: Geometry Layer Tests

**Test pure geometry functions in isolation:**

```typescript
// __tests__/unit/geometry/shapes/polyline.test.ts
describe('polyline', () => {
  it('creates single segment', () => {
    const points = [{ x: 0, y: 0 }, { x: 130, y: 0 }];
    const shape = g.polyline(points);
    
    expect(shape).toEqual(['──────────']);
  });
  
  it('creates L-shape with corner', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 130, y: 0 },
      { x: 130, y: 60 }
    ];
    const shape = g.polyline(points);
    
    expect(shape[0]).toContain('┐');  // Top-right corner
    expect(shape[1]).toContain('│');  // Vertical line
  });
  
  it('snaps near-vertical to vertical', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 13, y: 60 }  // 1 cell off, should snap
    ];
    const shape = g.polyline(points);
    
    // All rows should have vertical line in first column
    expect(shape.every(row => row[0] === '│')).toBe(true);
  });
  
  it('handles empty points', () => {
    const shape = g.polyline([]);
    expect(shape).toEqual([[]]);
  });
  
  it('handles single point', () => {
    const shape = g.polyline([{ x: 0, y: 0 }]);
    expect(shape).toEqual([[]]);
  });
});

// __tests__/unit/geometry/shapes/rectangle.test.ts
describe('rectangle', () => {
  it('creates rectangle', () => {
    const shape = g.rectangle(5, 3);
    
    expect(shape).toEqual([
      '┌───┐',
      '│   │',
      '└───┘'
    ]);
  });
  
  it('creates 1x1 rectangle', () => {
    const shape = g.rectangle(1, 1);
    expect(shape).toEqual(['┌┐']);
  });
});

// __tests__/unit/geometry/bounds/calculate.test.ts
describe('shapeBounds', () => {
  it('calculates bounds from shape', () => {
    const shape = ['──┐', '  │', '──┘'];
    const bounds = g.shapeBounds(shape, { x: 100, y: 200 });
    
    expect(bounds).toEqual({
      x: 100,
      y: 200,
      width: 3,
      height: 3
    });
  });
  
  it('handles empty shape', () => {
    const bounds = g.shapeBounds([''], { x: 0, y: 0 });
    expect(bounds.width).toBe(0);
    expect(bounds.height).toBe(1);
  });
});

describe('pointsBounds', () => {
  it('calculates bounds from points', () => {
    const points = [
      { x: 100, y: 200 },
      { x: 250, y: 200 },
      { x: 250, y: 350 }
    ];
    
    const bounds = g.pointsBounds(points);
    
    expect(bounds.x).toBe(100);
    expect(bounds.y).toBe(200);
    expect(bounds.width).toBeGreaterThan(0);
    expect(bounds.height).toBeGreaterThan(0);
  });
});

// __tests__/unit/geometry/grid/corners.test.ts
describe('getCornerChar', () => {
  it('returns top-right corner', () => {
    const prev = { x: 0, y: 0 };
    const current = { x: 130, y: 0 };
    const next = { x: 130, y: 60 };
    
    const corner = g.getCornerChar(prev, current, next);
    expect(corner).toBe('┐');
  });
  
  it('returns bottom-left corner', () => {
    const prev = { x: 130, y: 0 };
    const current = { x: 130, y: 60 };
    const next = { x: 0, y: 60 };
    
    const corner = g.getCornerChar(prev, current, next);
    expect(corner).toBe('┘');
  });
});
```

### Phase 3: Scene Merge Tests

**Test merge() without type coupling:**

```typescript
// __tests__/unit/geometry/scene.test.ts
describe('merge', () => {
  it('merges single element', () => {
    const elements = [{
      id: 'e1',
      type: ElementType.Rectangle,
      x: 0, y: 0,
      shape: ['┌─┐', '└─┘'],
      data: { type: 'rectangle', width: 3, height: 2 }
    }];
    
    const merged = g.merge(elements);
    
    expect(merged.origin).toEqual({ x: 0, y: 0 });
    expect(merged.content).toEqual([
      ['┌', '─', '┐'],
      ['└', '─', '┘']
    ]);
  });
  
  it('merges multiple elements', () => {
    const elements = [
      {
        id: 'e1',
        type: ElementType.Rectangle,
        x: 0, y: 0,
        shape: ['┌─┐', '└─┘'],
        data: { type: 'rectangle', width: 3, height: 2 }
      },
      {
        id: 'e2',
        type: ElementType.Line,
        x: 50, y: 0,
        shape: ['───'],
        data: { type: 'line', points: [...] }
      }
    ];
    
    const merged = g.merge(elements);
    
    expect(merged.origin).toEqual({ x: 0, y: 0 });
    expect(merged.content[0]).toContain('┌');
    expect(merged.content[0]).toContain('─');
  });
  
  it('handles overlapping elements', () => {
    // Later element overwrites earlier
    const elements = [
      { 
        id: 'e1', 
        type: ElementType.Text,
        x: 0, y: 0, 
        shape: ['AAA'],
        data: { type: 'text', content: 'AAA' }
      },
      { 
        id: 'e2', 
        type: ElementType.Text,
        x: 13, y: 0, 
        shape: ['BBB'],
        data: { type: 'text', content: 'BBB' }
      }
    ];
    
    const merged = g.merge(elements);
    expect(merged.content[0].join('')).toBe('ABBB');
  });
  
  it('handles empty elements array', () => {
    const merged = g.merge([]);
    expect(merged.content).toEqual([[]]);
  });
  
  it('calculates correct scene bounds', () => {
    const elements = [
      { id: 'e1', x: 100, y: 200, shape: ['──'], data: {} },
      { id: 'e2', x: 300, y: 400, shape: ['──'], data: {} }
    ];
    
    const merged = g.merge(elements);
    
    expect(merged.origin.x).toBe(100);
    expect(merged.origin.y).toBe(200);
  });
});

describe('calculateSceneBounds', () => {
  it('calculates bounds from multiple elements', () => {
    const elements = [
      { id: 'e1', x: 0, y: 0, shape: ['───'], data: {} },
      { id: 'e2', x: 100, y: 50, shape: ['──'], data: {} }
    ];
    
    const bounds = g.calculateSceneBounds(elements);
    
    expect(bounds.x).toBe(0);
    expect(bounds.y).toBe(0);
    expect(bounds.width).toBeGreaterThan(0);
    expect(bounds.height).toBeGreaterThan(0);
  });
});
```

### Phase 4: Integration Tests

**Test full drawing workflows:**

```typescript
// __tests__/integration/multi-segment-line.test.tsx
describe('Multi-segment line drawing', () => {
  it('creates line with multiple clicks', async () => {
    const { canvas, store } = renderCanvas();
    
    // Select line tool
    store.getState().setTool(Tool.Line);
    
    // Click 1
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(canvas);
    
    // Click 2
    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 100 });
    fireEvent.pointerUp(canvas);
    
    // Click 3
    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 200 });
    fireEvent.pointerUp(canvas);
    
    // ESC to finalize
    fireEvent.keyDown(canvas, { key: 'Escape' });
    
    await waitFor(() => {
      const elements = Object.values(store.getState().elements);
      expect(elements).toHaveLength(1);
      expect(elements[0].data.points).toHaveLength(3);
      expect(elements[0].shape.join('')).toContain('┐');  // Has corner
    });
  });
  
  it('finalizes on double-click', async () => {
    const { canvas, store } = renderCanvas();
    store.getState().setTool(Tool.Line);
    
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(canvas);
    
    fireEvent.pointerDown(canvas, { clientX: 200, clientY: 100 });
    fireEvent.pointerUp(canvas);
    
    // Double-click
    fireEvent.click(canvas, { clientX: 200, clientY: 200, detail: 2 });
    
    await waitFor(() => {
      expect(Object.keys(store.getState().elements)).toHaveLength(1);
    });
  });
  
  it('shows preview while moving', async () => {
    const { canvas, store } = renderCanvas();
    store.getState().setTool(Tool.Line);
    
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(canvas);
    
    fireEvent.pointerMove(canvas, { clientX: 200, clientY: 105 });
    
    // Should have draft with snapped preview
    const draft = store.getState().draft;
    expect(draft).toBeDefined();
    expect(draft.element.shape.length).toBeGreaterThan(0);
  });
  
  it('skips duplicate points', async () => {
    const { canvas, store } = renderCanvas();
    store.getState().setTool(Tool.Line);
    
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(canvas);
    
    // Click same point twice
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(canvas);
    
    fireEvent.keyDown(canvas, { key: 'Escape' });
    
    await waitFor(() => {
      const elements = Object.values(store.getState().elements);
      // Should not create element (need at least 2 different points)
      expect(elements).toHaveLength(0);
    });
  });
});

// __tests__/integration/selection.test.tsx
describe('Element selection', () => {
  it('selects multi-segment line', async () => {
    const line = {
      id: 'e1',
      type: ElementType.Line,
      x: 100, y: 100,
      shape: ['──┐', '  │', '──┘'],
      data: { 
        type: 'line', 
        points: [
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 }
        ]
      }
    };
    
    const { canvas, store } = renderCanvas([line]);
    
    // Click on line
    fireEvent.click(canvas, { clientX: 150, clientY: 100 });
    
    expect(store.getState().selectedIds).toContain('e1');
  });
  
  it('shows correct bounds for multi-segment line', () => {
    const line = {
      id: 'e1',
      type: ElementType.Line,
      x: 100, y: 100,
      shape: ['──┐', '  │', '──┘'],
      data: { type: 'line', points: [...] }
    };
    
    const renderer = rendererFor(line);
    const bounds = renderer.bounds(line.shape, { x: line.x, y: line.y });
    
    expect(bounds.width).toBe(3);
    expect(bounds.height).toBe(3);
  });
});
```

## Parallel Testing Timeline

### Week 1: Setup + Geometry Tests
**Goal:** Test infrastructure + geometry layer

- Install vitest dependencies
- Setup test helpers and fixtures
- Write geometry unit tests (polyline, bounds, corners)
- **Target:** 20 tests, 40% geometry coverage

```bash
yarn add -D vitest @vitest/ui @vitest/coverage-v8
yarn add -D @testing-library/react @testing-library/user-event
yarn add -D vitest-canvas-mock jsdom
```

### Week 2: Renderer Tests + Phase 1 Refactor
**Goal:** Validate renderer behavior

- Write renderer tests for all element types
- Implement renderer classes
- Tests validate renderer behavior matches current
- **Target:** 30 tests, 50% element coverage

### Week 3: Integration Tests + Phase 2-3 Refactor
**Goal:** Ensure no regressions

- Write canvas interaction tests
- Refactor geometry layer
- Tests ensure behavior unchanged
- **Target:** 45 tests, 60% overall coverage

### Week 4: E2E + Phase 4-5 Refactor
**Goal:** Complete refactoring with confidence

- Write full workflow tests
- Complete refactoring phases
- All tests passing
- **Target:** 60+ tests, 70% coverage

## Test-First Workflow

```bash
# 1. Write test for new feature
yarn test:watch

# 2. Test fails (red)
# 3. Implement feature
# 4. Test passes (green)
# 5. Refactor
# 6. Test still passes
```

## Test Helpers

```typescript
// __tests__/helpers/render.tsx
export const renderCanvas = (elements = [], initialState = {}) => {
  const store = createStore({
    elements: elements.reduce((acc, el) => ({ ...acc, [el.id]: el }), {}),
    ...initialState
  });
  
  const { container } = render(
    <Provider store={store}>
      <Canvas />
    </Provider>
  );
  
  const canvas = container.querySelector('canvas');
  
  return { canvas, store, container };
};

// __tests__/helpers/fixtures.ts
export const createLine = (overrides = {}) => ({
  id: 'l1',
  type: ElementType.Line,
  x: 0,
  y: 0,
  shape: ['───'],
  data: {
    type: 'line',
    points: [{ x: 0, y: 0 }, { x: 39, y: 0 }]
  },
  labelEnabled: false,
  ...overrides
});

export const createMultiSegmentLine = () => ({
  id: 'l1',
  type: ElementType.Line,
  x: 0,
  y: 0,
  shape: ['──┐', '  │', '──┘'],
  data: {
    type: 'line',
    points: [
      { x: 0, y: 0 },
      { x: 26, y: 0 },
      { x: 26, y: 40 },
      { x: 0, y: 40 }
    ]
  },
  labelEnabled: false
});
```

## Coverage Goals

- **Phase 1:** 30% coverage (geometry + renderers)
- **Phase 2:** 50% coverage (element creation)
- **Phase 3:** 70% coverage (interactions)
- **Phase 4:** 80% coverage (full workflows)

Focus on critical paths:
- Element creation
- Multi-segment drawing
- Selection
- Undo/redo
- Export

## Benefits

1. **Confidence:** Refactor without fear of breaking things
2. **Documentation:** Tests show how code should work
3. **Regression prevention:** Catch bugs early
4. **Design feedback:** Hard to test = bad design
5. **Faster development:** Less manual testing

## Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```
