/**
 * Core geometry types for FlarePen
 * Pure grid-based types with no pixel coupling
 */

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
