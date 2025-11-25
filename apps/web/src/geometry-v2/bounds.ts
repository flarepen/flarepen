import { RenderedRows, Point, Bounds } from './types';
import { X_SCALE, Y_SCALE } from './scale';

/**
 * Calculate bounds from rendered rows
 */
export function boundsOfRenderedRows(rows: RenderedRows, origin: Point): Bounds {
  const width = Math.max(0, ...rows.map(row => row.length));
  const height = rows.length;
  
  return {
    origin,
    width,
    height,
  };
}

/**
 * Calculate bounds from array of points (in pixels)
 */
export function boundsOfPoints(points: Point[]): Bounds {
  if (points.length === 0) {
    return { origin: { x: 0, y: 0 }, width: 0, height: 0 };
  }

  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));
  
  return {
    origin: { x: minX, y: minY },
    width: Math.floor((maxX - minX) / X_SCALE) + 1,
    height: Math.floor((maxY - minY) / Y_SCALE) + 1,
  };
}

/**
 * Merge multiple bounds into a single bounding box
 */
export function mergeBounds(bounds: Bounds[]): Bounds {
  if (bounds.length === 0) {
    return { origin: { x: 0, y: 0 }, width: 0, height: 0 };
  }

  const minX = Math.min(...bounds.map(b => b.origin.x));
  const minY = Math.min(...bounds.map(b => b.origin.y));
  const maxX = Math.max(...bounds.map(b => b.origin.x + b.width * X_SCALE));
  const maxY = Math.max(...bounds.map(b => b.origin.y + b.height * Y_SCALE));
  
  return {
    origin: { x: minX, y: minY },
    width: Math.floor((maxX - minX) / X_SCALE),
    height: Math.floor((maxY - minY) / Y_SCALE),
  };
}
