export type CanvasEvent = {};
export interface CanvasComponent {
  draw: () => void;
  accept: (e: CanvasEvent) => void;
}
