/**
 * Converts viewport-relative mouse coordinates to canvas-relative coordinates
 */
export function getCanvasCoordinates(
  e: React.MouseEvent<HTMLCanvasElement>,
  canvasElement: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvasElement.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}
