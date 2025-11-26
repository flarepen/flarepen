import { elementIDGenerator } from '../id';
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
import { BorderType, EditHandle,  MouseMove } from '../types';
import _ from 'lodash';

const HANDLE_SIZE = 8;

function handle(x: number, y: number, handleId: string): EditHandle {
  return {
    bounds: { x, y, width: HANDLE_SIZE, height: HANDLE_SIZE },
    handleId,
  };
}

export interface Rectangle extends ElementCommons {
  width: number;
  height: number;
  borderType: BorderType;
  type: ElementType.Rectangle;
}

export const RectangleUtils: ElementUtils<Rectangle> = {
  new: function (x: number, y: number): Rectangle {
    const newRect: Rectangle = {
      id: elementIDGenerator.getNextID(),
      x,
      y,
      width: 2,
      height: 2,
      borderType: BorderType.Normal,
      shape: [] as string[],
      type: ElementType.Rectangle,
      labelEnabled: true,
    };
    newRect.shape = g.rectangle(newRect);
    return newRect;
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
      inLinearVicinity(p, point(x, y + height * Y_SCALE - Y_SCALE), width, true) ||
      inLinearVicinity(p, point(x + width * X_SCALE - X_SCALE, y), height, false)
    );
  },

  create: function (rectangle, mouseMove, callback) {
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

    const newRect = {
      ...rectangle,
      x,
      y,
      width,
      height,
    };

    newRect.shape = g.rectangle(newRect);

    callback(newRect);
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

  getEditHandleId: function (rectangle, e) {
    const point = {
      x: e.clientX,
      y: e.clientY,
    };

    const handle = _.find(RectangleUtils.allEditHandles(rectangle), (handle) =>
      isPointInsideBound(point, handle.bounds)
    );

    return handle?.handleId || null;
  },

  edit: function (rectangle, mouseMove, handleId) {
    let { x, y, width, height } = rectangle;

    const widthIncr =
      mouseMove.accX > 0
        ? Math.floor(mouseMove.accX / X_SCALE)
        : Math.ceil(mouseMove.accX / X_SCALE);
    const heightIncr =
      mouseMove.accY > 0
        ? Math.floor(mouseMove.accY / Y_SCALE)
        : Math.ceil(mouseMove.accY / Y_SCALE);

    let minWidth = 2 + (rectangle.label ? rectangle.label?.length : 0);

    switch (handleId) {
      case 'left':
        if (width - widthIncr >= minWidth) {
          x = x + widthIncr * X_SCALE;
          width = width - widthIncr;
        }
        break;
      case 'right':
        if (width + widthIncr >= minWidth) {
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
        if (width - widthIncr >= minWidth) {
          x = x + widthIncr * X_SCALE;
          width = width - widthIncr;
        }
        if (height - heightIncr >= 2) {
          y = y + heightIncr * Y_SCALE;
          height = height - heightIncr;
        }
        break;
      case 'topRight':
        if (width + widthIncr >= minWidth) {
          width = width + widthIncr;
        }
        if (height - heightIncr >= 2) {
          y = y + heightIncr * Y_SCALE;
          height = height - heightIncr;
        }
        break;
      case 'bottomLeft':
        if (width - widthIncr >= minWidth) {
          x = x + widthIncr * X_SCALE;
          width = width - widthIncr;
        }
        if (height + heightIncr >= 2) {
          height = height + heightIncr;
        }
        break;
      case 'bottomRight':
        if (width + widthIncr >= minWidth) {
          width = width + widthIncr;
        }
        if (height + heightIncr >= 2) {
          height = height + heightIncr;
        }
        break;
    }

    const newRect = {
      ...rectangle,
      x,
      y,
      width,
      height,
    };

    newRect.shape = g.rectangle(newRect);

    return newRect;
  },

  getGuideAnchors: function (rectangle) {
    const x = rectangle.x;
    const y = rectangle.y - Y_SCALE / 2;

    const width = rectangle.width;
    const height = rectangle.height;

    return [
      // Top Left
      { x, y: y },
      // Top Right
      { x: x + width * X_SCALE, y },
      // Bottom Left
      { x, y: y + height * Y_SCALE },
      // Bottom Right
      {
        x: x + width * X_SCALE,
        y: y + height * Y_SCALE,
      },
      // Center
      {
        x: x + (width / 2) * X_SCALE,
        y: y + (height / 2) * Y_SCALE,
      },
    ];
  },
};
