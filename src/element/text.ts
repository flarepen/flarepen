import { getNextID } from '../id';
import { ElementCommons, ElementType, ElementUtils, getLinearBounding, IBounds } from './base';

export interface Text extends ElementCommons {
  content: string;
  type: ElementType.Text;
}

export const TextUtils: ElementUtils<Text> = {
  new: function (x: number, y: number): Text {
    return { id: getNextID(), x, y, content: '', shape: [''], type: ElementType.Text };
  },
  outlineBounds: function (text: Text): IBounds {
    const { xMin, xMax, yMin, yMax } = getLinearBounding(
      { x: text.x, y: text.y },
      text.content.length,
      true
    );

    return { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin };
  },
};
