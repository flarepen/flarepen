/**
 * Core geometry types for FlarePen
 * Pure types with no element coupling
 */

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
 * 2D position in grid cell coordinates
 */
export interface GridCell {
  /** Column (horizontal position) */
  col: number;
  /** Row (vertical position) */
  row: number;
}

/**
 * Bounding box in grid cell coordinates
 */
export interface GridBounds {
  /** Top-left corner in grid cells */
  origin: GridCell;
  /** Width in grid cells */
  width: number;
  /** Height in grid cells */
  height: number;
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

/**
 * Rendered ASCII shape
 */
export interface RenderedShape {
  /** ASCII character rows */
  rows: string[];
  /** Width in grid cells */
  width: number;
  /** Height in grid cells */
  height: number;
}

/**
 * Helper to create a RenderedShape
 */
export function rendered(rows: string[], width: number, height: number): RenderedShape {
  return { rows, width, height };
}

/**
 * Rendered shape with position
 */
export interface PositionedShape {
  /** Rendered ASCII shape */
  shape: RenderedShape;
  /** Position in grid cells */
  position: GridCell;
}

/**
 * Merged scene - multiple positioned shapes combined into one grid
 */
export interface Scene {
  /** Top-left corner in grid cells */
  origin: GridCell;
  /** 2D grid of characters */
  content: string[][];
}
