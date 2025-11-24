import { X_SCALE, Y_SCALE } from '../constants';
import {
  ElementCommons,
  getLinearBounding,
  inLinearVicinity,
  Point,
  isPointInsideBound,
} from './base';
import { EditHandle, EditHandleType } from '../types';
import _ from 'lodash';

const HANDLE_SIZE = 8;

export enum LinearDirection {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
  Undecided = 'undecided',
}

export interface LinearElement extends ElementCommons {
  len: number;
  direction: LinearDirection;
  points?: Point[]; // Optional: for multi-segment lines/arrows
}

function handle(x: number, y: number, handleType: EditHandleType): EditHandle {
  return {
    bounds: { x, y, width: HANDLE_SIZE, height: HANDLE_SIZE },
    handleType,
  };
}

export function isHorizontal(element: LinearElement): boolean {
  return element.direction === LinearDirection.Left || element.direction === LinearDirection.Right;
}

export const LinearElementUtils = {
  outlineBounds: function (element: LinearElement) {
    let { xMin, xMax, yMin, yMax } = getLinearBounding(
      { x: element.x, y: element.y },
      element.len,
      isHorizontal(element)
    );

    let width = xMax - xMin;
    let height = yMax - yMin;

    if (isHorizontal(element)) {
      xMin = xMin - X_SCALE / 2;
      width = xMax - xMin + X_SCALE / 2;
    } else {
      yMin = yMin - Y_SCALE / 4;
      height = yMax - yMin + Y_SCALE / 4;
    }

    return { x: xMin, y: yMin, width, height };
  },

  inVicinity: function (element: LinearElement, p: Point) {
    return inLinearVicinity(p, { x: element.x, y: element.y }, element.len, isHorizontal(element));
  },

  allEditHandles: function (element: LinearElement) {
    const { x, y, width, height } = LinearElementUtils.outlineBounds(element);

    if (isHorizontal(element)) {
      return [
        handle(x - HANDLE_SIZE, y + height / 2 - HANDLE_SIZE / 2, 'left'),
        handle(x + width, y + height / 2 - HANDLE_SIZE / 2, 'right'),
      ];
    }

    return [
      handle(x + width / 2 - HANDLE_SIZE / 2, y - HANDLE_SIZE, 'top'),
      handle(x + width / 2 - HANDLE_SIZE / 2, y + height, 'bottom'),
    ];
  },

  getEditHandleType: function (element: LinearElement, e: { clientX: number; clientY: number }) {
    const point = {
      x: e.clientX,
      y: e.clientY,
    };

    const handle = _.find(LinearElementUtils.allEditHandles(element), (handle) =>
      isPointInsideBound(point, handle.bounds)
    );

    return handle?.handleType || null;
  },

  handleDirectionChange: function (
    element: LinearElement,
    widthIncr: number,
    heightIncr: number,
    minLength: number
  ) {
    if (element.direction === LinearDirection.Undecided) {
      widthIncr > 0 && (element.direction = LinearDirection.Right);
      widthIncr < 0 && (element.direction = LinearDirection.Left);
      heightIncr > 0 && (element.direction = LinearDirection.Down);
      heightIncr < 0 && (element.direction = LinearDirection.Up);
      return;
    }

    let { x, y, len, direction } = element;

    if (direction === LinearDirection.Right && len + widthIncr < minLength) {
      direction = LinearDirection.Left;
      widthIncr = widthIncr + len;
      len = minLength;
    } else if (direction === LinearDirection.Left && len - widthIncr <= minLength) {
      direction = LinearDirection.Right;
      widthIncr = widthIncr - len;
      len = minLength;
    } else if (direction === LinearDirection.Down && len + heightIncr < minLength) {
      direction = LinearDirection.Up;
      heightIncr = heightIncr + len;
      len = minLength;
    } else if (direction === LinearDirection.Up && len - heightIncr <= minLength) {
      direction = LinearDirection.Down;
      heightIncr = heightIncr - len;
      len = minLength;
    }

    return { x, y, len, direction };
  },

  edit: function (
    element: LinearElement,
    mouseMove: { accX: number; accY: number },
    handleType: EditHandleType,
    minLength: number
  ) {
    let { x, y, len } = element;

    const widthIncr =
      mouseMove.accX > 0
        ? Math.floor(mouseMove.accX / X_SCALE)
        : Math.ceil(mouseMove.accX / X_SCALE);
    const heightIncr =
      mouseMove.accY > 0
        ? Math.floor(mouseMove.accY / Y_SCALE)
        : Math.ceil(mouseMove.accY / Y_SCALE);

    switch (handleType) {
      case 'left':
        if (len - widthIncr >= minLength) {
          x = x + widthIncr * X_SCALE;
          len = len - widthIncr;
        }
        break;
      case 'right':
        if (len + widthIncr >= minLength) {
          len = len + widthIncr;
        }
        break;
      case 'top':
        if (len - heightIncr >= minLength) {
          y = y + heightIncr * Y_SCALE;
          len = len - heightIncr;
        }
        break;
      case 'bottom':
        if (len + heightIncr >= minLength) {
          len = len + heightIncr;
        }
        break;
    }

    return { x, y, len };
  },
};
