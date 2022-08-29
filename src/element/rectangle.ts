import { getNextID } from '../id';
import * as g from '../geometry';
import {
  ElementCommons,
  ElementType,
  ElementUtils,
  IBounds,
  Point,
  inLinearVicinity,
  point,
  defaultDrag,
} from './base';
import { X_SCALE, Y_SCALE } from '../constants';

export interface Rectangle extends ElementCommons {
  width: number;
  height: number;
  type: ElementType.Rectangle;
}

export const RectangleUtils: ElementUtils<Rectangle> = {
  new: function (x: number, y: number): Rectangle {
    return {
      id: getNextID(),
      x,
      y,
      width: 2,
      height: 2,
      shape: g.rectangle(2, 2),
      type: ElementType.Rectangle,
    };
  },

  outlineBounds: function (rectangle: Rectangle): IBounds {
    const x = rectangle.x - X_SCALE;
    const y = rectangle.y - Y_SCALE;

    return {
      x,
      y,
      width: rectangle.width * X_SCALE + X_SCALE,
      height: rectangle.height * Y_SCALE + Y_SCALE,
    };
  },

  inVicinity: function (rectangle: Rectangle, p: Point) {
    const { x, y, width, height } = rectangle;
    return (
      inLinearVicinity(p, point(x, y), width, true) ||
      inLinearVicinity(p, point(x, y), height, false) ||
      inLinearVicinity(p, point(x, y + height * Y_SCALE), width, true) ||
      inLinearVicinity(p, point(x + width * X_SCALE, y), height, false)
    );
  },

  moveToEdit: function (rectangle, mouseMove, callback) {
    const widthIncr =
      mouseMove.accX > 0
        ? Math.floor(mouseMove.accX / X_SCALE)
        : Math.ceil(mouseMove.accX / X_SCALE);
    const heightIncr =
      mouseMove.accY > 0
        ? Math.floor(mouseMove.accY / Y_SCALE)
        : Math.ceil(mouseMove.accY / Y_SCALE);
    let { x, y, width, height } = rectangle;
    width = width + widthIncr;
    height = height + heightIncr;

    // Min width and height is 2.
    // We need to skip 1,0 and -1 to any kind of jumpiness when moving from positive to negative or vice versa
    if (width <= 1 && width >= -1) {
      if (widthIncr < 0) {
        // if decreasing
        width = -3;
      } else {
        width = 3;
      }
    }

    if (height <= 1 && height >= -1) {
      if (heightIncr < 0) {
        // if decreasing
        height = -3;
      } else {
        height = 3;
      }
    }

    if (width < 0) {
      x = x + widthIncr * X_SCALE;
    }

    if (height < 0) {
      y = y + heightIncr * Y_SCALE;
    }

    callback({
      ...rectangle,
      x,
      y,
      width,
      height,
      shape: g.rectangle(Math.abs(width), Math.abs(height)),
    });
  },

  drag: defaultDrag,
};
