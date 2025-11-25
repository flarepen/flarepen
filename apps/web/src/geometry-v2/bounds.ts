/**
 * Bounds Calculation
 * 
 * Functions to calculate bounding boxes for various geometry primitives.
 */

import { RenderedShape, GridCell, GridBounds, PositionedShape } from './types';

/**
 * Calculate bounds from rendered shape
 */
export function boundsOfShape(shape: RenderedShape, origin: GridCell): GridBounds {
  return {
    origin,
    width: shape.width,
    height: shape.height,
  };
}

/**
 * Calculate bounds from array of grid cells
 */
export function boundsOfCells(cells: GridCell[]): GridBounds {
  if (cells.length === 0) {
    return { origin: { col: 0, row: 0 }, width: 0, height: 0 };
  }

  const minCol = Math.min(...cells.map(c => c.col));
  const minRow = Math.min(...cells.map(c => c.row));
  const maxCol = Math.max(...cells.map(c => c.col));
  const maxRow = Math.max(...cells.map(c => c.row));
  
  return {
    origin: { col: minCol, row: minRow },
    width: maxCol - minCol + 1,
    height: maxRow - minRow + 1,
  };
}

/**
 * Calculate bounds of multiple positioned shapes
 */
export function boundsOfPositionedShapes(shapes: PositionedShape[]): GridBounds {
  if (shapes.length === 0) {
    return { origin: { col: 0, row: 0 }, width: 0, height: 0 };
  }

  const minCol = Math.min(...shapes.map(ps => ps.position.col));
  const minRow = Math.min(...shapes.map(ps => ps.position.row));
  const maxCol = Math.max(...shapes.map(ps => ps.position.col + ps.shape.width));
  const maxRow = Math.max(...shapes.map(ps => ps.position.row + ps.shape.height));

  return {
    origin: { col: minCol, row: minRow },
    width: maxCol - minCol,
    height: maxRow - minRow,
  };
}

/**
 * Merge multiple bounds into a single bounding box
 */
export function mergeBounds(bounds: GridBounds[]): GridBounds {
  if (bounds.length === 0) {
    return { origin: { col: 0, row: 0 }, width: 0, height: 0 };
  }

  const minCol = Math.min(...bounds.map(b => b.origin.col));
  const minRow = Math.min(...bounds.map(b => b.origin.row));
  const maxCol = Math.max(...bounds.map(b => b.origin.col + b.width));
  const maxRow = Math.max(...bounds.map(b => b.origin.row + b.height));
  
  return {
    origin: { col: minCol, row: minRow },
    width: maxCol - minCol,
    height: maxRow - minRow,
  };
}
