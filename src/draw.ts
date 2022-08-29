import { Y_SCALE } from './constants';
import { Element, IBounds } from './element';

function element(ctx: CanvasRenderingContext2D, element: Element) {
  let x = element.x;
  let y = element.y;
  element.shape.forEach((row) => {
    ctx.fillText(row, x, y);
    y = y + Y_SCALE;
  });
}

function dashedRect(ctx: CanvasRenderingContext2D, bounds: IBounds) {
  const lineDash = ctx.getLineDash();
  ctx.setLineDash([8, 4]);
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.setLineDash(lineDash);
}

export default { element, dashedRect };
