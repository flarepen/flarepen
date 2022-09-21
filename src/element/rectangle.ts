import { elementID } from '../id';
import * as g from '../geometry';
import {
  ElementCommons,
  ElementType,
  ElementUtils,
  IBounds,
  Point,
  inLinearVicinity,
  point,
  isPointInsideBound,
} from './base';
import { X_SCALE, Y_SCALE } from '../constants';
import { EditHandle, EditHandleType, IMouseMove } from '../types';
import _ from 'lodash';

const HANDLE_SIZE = 8;

function handle(x: number, y: number, handleType: EditHandleType): EditHandle {
  return {
    bounds: { x, y, width: HANDLE_SIZE, height: HANDLE_SIZE },
    handleType,
  };
}

export interface Rectangle extends ElementCommons {
  width: number;
  height: number;
  type: ElementType.Rectangle;
}

export const RectangleUtils: ElementUtils<Rectangle> = {
  new: function (x: number, y: number): Rectangle {
    return {
      id: elementID.getNextID(),
      x,
      y,
      width: 2,
      height: 2,
      shape: g.rectangle(2, 2),
      type: ElementType.Rectangle,
    };
  },

  outlineBounds: function (rectangle: Rectangle): IBounds {
    const x = rectangle.x;
    const y = rectangle.y - Y_SCALE / 4;

    return {
      x,
      y,
      width: rectangle.width * X_SCALE,
      height: rectangle.height * Y_SCALE - Y_SCALE / 2,
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

  allEditHandles: function (rectangle) {
    const { x, y, width, height } = RectangleUtils.outlineBounds(rectangle);

    return [
      handle(x + width / 2 - 5, y - HANDLE_SIZE, 'top'),
      handle(x + width / 2 - 5, y + height, 'bottom'),
      handle(x + width, y + height / 2 - HANDLE_SIZE / 2, 'right'),
      handle(x - HANDLE_SIZE, y + height / 2 - HANDLE_SIZE / 2, 'left'),
      handle(x - HANDLE_SIZE, y - HANDLE_SIZE, 'topLeft'),
      handle(x - HANDLE_SIZE, y + height, 'bottomLeft'),
      handle(x + width, y - HANDLE_SIZE, 'topRight'),
      handle(x + width, y + height, 'bottomRight'),
    ];
  },

  getEditHandleType: function (rectangle, e) {
    const point = {
      x: e.clientX,
      y: e.clientY,
    };

    const handle = _.find(RectangleUtils.allEditHandles(rectangle), (handle) =>
      isPointInsideBound(point, handle.bounds)
    );

    return handle?.handleType || null;
  },

  edit: function (rectangle, mouseMove, handleType) {
    let { x, y, width, height } = rectangle;

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
        if (width - widthIncr >= 2) {
          x = x + widthIncr * X_SCALE;
          width = width - widthIncr;
        }
        break;
      case 'right':
        if (width + widthIncr >= 2) {
          width = width + widthIncr;
        }
        break;
      case 'top':
        if (height - heightIncr >= 2) {
          y = y + heightIncr * Y_SCALE;
          height = height - heightIncr;
        }
        break;
      case 'bottom':
        if (height + heightIncr >= 2) {
          height = height + heightIncr;
        }
        break;
      case 'topLeft':
        if (width - widthIncr >= 2) {
          x = x + widthIncr * X_SCALE;
          width = width - widthIncr;
        }
        if (height - heightIncr >= 2) {
          y = y + heightIncr * Y_SCALE;
          height = height - heightIncr;
        }
        break;
      case 'topRight':
        if (width + widthIncr >= 2) {
          width = width + widthIncr;
        }
        if (height - heightIncr >= 2) {
          y = y + heightIncr * Y_SCALE;
          height = height - heightIncr;
        }
        break;
      case 'bottomLeft':
        if (width - widthIncr >= 2) {
          x = x + widthIncr * X_SCALE;
          width = width - widthIncr;
        }
        if (height + heightIncr >= 2) {
          height = height + heightIncr;
        }
        break;
      case 'bottomRight':
        if (width + widthIncr >= 2) {
          width = width + widthIncr;
        }
        if (height + heightIncr >= 2) {
          height = height + heightIncr;
        }
        break;
    }

    return {
      ...rectangle,
      x,
      y,
      width,
      height,
      shape: g.rectangle(Math.abs(width), Math.abs(height)),
    };
  },
};
