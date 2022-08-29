import { getNextID } from '../id';
import * as g from '../geometry';
import { ElementCommons, ElementType, ElementUtils, IBounds } from './base';
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
};
