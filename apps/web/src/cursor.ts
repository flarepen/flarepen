import { Property } from '@stitches/react/types/css';
import { EditHandleType, Point } from './types';
import { IBounds } from './element';

export function getCursor(editHandleType: EditHandleType): Property.Cursor {
  switch (editHandleType) {
    case 'top':
      return 'ns-resize';
    case 'bottom':
      return 'ns-resize';
    case 'bottomLeft':
      return 'nesw-resize';
    case 'topRight':
      return 'nesw-resize';
    case 'bottomRight':
      return 'nwse-resize';
    case 'topLeft':
      return 'nwse-resize';
    case 'left':
      return 'ew-resize';
    case 'right':
      return 'ew-resize';
    default:
      return 'default';
  }
}

export function cursorEnabled(p: Point, bound: IBounds): boolean {
  return (
    p.x > bound.x && p.x < bound.x + bound.width && p.y > bound.y && p.y < bound.y + bound.height
  );
}
