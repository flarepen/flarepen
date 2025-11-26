/**
 * Scale constants and utilities
 * Converts between pixel coordinates and grid cells
 */

import { GridCell } from './geometry-v2/types';
import { X_SCALE, Y_SCALE } from './constants';

/**
 * 2D point in pixel coordinates
 */
export interface PixelPoint {
  /** X coordinate in pixels */
  x: number;
  /** Y coordinate in pixels */
  y: number;
}

/**
 * Bounding box in pixel coordinates (for drawing)
 */
export interface PixelBounds {
  /** Top-left corner in pixels */
  origin: PixelPoint;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}

// Re-export scale constants for convenience
export { X_SCALE, Y_SCALE };

/**
 * Snap a pixel value to the nearest grid cell
 */
export function clipToScale(value: number, scale: number): number {
  return Math.floor(value / scale) * scale;
}

/**
 * Convert pixel width to grid cells
 */
export function pixelsToGridWidth(pixels: number): number {
  return Math.floor(pixels / X_SCALE);
}

/**
 * Convert pixel height to grid cells
 */
export function pixelsToGridHeight(pixels: number): number {
  return Math.floor(pixels / Y_SCALE);
}

/**
 * Convert grid cells to pixel width
 */
export function gridToPixelWidth(cells: number): number {
  return cells * X_SCALE;
}

/**
 * Convert grid cells to pixel height
 */
export function gridToPixelHeight(cells: number): number {
  return cells * Y_SCALE;
}

/**
 * Convert pixel point to grid cell
 */
export function pixelToGrid(point: PixelPoint): GridCell {
  return {
    col: Math.floor(point.x / X_SCALE),
    row: Math.floor(point.y / Y_SCALE),
  };
}

/**
 * Convert grid cell to pixel point (top-left corner of cell)
 */
export function gridToPixel(cell: GridCell): PixelPoint {
  return {
    x: cell.col * X_SCALE,
    y: cell.row * Y_SCALE,
  };
}

/**
 * Determine if movement is more horizontal than vertical
 */
export function isHorizontalMovement(dx: number, dy: number): boolean {
  return Math.abs(dx) > Math.abs(dy);
}

/**
 * Convert accumulated pixel movement to grid cell increments
 * Handles positive and negative movements correctly
 */
export function pixelDeltaToGrid(accX: number, accY: number): { widthIncr: number; heightIncr: number } {
  const widthIncr = accX > 0 ? Math.floor(accX / X_SCALE) : Math.ceil(accX / X_SCALE);
  const heightIncr = accY > 0 ? Math.floor(accY / Y_SCALE) : Math.ceil(accY / Y_SCALE);
  return { widthIncr, heightIncr };
}
