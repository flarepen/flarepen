import { X_SCALE, Y_SCALE } from './constants';
import { Element, IBounds } from './element';
import { SYMBOLS } from './geometry';
import { MergedElements } from './types';

function merged(ctx: CanvasRenderingContext2D, merged: MergedElements) {
  let { x, y } = merged.origin;

  merged.content.forEach((row) => {
    x = merged.origin.x;
    row.forEach((ch) => {
      ctx.fillText(ch, x, overrideY(ch, y));
      x = x + X_SCALE;
    });
    y = y + Y_SCALE;
  });
}

function element(ctx: CanvasRenderingContext2D, element: Element) {
  let x = element.x;
  let y = element.y;
  element.shape.forEach((row) => {
    x = element.x;
    row = row || '';
    row.split('').forEach((ch) => {
      ctx.fillText(ch, x, overrideY(ch, y));
      x = x + X_SCALE;
    });
    y = y + Y_SCALE;
  });
}

// Overriding Y for any kind of customizations before render.
function overrideY(ch: string, y: number): number {
  // ARROW_RIGHT U+25B6 is not properly centered.
  return ch == SYMBOLS.ARROW_RIGHT ? y + 2 : y;
}

export function withOpacity(radix_color: string, opacity: number) {
  const len = radix_color.length;
  const hsl = radix_color.substring(4, len - 1);
  return `hsla(${hsl},${opacity})`;
}

function dashedRect(
  ctx: CanvasRenderingContext2D,
  bounds: IBounds,
  stroke: string,
  fill: string,
  segments = [8, 4]
) {
  const lineDash = ctx.getLineDash();
  const fillStyle = ctx.fillStyle;
  const strokeStyle = ctx.strokeStyle;

  ctx.fillStyle = withOpacity(fill, 0.1);
  ctx.strokeStyle = stroke;
  ctx.setLineDash(segments);
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.setLineDash(lineDash);
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeStyle;
}

function rect(ctx: CanvasRenderingContext2D, bounds: IBounds, stroke: string, fill: string) {
  dashedRect(ctx, bounds, stroke, fill, []);
}

export default { element, dashedRect, rect, merged };
