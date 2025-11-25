/**
 * Core geometry types for FlarePen
 * Pure types with no element coupling
 */

/**
 * Rendered character rows - the visual output of shape generation
 */
export type RenderedRows = string[];

/**
 * 2D point in pixel coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Bounding box
 */
export interface Bounds {
  origin: Point;   // Top-left corner in pixels
  width: number;   // Width in grid cells
  height: number;  // Height in grid cells
}

/**
 * Rendered rows with position
 */
export interface PositionedRows {
  rows: RenderedRows;
  position: Point;
}

/**
 * Merged scene - multiple positioned rows combined into one grid
 */
export interface Scene {
  origin: Point;
  content: string[][];  // 2D grid of characters
}
