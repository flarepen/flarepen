import _ from 'lodash';

export enum Tool {
  Rectangle = 'Rectangle',
  Line = 'Line',
  Arrow = 'Arrow',
  Text = 'Text',
  Select = 'Select',
}

export const TOOL_SHORTCUTS: { [key in Tool]: string } = {
  [Tool.Rectangle]: '1',
  [Tool.Line]: '2',
  [Tool.Arrow]: '3',
  [Tool.Text]: '4',
  [Tool.Select]: '5',
};

export const SHORTCUT_TO_TOOL = _.invert(TOOL_SHORTCUTS) as {
  [i: string]: Tool;
};
