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

export interface Text extends ElementCommons {
  content: string;
  type: ElementType.Text;
}

export const TextUtils: ElementUtils<Text> = {
  new: function (x: number, y: number): Text {
    return { id: getNextID(), x, y, content: '', shape: [''], type: ElementType.Text };
  },
  outlineBounds: function (text: Text): IBounds {
    let { xMin, xMax, yMin, yMax } = getLinearBounding(
      { x: text.x, y: text.y },
      text.content.length,
      true
    );

    xMin = xMin + X_SCALE / 2;
    yMin = yMin + Y_SCALE / 2;

    return { x: xMin, y: yMin, width: xMax - xMin - X_SCALE, height: yMax - yMin - Y_SCALE };
  },
  inVicinity: function (text: Text, p: Point) {
    return inLinearVicinity(p, { x: text.x, y: text.y }, text.content.length, true);
  },
  moveToEdit: function (t, mouseMove, callback) {},
  drag: defaultDrag,
};
