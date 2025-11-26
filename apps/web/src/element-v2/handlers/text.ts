import { TextElement, ElementHandler, TextData } from '../types';
import { GridCell, GridBounds } from '../../geometry-v2/types';
import { PixelPoint, PixelBounds, X_SCALE, Y_SCALE, gridToPixel } from '../../scale';
import { EditInput } from '../../types';
import * as g from '../../geometry-v2/shapes';
import { boundsOfShape } from '../../geometry-v2/bounds';
import { elementIDGenerator } from '../../id';

export const TextHandler: ElementHandler<TextData> = {
  type: 'text',

  create(position: GridCell): TextElement {
    return {
      id: elementIDGenerator.getNextID(),
      position,
      shape: g.text(''),
      data: { type: 'text', content: '' },
    };
  },

  bounds(element): GridBounds {
    return boundsOfShape(element.shape, element.position);
  },

  selectionBounds(element): PixelBounds {
    const b = this.bounds(element);
    const pixelOrigin = gridToPixel(b.origin);
    
    return {
      origin: { 
        x: pixelOrigin.x - X_SCALE / 2, 
        y: pixelOrigin.y - Y_SCALE / 2 
      },
      width: (b.width + 1) * X_SCALE,
      height: (b.height + 1) * Y_SCALE,
    };
  },

  inVicinity(element, point: PixelPoint): boolean {
    const bounds = this.selectionBounds(element);
    return (
      point.x >= bounds.origin.x &&
      point.x <= bounds.origin.x + bounds.width &&
      point.y >= bounds.origin.y &&
      point.y <= bounds.origin.y + bounds.height
    );
  },

  editHandles(element) {
    return [];
  },

  applyEdit(element, handleId, input): TextElement {
    if (input.kind === 'mouse') {
      return element;
    }
    
    return {
      ...element,
      shape: g.text(input.content),
      data: { ...element.data, content: input.content },
    };
  },

  guideAnchors(element) {
    return [];
  },
};
