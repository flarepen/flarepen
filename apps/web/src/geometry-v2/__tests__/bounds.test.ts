import { describe, it, expect } from 'vitest';
import { boundsOfRenderedRows, boundsOfPoints, mergeBounds } from '../bounds';

describe('boundsOfRenderedRows', () => {
  it('calculates bounds from rendered rows', () => {
    const rows = ['──┐', '  │', '──┘'];
    const origin = { x: 100, y: 200 };
    
    const bounds = boundsOfRenderedRows(rows, origin);
    
    expect(bounds).toEqual({
      origin: { x: 100, y: 200 },
      width: 3,
      height: 3,
    });
  });

  it('handles empty rows', () => {
    const bounds = boundsOfRenderedRows([''], { x: 0, y: 0 });
    
    expect(bounds).toEqual({
      origin: { x: 0, y: 0 },
      width: 0,
      height: 1,
    });
  });

  it('handles rows with different lengths', () => {
    const rows = ['─', '───', '──'];
    
    const bounds = boundsOfRenderedRows(rows, { x: 0, y: 0 });
    
    expect(bounds.width).toBe(3);
    expect(bounds.height).toBe(3);
  });
});

describe('boundsOfPoints', () => {
  it('calculates bounds from points', () => {
    const points = [
      { x: 100, y: 200 },
      { x: 250, y: 200 },
      { x: 250, y: 350 },
    ];
    
    const bounds = boundsOfPoints(points);
    
    // x: 100 to 250 = 150 pixels = 11 cells + 1
    // y: 200 to 350 = 150 pixels = 7 cells + 1
    expect(bounds).toEqual({
      origin: { x: 100, y: 200 },
      width: 12,
      height: 8,
    });
  });

  it('handles single point', () => {
    const bounds = boundsOfPoints([{ x: 100, y: 200 }]);
    
    expect(bounds).toEqual({
      origin: { x: 100, y: 200 },
      width: 1,
      height: 1,
    });
  });

  it('handles empty points array', () => {
    const bounds = boundsOfPoints([]);
    
    expect(bounds).toEqual({
      origin: { x: 0, y: 0 },
      width: 0,
      height: 0,
    });
  });
});

describe('mergeBounds', () => {
  it('merges multiple bounds', () => {
    const bounds = [
      { origin: { x: 0, y: 0 }, width: 5, height: 3 },
      { origin: { x: 100, y: 50 }, width: 3, height: 2 },
    ];
    
    const merged = mergeBounds(bounds);
    
    // x: 0 to 100 + 3*13 = 139 pixels = 10 cells
    // y: 0 to 50 + 2*20 = 90 pixels = 4 cells
    expect(merged).toEqual({
      origin: { x: 0, y: 0 },
      width: 10,
      height: 4,
    });
  });

  it('handles single bounds', () => {
    const bounds = [{ origin: { x: 10, y: 20 }, width: 5, height: 3 }];
    
    const merged = mergeBounds(bounds);
    
    expect(merged.origin).toEqual({ x: 10, y: 20 });
  });

  it('handles empty bounds array', () => {
    const merged = mergeBounds([]);
    
    expect(merged).toEqual({
      origin: { x: 0, y: 0 },
      width: 0,
      height: 0,
    });
  });
});
