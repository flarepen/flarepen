import {
  ArrowDirection,
  Element,
  ElementType,
  IBounds,
  isHorizontalLine,
  point,
  Point,
  Rectangle,
} from './element';
import _ from 'lodash';
import { X_SCALE, Y_SCALE } from './constants';
import { MergedElements, BorderType } from './types';

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
export function rectangle(rectangle: Rectangle): Shape {
  let { width, height, label, borderType } = rectangle;
  width = Math.abs(width);
  height = Math.abs(height);

  const shape = [];
  const box = BOX[borderType];

  // Top
  let top = '';

  if (label) {
    top =
      box.LEFT_TOP +
      label +
      (width - label.length - 2 > 0 ? box.HORIZONTAL.repeat(width - label.length - 2) : '') +
      box.RIGHT_TOP;
  } else {
    top = box.LEFT_TOP + (width - 2 > 0 ? box.HORIZONTAL.repeat(width - 2) : '') + box.RIGHT_TOP;
  }

  shape.push(top);

  // Mids
  if (height - 2 > 0) {
    for (let i = height - 2; i > 0; i--) {
      shape.push(box.VERTICAL + (width - 2 > 0 ? ' '.repeat(width - 2) : '') + box.VERTICAL);
    }
  }

  // Bottom
  shape.push(
    box.LEFT_BOTTOM + (width - 2 > 0 ? box.HORIZONTAL.repeat(width - 2) : '') + box.RIGHT_BOTTOM
  );
  return shape;
}

export function line(len: number, horizontal: boolean): Shape {
  if (horizontal) {
    return [SYMBOLS.HORIZONTAL.repeat(len)];
  }
  return Array(len).fill(SYMBOLS.VERTICAL);
}

export function arrow(len: number, direction: ArrowDirection): Shape {
  let shape = [];
  switch (direction) {
    case ArrowDirection.Right:
      return [line(len - 1, true)[0] + SYMBOLS.ARROW_RIGHT];
    case ArrowDirection.Left:
      return [SYMBOLS.ARROW_LEFT + line(len - 1, true)[0]];
    case ArrowDirection.Up:
      shape = line(len - 1, false);
      shape.unshift(SYMBOLS.ARROW_UP);
      return shape;
    case ArrowDirection.Down:
      shape = line(len - 1, false);
      shape.push(SYMBOLS.ARROW_DOWN);
      return shape;
    case ArrowDirection.Undecided:
      return [''];
  }
}

export function text(content: string): Shape {
  return [content];
}

// TODO: Where to keep this implementation?
function getWidth(element: Element): number {
  switch (element.type) {
    case ElementType.Rectangle:
      return element.width;
    case ElementType.Line:
      return isHorizontalLine(element) ? element.len : 1;
    case ElementType.Arrow:
      return element.direction === ArrowDirection.Left || element.direction === ArrowDirection.Right
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
      return isHorizontalLine(element) ? 1 : element.len;
    case ElementType.Arrow:
      return element.direction === ArrowDirection.Up || element.direction === ArrowDirection.Down
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
