import { X_SCALE, Y_SCALE } from '../constants';
import { elementIDGenerator } from '../id';
import {
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
    return {
      id: elementIDGenerator.getNextID(),
      x,
      y,
      content: '',
      shape: [''],
      type: ElementType.Text,
      labelEnabled: false,
    };
  },
  outlineBounds: function (text: Text): IBounds {
    let { xMin, xMax, yMin, yMax } = getLinearBounding(
      { x: text.x, y: text.y },
      text.content.length,
      true
    );

    xMin = xMin - X_SCALE / 2;

    return {
      x: xMin,
      y: yMin,
      width: xMax - xMin + X_SCALE / 2,
      height: yMax - yMin,
    };
  },
  inVicinity: function (text: Text, p: Point) {
    return inLinearVicinity(p, { x: text.x, y: text.y }, text.content.length, true);
  },
  create: function (t, mouseMove, callback) {},
  allEditHandles: function () {
    return [];
  },
  getEditHandleId: function (text, e) {
    return null;
  },
  edit: function (text, mouseMove, handleId) {
    return text;
  },
  getGuideAnchors: function (text) {
    return [];
  },
};
