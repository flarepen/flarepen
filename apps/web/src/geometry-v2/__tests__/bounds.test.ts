import { describe, it, expect } from 'vitest';
import { boundsOfShape, boundsOfCells, boundsOfPositionedShapes, mergeBounds } from '../bounds';
import { rendered } from '../types';

describe('boundsOfShape', () => {
  it('calculates bounds from rendered shape', () => {
    const shape = rendered(['──┐', '  │', '──┘'], 3, 3);
    const origin = { col: 10, row: 20 };
    
    const bounds = boundsOfShape(shape, origin);
    
    expect(bounds).toEqual({
      origin: { col: 10, row: 20 },
      width: 3,
      height: 3,
    });
  });

  it('handles empty shape', () => {
    const shape = rendered([''], 0, 0);
    const bounds = boundsOfShape(shape, { col: 0, row: 0 });
    
    expect(bounds).toEqual({
      origin: { col: 0, row: 0 },
      width: 0,
      height: 0,
    });
  });
});

describe('boundsOfCells', () => {
  it('calculates bounds from cells', () => {
    const cells = [
      { col: 10, row: 20 },
      { col: 25, row: 20 },
      { col: 25, row: 35 },
    ];
    
    const bounds = boundsOfCells(cells);
    
    expect(bounds).toEqual({
      origin: { col: 10, row: 20 },
      width: 16,
      height: 16,
    });
  });

  it('handles single cell', () => {
    const bounds = boundsOfCells([{ col: 10, row: 20 }]);
    
    expect(bounds).toEqual({
      origin: { col: 10, row: 20 },
      width: 1,
      height: 1,
    });
  });

  it('handles empty cells array', () => {
    const bounds = boundsOfCells([]);
    
    expect(bounds).toEqual({
      origin: { col: 0, row: 0 },
      width: 0,
      height: 0,
    });
  });
});

describe('boundsOfPositionedShapes', () => {
  it('calculates bounds from positioned shapes', () => {
    const shapes = [
      {
        shape: rendered(['┌─┐', '└─┘'], 3, 2),
        position: { col: 0, row: 0 },
      },
      {
        shape: rendered(['───'], 3, 1),
        position: { col: 5, row: 1 },
      },
    ];
    
    const bounds = boundsOfPositionedShapes(shapes);
    
    expect(bounds).toEqual({
      origin: { col: 0, row: 0 },
      width: 8,
      height: 2,
    });
  });

  it('handles single shape', () => {
    const shapes = [
      {
        shape: rendered(['┌─┐', '└─┘'], 3, 2),
        position: { col: 5, row: 10 },
      },
    ];
    
    const bounds = boundsOfPositionedShapes(shapes);
    
    expect(bounds).toEqual({
      origin: { col: 5, row: 10 },
      width: 3,
      height: 2,
    });
  });

  it('handles empty shapes array', () => {
    const bounds = boundsOfPositionedShapes([]);
    
    expect(bounds).toEqual({
      origin: { col: 0, row: 0 },
      width: 0,
      height: 0,
    });
  });
});

describe('mergeBounds', () => {
  it('merges multiple bounds', () => {
    const bounds = [
      { origin: { col: 0, row: 0 }, width: 5, height: 3 },
      { origin: { col: 10, row: 5 }, width: 3, height: 2 },
    ];
    
    const merged = mergeBounds(bounds);
    
    expect(merged).toEqual({
      origin: { col: 0, row: 0 },
      width: 13,
      height: 7,
    });
  });

  it('handles single bounds', () => {
    const bounds = [{ origin: { col: 10, row: 20 }, width: 5, height: 3 }];
    
    const merged = mergeBounds(bounds);
    
    expect(merged).toEqual({
      origin: { col: 10, row: 20 },
      width: 5,
      height: 3,
    });
  });

  it('handles empty bounds array', () => {
    const merged = mergeBounds([]);
    
    expect(merged).toEqual({
      origin: { col: 0, row: 0 },
      width: 0,
      height: 0,
    });
  });
});
