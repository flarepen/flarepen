import { X_SCALE, Y_SCALE } from '../constants';
import { IMouseMove } from '../types';

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

export function inLinearVicinity(
  p: Point,
  origin: Point,
  len: number,
  horizontal: boolean
): boolean {
  const { xMin, xMax, yMin, yMax } = getLinearBounding(origin, len, horizontal);

  return p.x >= xMin && p.x <= xMax && p.y >= yMin && p.y <= yMax;
}

// TODO: Change to class?
export interface ElementUtils<T extends ElementCommons> {
  new: (x: number, y: number) => T;
  outlineBounds: (t: T) => IBounds;
  inVicinity: (t: T, p: Point) => boolean;
  moveToEdit: (t: T, mouseMove: IMouseMove, callback: (updated: T) => void) => void;
  drag: (
    t: T,
    mouseMove: IMouseMove,
    updateElement: (id: number, update: (element: T) => void) => void
  ) => void;
}

export function defaultDrag<T extends ElementCommons>(
  t: T,
  mouseMove: IMouseMove,
  updateElement: (id: number, update: (t: T) => void) => void
) {
  const x =
    t.x +
    mouseMove.currentEvent!.clientX -
    (mouseMove.previousEvent ? mouseMove.previousEvent.clientX : 0);
  const y =
    t.y +
    mouseMove.currentEvent!.clientY -
    (mouseMove.previousEvent ? mouseMove.previousEvent.clientY : 0);

  updateElement(t.id, (element) => {
    element.x = x;
    element.y = y;
  });
}
