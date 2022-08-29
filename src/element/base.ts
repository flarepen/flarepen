import { X_SCALE, Y_SCALE } from '../constants';

// TODO: Use it instead of x,y in other places
export interface Point {
  x: number;
  y: number;
}

export function point(x: number, y: number): Point {
  return { x, y };
}

export interface IBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ElementCommons {
  id: number;
  x: number;
  y: number;
  shape: string[];
}

export enum ElementType {
  Rectangle = 'rectangle',
  Line = 'line',
  Arrow = 'arrow',
  Text = 'text,',
}

export function getLinearBounding(
  origin: Point,
  len: number,
  horizontal: boolean
): { xMin: number; xMax: number; yMin: number; yMax: number } {
  const xMin = origin.x - X_SCALE;
  const xMax = horizontal ? origin.x + X_SCALE + len * X_SCALE : origin.x + X_SCALE;
  const yMin = origin.y - Y_SCALE;
  const yMax = horizontal ? origin.y + Y_SCALE : origin.y + Y_SCALE + len * Y_SCALE;

  return { xMin, xMax, yMin, yMax };
}

export interface ElementUtils<T extends ElementCommons> {
  new: (x: number, y: number) => T;
  outlineBounds: (t: T) => IBounds;
}
