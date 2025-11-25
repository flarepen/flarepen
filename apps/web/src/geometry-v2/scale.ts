/**
 * Scale constants and utilities
 * Converts between pixel coordinates and grid cells
 */

import { Point } from './types';

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

/**
 * Convert absolute pixel point to grid coordinates relative to origin
 */
export function pointToGrid(point: Point, origin: Point): { x: number; y: number } {
  return {
    x: Math.floor((point.x - origin.x) / X_SCALE),
    y: Math.floor((point.y - origin.y) / Y_SCALE),
  };
}

/**
 * Calculate grid width from pixel delta
 */
export function pixelDeltaToGridWidth(deltaX: number): number {
  return Math.abs(deltaX) / X_SCALE;
}

/**
 * Calculate grid height from pixel delta
 */
export function pixelDeltaToGridHeight(deltaY: number): number {
  return Math.abs(deltaY) / Y_SCALE;
}

/**
 * Determine if movement is more horizontal than vertical
 */
export function isHorizontalMovement(dx: number, dy: number): boolean {
  return Math.abs(dx) > Math.abs(dy);
}
