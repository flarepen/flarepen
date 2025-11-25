import {
  LinearDirection,
  Element,
  ElementType,
  IBounds,
  isHorizontal,
  point,
  Point,
  Rectangle,
} from './element';
import _ from 'lodash';
import { X_SCALE, Y_SCALE } from './constants';
import { MergedElements, BorderType } from './types';
import * as g2 from './geometry-v2/shapes';

export type Row = string;
export type Shape = Row[];

export const SYMBOLS = {
  HORIZONTAL: '─',
  VERTICAL: '│',
  ARROW_LEFT: '◀',
  ARROW_RIGHT: '▶',
  ARROW_UP: '▲',
  ARROW_DOWN: '▼',
};

export const BOX = {
  [BorderType.Normal]: {
    LEFT_TOP: '┌',
    RIGHT_TOP: '┐',
    LEFT_BOTTOM: '└',
    RIGHT_BOTTOM: '┘',
    HORIZONTAL: '─',
    VERTICAL: '│',
  },
  [BorderType.Double]: {
    LEFT_TOP: '╔',
    RIGHT_TOP: '╗',
    LEFT_BOTTOM: '╚',
    RIGHT_BOTTOM: '╝',
    HORIZONTAL: '═',
    VERTICAL: '║',
  },
  [BorderType.Heavy]: {
    LEFT_TOP: '┏',
    RIGHT_TOP: '┓',
    LEFT_BOTTOM: '┗',
    RIGHT_BOTTOM: '┛',
    HORIZONTAL: '━',
    VERTICAL: '┃',
  },
  [BorderType.Rounded]: {
    LEFT_TOP: '╭',
    RIGHT_TOP: '╮',
    LEFT_BOTTOM: '╰',
    RIGHT_BOTTOM: '╯',
    HORIZONTAL: '─',
    VERTICAL: '│',
  },
};

// TODO: Add better validations and edge case handling
export function rectangle(rect: Rectangle): Shape {
  const width = Math.abs(rect.width);
  const height = Math.abs(rect.height);
  return g2.rectangle(width, height, rect.borderType, rect.label).rows;
}

export function line(len: number, horizontal: boolean): Shape {
  return g2.line(len, horizontal).rows;
}

export function polyline(points: Point[]): Shape {
  // Convert pixel points to grid cells
  const cells = points.map(p => ({ col: Math.floor(p.x / X_SCALE), row: Math.floor(p.y / Y_SCALE) }));
  return g2.polyline(cells).rows;
}

export function arrow(len: number, direction: LinearDirection): Shape {
  return g2.arrow(len, direction as g2.LinearDirection).rows;
}

export function text(content: string): Shape {
  return g2.text(content).rows;
}

// TODO: Where to keep this implementation?
function getWidth(element: Element): number {
  switch (element.type) {
    case ElementType.Rectangle:
      return element.width;
    case ElementType.Line:
      // Multi-segment line - use shape width
      if ((element as any).points) {
        return Math.max(...element.shape.map(row => row.length));
      }
      return isHorizontal(element) ? element.len : 1;
    case ElementType.Arrow:
      // Multi-segment arrow - use shape width
      if ((element as any).points) {
        return Math.max(...element.shape.map(row => row.length));
      }
      return element.direction === LinearDirection.Left ||
        element.direction === LinearDirection.Right
        ? element.len
        : 1;
    case ElementType.Text:
      return element.content.length;
  }
}

function getHeight(element: Element): number {
  switch (element.type) {
    case ElementType.Rectangle:
      return element.height;
    case ElementType.Line:
      // Multi-segment line - use shape height
      if ((element as any).points) {
        return element.shape.length;
      }
      return isHorizontal(element) ? 1 : element.len;
    case ElementType.Arrow:
      // Multi-segment arrow - use shape height
      if ((element as any).points) {
        return element.shape.length;
      }
      return element.direction === LinearDirection.Up || element.direction === LinearDirection.Down
        ? element.len
        : 1;
    case ElementType.Text:
      return 1;
  }
}

function writeToScene(origin: Point, sceneArr: string[][], element: Element) {
  const offsetX = (element.x - origin.x) / X_SCALE;
  const offsetY = (element.y - origin.y) / Y_SCALE;

  const shape: string[][] = _.map(element.shape, (row) => row.split(''));

  shape.forEach((row, rowNum) => {
    row.forEach((s, colNum) => {
      s !== ' ' && (sceneArr[rowNum + offsetY][colNum + offsetX] = s);
    });
  });
}

export function getBoundingRectForBounds(bounds: IBounds[]): IBounds {
  const xMin = _.min(_.map(bounds, (bound) => bound.x)) || 0;
  const xMax = _.max(_.map(bounds, (bound) => bound.x + bound.width)) || 0;
  const yMin = _.min(_.map(bounds, (bound) => bound.y)) || 0;
  const yMax = _.max(_.map(bounds, (bound) => bound.y + bound.height)) || 0;

  let width = xMax - xMin;
  let height = yMax - yMin;

  return {
    x: xMin,
    y: yMin,
    width,
    height,
  };
}

export function getBoundingRect(elements: Element[], scaled = false): IBounds {
  const xMin = _.min(_.map(elements, (element) => element.x)) || 0;
  const xMax = _.max(_.map(elements, (element) => element.x + getWidth(element) * X_SCALE)) || 0;
  const yMin = _.min(_.map(elements, (element) => element.y)) || 0;
  const yMax = _.max(_.map(elements, (element) => element.y + getHeight(element) * Y_SCALE)) || 0;

  let width = xMax - xMin;
  let height = yMax - yMin;

  if (!scaled) {
    width = Math.floor(width / X_SCALE);
    height = Math.floor(height / Y_SCALE);
  }

  return {
    x: xMin,
    y: yMin,
    width,
    height,
  };
}

export function merge(elements: Element[]): MergedElements {
  // Find boundaries
  const bound = getBoundingRect(elements);

  // Create a 2D array
  let sceneArr: string[][] = [];
  for (let i = 0; i < bound.height; i++) {
    sceneArr.push(new Array(bound.width).fill(' '));
  }

  // Fill the array
  elements.forEach((element) => {
    writeToScene(point(bound.x, bound.y), sceneArr, element);
  });

  return {
    origin: { x: bound.x, y: bound.y },
    content: sceneArr,
  };
}
