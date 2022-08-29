import { X_SCALE, Y_SCALE } from '../constants';
import { getNextID } from '../id';
import {
  defaultDrag,
  ElementCommons,
  ElementType,
  ElementUtils,
  getLinearBounding,
  IBounds,
  inLinearVicinity,
  Point,
} from './base';
import * as g from '../geometry';

export enum ArrowDirection {
  Left,
  Right,
  Up,
  Down,
  Undecided,
}

export interface Arrow extends ElementCommons {
  len: number;
  direction: ArrowDirection;
  type: ElementType.Arrow;
}

export const ArrowUtils: ElementUtils<Arrow> = {
  new: function (x: number, y: number): Arrow {
    return {
      id: getNextID(),
      x,
      y,
      len: 2,
      direction: ArrowDirection.Undecided,
      shape: [''],
      type: ElementType.Arrow,
    };
  },
  outlineBounds: function (arrow: Arrow): IBounds {
    const { xMin, xMax, yMin, yMax } = getLinearBounding(
      { x: arrow.x, y: arrow.y },
      arrow.len,
      arrow.direction === ArrowDirection.Left || arrow.direction === ArrowDirection.Right
    );

    return { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin };
  },

  inVicinity: function (arrow: Arrow, p: Point) {
    return inLinearVicinity(
      p,
      { x: arrow.x, y: arrow.y },
      arrow.len,
      arrow.direction === ArrowDirection.Left || arrow.direction === ArrowDirection.Right
    );
  },

  moveToEdit: function (arrow, mouseMove, callback) {
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

  drag: defaultDrag,
};
