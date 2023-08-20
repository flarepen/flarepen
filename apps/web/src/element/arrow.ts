import { X_SCALE, Y_SCALE } from '../constants';
import { elementIDGenerator } from '../id';
import {
  ElementCommons,
  ElementType,
  ElementUtils,
  getLinearBounding,
  IBounds,
  inLinearVicinity,
  isPointInsideBound,
  Point,
} from './base';
import * as g from '../geometry';
import { EditHandle, EditHandleType } from '../types';
import _ from 'lodash';

const HANDLE_SIZE = 8;

function handle(x: number, y: number, handleType: EditHandleType): EditHandle {
  return {
    bounds: { x, y, width: HANDLE_SIZE, height: HANDLE_SIZE },
    handleType,
  };
}

export enum ArrowDirection {
  Left = 'left',
  Right = 'right',
  Up = 'up',
  Down = 'down',
  Undecided = 'undecided',
}

export interface Arrow extends ElementCommons {
  len: number;
  direction: ArrowDirection;
  type: ElementType.Arrow;
}

export function isHorizontalArrow(arrow: Arrow): boolean {
  return arrow.direction === ArrowDirection.Left || arrow.direction === ArrowDirection.Right;
}

export const ArrowUtils: ElementUtils<Arrow> = {
  new: function (x: number, y: number): Arrow {
    return {
      id: elementIDGenerator.getNextID(),
      x,
      y,
      len: 2,
      direction: ArrowDirection.Undecided,
      shape: [''],
      type: ElementType.Arrow,
      labelEnabled: false,
    };
  },
  outlineBounds: function (arrow: Arrow): IBounds {
    let { xMin, xMax, yMin, yMax } = getLinearBounding(
      { x: arrow.x, y: arrow.y },
      arrow.len,
      isHorizontalArrow(arrow)
    );

    let width = xMax - xMin;
    let height = yMax - yMin;

    if (isHorizontalArrow(arrow)) {
      xMin = xMin - X_SCALE / 2;
      width = xMax - xMin + X_SCALE / 2;
    } else {
      yMin = yMin - Y_SCALE / 4;
      height = yMax - yMin;
    }

    return { x: xMin, y: yMin, width: width, height };
  },

  inVicinity: function (arrow: Arrow, p: Point) {
    return inLinearVicinity(
      p,
      { x: arrow.x, y: arrow.y },
      arrow.len,
      arrow.direction === ArrowDirection.Left || arrow.direction === ArrowDirection.Right
    );
  },

  create: function (arrow, mouseMove, callback) {
    let widthIncr =
      mouseMove.accX > 0
        ? Math.floor(mouseMove.accX / X_SCALE)
        : Math.ceil(mouseMove.accX / X_SCALE);
    let heightIncr =
      mouseMove.accY > 0
        ? Math.floor(mouseMove.accY / Y_SCALE)
        : Math.ceil(mouseMove.accY / Y_SCALE);

    // Decide direction if not present
    if (arrow.direction === ArrowDirection.Undecided) {
      widthIncr > 0 && (arrow.direction = ArrowDirection.Right);
      widthIncr < 0 && (arrow.direction = ArrowDirection.Left);
      heightIncr > 0 && (arrow.direction = ArrowDirection.Down);
      heightIncr < 0 && (arrow.direction = ArrowDirection.Up);
    }

    // Swap Direction
    if (arrow.direction !== ArrowDirection.Undecided) {
      if (arrow.direction === ArrowDirection.Right && arrow.len + widthIncr < 1) {
        arrow.direction = ArrowDirection.Left;
        // Reset line length
        widthIncr = widthIncr + arrow.len;
        arrow.len = 2;
      }
      if (arrow.direction === ArrowDirection.Left && arrow.len - widthIncr <= 1) {
        arrow.direction = ArrowDirection.Right;
        // Reset line length
        widthIncr = widthIncr - arrow.len;
        arrow.len = 2;
      }
      if (arrow.direction === ArrowDirection.Down && arrow.len + heightIncr < 1) {
        arrow.direction = ArrowDirection.Up;
        // Reset line length
        heightIncr = heightIncr + arrow.len;
        arrow.len = 2;
      }
      if (arrow.direction === ArrowDirection.Up && arrow.len - heightIncr <= 1) {
        arrow.direction = ArrowDirection.Down;
        // Reset line length
        heightIncr = heightIncr - arrow.len;
        arrow.len = 2;
      }
    }

    // Start drawing if we only know the direction
    if (arrow.direction !== ArrowDirection.Undecided) {
      switch (arrow.direction) {
        case ArrowDirection.Right:
          arrow.len += widthIncr;
          break;
        case ArrowDirection.Left:
          arrow.x = arrow.x + widthIncr * X_SCALE;
          arrow.len -= widthIncr;
          break;
        case ArrowDirection.Down:
          arrow.len += heightIncr;
          break;
        case ArrowDirection.Up:
          arrow.y = arrow.y + heightIncr * Y_SCALE;
          arrow.len -= heightIncr;
          break;
      }

      callback({
        ...arrow,
        shape: g.arrow(arrow.len, arrow.direction),
      });
    }
  },

  allEditHandles: function (arrow) {
    const { x, y, width, height } = ArrowUtils.outlineBounds(arrow);

    if (isHorizontalArrow(arrow)) {
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

  getEditHandleType: function (arrow, e) {
    const point = {
      x: e.clientX,
      y: e.clientY,
    };

    const handle = _.find(ArrowUtils.allEditHandles(arrow), (handle) =>
      isPointInsideBound(point, handle.bounds)
    );

    return handle?.handleType || null;
  },

  edit: function (arrow, mouseMove, handleType) {
    let { x, y, len } = arrow;

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
        if (len - widthIncr >= 2) {
          x = x + widthIncr * X_SCALE;
          len = len - widthIncr;
        }
        break;
      case 'right':
        if (len + widthIncr >= 2) {
          len = len + widthIncr;
        }
        break;
      case 'top':
        if (len - heightIncr >= 2) {
          y = y + heightIncr * Y_SCALE;
          len = len - heightIncr;
        }
        break;
      case 'bottom':
        if (len + heightIncr >= 2) {
          len = len + heightIncr;
        }
        break;
    }

    return {
      ...arrow,
      x,
      y,
      len,
      shape: g.arrow(len, arrow.direction),
    };
  },
};
