import React from 'react';
import { MouseMove } from '@/types';

export type PointerEvent = React.MouseEvent<HTMLCanvasElement, MouseEvent>;

export interface ModeHandler {
  onPointerDown: (e: PointerEvent, mouseMove: MouseMove) => void;
  onPointerMove: (e: PointerEvent, mouseMove: MouseMove) => void;
  onPointerUp: (e: PointerEvent, mouseMove: MouseMove) => void;
}
