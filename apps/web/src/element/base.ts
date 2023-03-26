import { X_SCALE, Y_SCALE } from '../constants';
import { EditHandle, EditHandleType, IMouseMove } from '../types';

// TODO: Use it instead of x,y in other places
export interface Point {
  x: number;
  y: number;
}

export function point(x: number, y: number): Point {
  return { x, y };
}

export function isPointInsideBound(p: Point, bound: IBounds) {
  return (
    p.x > bound.x && p.x < bound.x + bound.width && p.y > bound.y && p.y < bound.y + bound.height
  );
}

export interface IBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function expandIBound(bound: IBounds, mouseMove: IMouseMove): IBounds {
  const widthIncr =
    mouseMove.currentEvent!.clientX -
    (mouseMove.previousEvent ? mouseMove.previousEvent.clientX : 0);
  const heightIncr =
    mouseMove.currentEvent!.clientY -
    (mouseMove.previousEvent ? mouseMove.previousEvent.clientY : 0);
  let { x, y, width, height } = bound;
  width = width + widthIncr;
  height = height + heightIncr;

  if (width < 0) {
    x = x + widthIncr;
  }

  if (height < 0) {
    y = y + heightIncr;
  }
  return {
    ...bound,
    x,
    y,
    width,
    height,
  };
}

export interface ElementCommons {
  id: string;
  x: number;
  y: number;
  shape: string[];
  label?: string;
  labelEnabled: boolean;
}

export enum ElementType {
  Rectangle = 'rectangle',
  Line = 'line',
  Arrow = 'arrow',
  Text = 'text',
}

export function getLinearBounding(
  origin: Point,
  len: number,
  horizontal: boolean
): { xMin: number; xMax: number; yMin: number; yMax: number } {
  // Y Axis needs a bit of tweaking because of grid offset
  const yOffset = Y_SCALE / 2;

  const xMin = origin.x;
  const xMax = horizontal ? origin.x + len * X_SCALE : origin.x + X_SCALE;
  const yMin = origin.y - yOffset;
  const yMax = horizontal ? origin.y + yOffset : origin.y + len * Y_SCALE - yOffset;

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
  create: (t: T, mouseMove: IMouseMove, callback: (updated: T) => void) => void;
  allEditHandles: (t: T) => EditHandle[];
  getEditHandleType: (
    t: T,
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => null | EditHandleType;
  edit: (t: T, mouseMove: IMouseMove, handleType: EditHandleType) => T;
}
