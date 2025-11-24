import { Property } from '@stitches/react/types/css';
import _ from 'lodash';
import { ElementType } from './element';

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

export const ElementTypeForTool: { [t in Tool]?: ElementType } = {
  [Tool.Rectangle]: ElementType.Rectangle,
  [Tool.Line]: ElementType.Line,
  [Tool.Arrow]: ElementType.Arrow,
  [Tool.Text]: ElementType.Text,
};

export function getCursorForTool(t: Tool): Property.Cursor {
  if (t === Tool.Select) {
    return 'default';
  } else {
    return 'crosshair';
  }
}
