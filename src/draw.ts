import { X_SCALE, Y_SCALE } from './constants';
import { Element, IBounds } from './element';

const grid_data = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<defs>
  <pattern id="grid" width="13" height="30" patternUnits="userSpaceOnUse">
    <path d="M 13 0 L 0 0 0 30" fill="none" stroke="black" stroke-width="0.5" />
  </pattern>
</defs>
<rect width="100%" height="100%" fill="url(#grid)" />
</svg>`;

function element(ctx: CanvasRenderingContext2D, element: Element) {
  let x = element.x;
  let y = element.y;
  element.shape.forEach((row) => {
    x = element.x;
    row = row || '';
    row.split('').forEach((ch) => {
      ctx.fillText(ch, x, y);
      x = x + X_SCALE;
    });
    y = y + Y_SCALE;
  });
}

function dashedRect(ctx: CanvasRenderingContext2D, bounds: IBounds) {
  const lineDash = ctx.getLineDash();
  ctx.setLineDash([8, 4]);
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.setLineDash(lineDash);
}

function rect(ctx: CanvasRenderingContext2D, bounds: IBounds) {
  const lineDash = ctx.getLineDash();
  ctx.setLineDash([]);
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.setLineDash(lineDash);
}

// This seems to take too much time on each draw. Instead use OverlayGrid SVG
function grid(ctx: CanvasRenderingContext2D) {
  let img = new Image();
  let svg = new Blob([grid_data], { type: 'image/svg+xml;charset=utf-8' });
  let url = URL.createObjectURL(svg);

  img.onload = function () {
    ctx.drawImage(img, 0, 0);
  };

  img.src = url;
}

export default { element, dashedRect, rect };
