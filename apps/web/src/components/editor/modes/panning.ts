import React from 'react';
import { useStore, actions } from '../../../state';
import { X_SCALE, Y_SCALE } from '../../../constants';
import { MouseMove } from '../../../types';
import { ModeHandler } from './types';

function clipToScale(value: number, scale: number) {
  return Math.floor(value / scale) * scale;
}

let previousEvent: React.MouseEvent<HTMLCanvasElement, MouseEvent> | null = null;

export const PanningMode: ModeHandler = {
  onPointerDown: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    previousEvent = e;
  },

  onPointerMove: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    // Initialize on first move
    if (!previousEvent) {
      previousEvent = e;
      return;
    }
    
    const x_by = e.clientX - previousEvent.clientX;
    const y_by = e.clientY - previousEvent.clientY;
    actions.shiftElements(x_by, y_by);
    
    previousEvent = e;
  },

  onPointerUp: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    actions.sanitizeElements();
    useStore.setState({
      interactionMode: { type: 'idle' },
      canvasDrag: 'inactive',
    });
    previousEvent = null;
  },
};
