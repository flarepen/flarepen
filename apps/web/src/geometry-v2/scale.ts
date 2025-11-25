/**
 * Scale constants and utilities
 * Converts between pixel coordinates and grid cells
 */

/**
 * Width of one grid cell in pixels
 */
export const X_SCALE = 13;

/**
 * Height of one grid cell in pixels
 */
export const Y_SCALE = 20;

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
