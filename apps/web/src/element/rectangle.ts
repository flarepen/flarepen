import { elementIDGenerator } from '../id';
import * as g from '../geometry';
import {
  ElementCommons,
  ElementType,
  ElementHandler,
  IBounds,
  Point,
  inLinearVicinity,
  point,
  isPointInsideBound,
} from './base';
import { X_SCALE, Y_SCALE } from '../constants';
import { pixelDeltaToGrid } from '../scale';
import { BorderType, EditHandle,  MouseMove } from '../types';
import _ from 'lodash';

// ============================================================================
// Edit Handle Helpers
// ============================================================================

const HANDLE_SIZE = 8;

function handle(x: number, y: number, handleId: string): EditHandle {
  return {
    bounds: { x, y, width: HANDLE_SIZE, height: HANDLE_SIZE },
    handleId,
  };
}

// ============================================================================
// Rectangle Update Helper
// ============================================================================

function updateRectangle(rectangle: Rectangle, updates: Partial<Rectangle>): Rectangle {
  const updated = { ...rectangle, ...updates };
  updated.shape = g.rectangle(updated);
  return updated;
}

// ============================================================================
// Resize Context and Pure Resize Functions
// ============================================================================

interface ResizeContext {
  x: number;
  y: number;
  width: number;
  height: number;
  widthIncr: number;
  heightIncr: number;
  minWidth: number;
  minHeight: number;
}

function resizeLeft(ctx: ResizeContext): Partial<ResizeContext> {
  if (ctx.width - ctx.widthIncr >= ctx.minWidth) {
    return {
      x: ctx.x + ctx.widthIncr * X_SCALE,
      width: ctx.width - ctx.widthIncr,
    };
  }
  return {};
}

function resizeRight(ctx: ResizeContext): Partial<ResizeContext> {
  if (ctx.width + ctx.widthIncr >= ctx.minWidth) {
    return { width: ctx.width + ctx.widthIncr };
  }
  return {};
}

function resizeTop(ctx: ResizeContext): Partial<ResizeContext> {
  if (ctx.height - ctx.heightIncr >= ctx.minHeight) {
    return {
      y: ctx.y + ctx.heightIncr * Y_SCALE,
      height: ctx.height - ctx.heightIncr,
    };
  }
  return {};
}

function resizeBottom(ctx: ResizeContext): Partial<ResizeContext> {
  if (ctx.height + ctx.heightIncr >= ctx.minHeight) {
    return { height: ctx.height + ctx.heightIncr };
  }
  return {};
}

// ============================================================================
// Rectangle Interface and Handler
// ============================================================================

export interface Rectangle extends ElementCommons {
  width: number;
  height: number;
  borderType: BorderType;
  type: ElementType.Rectangle;
}

export const RectangleHandler: ElementHandler<Rectangle> = {
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
    const bounds = RectangleHandler.outlineBounds(rectangle);
    return (
      p.x >= bounds.x &&
      p.x <= bounds.x + bounds.width &&
      p.y >= bounds.y &&
      p.y <= bounds.y + bounds.height
    );
  },

  create: function (rectangle, mouseMove, callback) {
    const { widthIncr, heightIncr } = pixelDeltaToGrid(mouseMove.accX, mouseMove.accY);

    let { x, y, width, height } = rectangle;
    width += widthIncr;
    height += heightIncr;

    // Skip -1, 0, 1 to avoid jumpiness when crossing zero
    // Jump directly to -3 or 3 to maintain minimum size
    if (width >= -1 && width <= 1) {
      width = widthIncr < 0 ? -3 : 3;
    }
    if (height >= -1 && height <= 1) {
      height = heightIncr < 0 ? -3 : 3;
    }

    // If negative, flip position to opposite corner
    // This allows dragging left/up from the starting point
    if (width < 0) x += widthIncr * X_SCALE;
    if (height < 0) y += heightIncr * Y_SCALE;

    callback(updateRectangle(rectangle, { x, y, width, height }));
  },

  allEditHandles: function (rectangle) {
    const { x, y, width, height } = RectangleHandler.outlineBounds(rectangle);

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

    const handle = _.find(RectangleHandler.allEditHandles(rectangle), (handle) =>
      isPointInsideBound(point, handle.bounds)
    );

    return handle?.handleId || null;
  },

  edit: function (rectangle, mouseMove, handleId) {
    const { widthIncr, heightIncr } = pixelDeltaToGrid(mouseMove.accX, mouseMove.accY);
    
    const ctx: ResizeContext = {
      x: rectangle.x,
      y: rectangle.y,
      width: rectangle.width,
      height: rectangle.height,
      widthIncr,
      heightIncr,
      minWidth: 2 + (rectangle.label?.length || 0),
      minHeight: 2,
    };

    let changes = {};
    
    switch (handleId) {
      case 'left':
        changes = resizeLeft(ctx);
        break;
      case 'right':
        changes = resizeRight(ctx);
        break;
      case 'top':
        changes = resizeTop(ctx);
        break;
      case 'bottom':
        changes = resizeBottom(ctx);
        break;
      case 'topLeft':
        changes = { ...resizeLeft(ctx), ...resizeTop(ctx) };
        break;
      case 'topRight':
        changes = { ...resizeRight(ctx), ...resizeTop(ctx) };
        break;
      case 'bottomLeft':
        changes = { ...resizeLeft(ctx), ...resizeBottom(ctx) };
        break;
      case 'bottomRight':
        changes = { ...resizeRight(ctx), ...resizeBottom(ctx) };
        break;
    }

    return updateRectangle(rectangle, changes);
  },

  getGuideAnchors: function (rectangle) {
    const x = rectangle.x;
    const y = rectangle.y - Y_SCALE / 2;
    const w = rectangle.width * X_SCALE;
    const h = rectangle.height * Y_SCALE;

    return [
      { x, y },                     // Top Left
      { x: x + w, y },              // Top Right
      { x, y: y + h },              // Bottom Left
      { x: x + w, y: y + h },       // Bottom Right
      { x: x + w / 2, y: y + h / 2 }, // Center
    ];
  },
};
