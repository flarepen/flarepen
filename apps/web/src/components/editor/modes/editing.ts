import React from 'react';
import { useStore, actions } from '../../../state';
import { X_SCALE, Y_SCALE } from '../../../constants';
import { MouseMove } from '../../../types';
import { ModeHandler } from './types';
import { utilFor } from '../../../element';

function clipToScale(value: number, scale: number) {
  return Math.floor(value / scale) * scale;
}

export const EditingMode: ModeHandler = {
  onPointerDown: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    // Already editing
  },

  onPointerMove: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    const { interactionMode, elements } = useStore.getState();
    if (interactionMode.type !== 'editing') return;

    // Edit element using handle
    const element = elements[interactionMode.elementId];
    if (element) {
      actions.updateElement(
        interactionMode.elementId,
        utilFor(element).edit(element, mouseMove, interactionMode.handleType)
      );
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
    // End editing, sanitize elements
    actions.sanitizeElements();
    actions.setEditingContext({ id: null, handleType: null });
    useStore.setState({
      interactionMode: { type: 'idle' },
    });
  },
};
