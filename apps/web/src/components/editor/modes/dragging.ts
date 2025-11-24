import React from 'react';
import { useStore, actions } from '../../../state';
import { X_SCALE, Y_SCALE } from '../../../constants';
import { MouseMove } from '../../../types';
import { ModeHandler } from './types';

function clipToScale(value: number, scale: number) {
  return Math.floor(value / scale) * scale;
}

export const DraggingMode: ModeHandler = {
  onPointerDown: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    // Already dragging
  },

  onPointerMove: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    const { interactionMode, selectedIds, selectedGroupIds } = useStore.getState();
    if (interactionMode.type !== 'dragging') return;

    // Drag selected elements
    if (selectedIds.length > 0 || selectedGroupIds.length > 0) {
      actions.drag(mouseMove);
    }

    // Update current cell
    useStore.setState({
      currentCell: {
        x: clipToScale(e.clientX, X_SCALE),
        y: clipToScale(e.clientY - Y_SCALE / 2, Y_SCALE) + Y_SCALE / 2,
      },
    });
  },

  onPointerUp: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    // End dragging, sanitize elements
    actions.sanitizeElements();
    useStore.setState({
      interactionMode: { type: 'idle' },
      dragging: false,
    });
  },
};
