import { Property } from '@stitches/react/types/css';
import _ from 'lodash';

export enum Tool {
  Rectangle = 'Rectangle',
  Line = 'Line',
  Arrow = 'Arrow',
  Text = 'Text',
  Select = 'Select',
}

export const SHORTCUT_TO_TOOL = {
  r: Tool.Rectangle,
  l: Tool.Line,
  a: Tool.Arrow,
  t: Tool.Text,
  s: Tool.Select,
} as { [i: string]: Tool };

export function getCursorForTool(t: Tool): Property.Cursor {
  if (t === Tool.Select) {
    return 'default';
  } else {
    return 'crosshair';
  }
}
