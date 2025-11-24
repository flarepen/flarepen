import React from 'react';
import { useStore, actions } from '../../state';
import { X_SCALE, Y_SCALE } from '../../constants';
import { MouseMove } from '../../types';
import { Tool } from '../../tools';
import { ModeHandler } from './types';

function clipToScale(value: number, scale: number) {
  return Math.floor(value / scale) * scale;
}

function sanitizeElement(element: any) {
  return {
    ...element,
    x: clipToScale(element.x, X_SCALE),
    y: clipToScale(element.y, Y_SCALE),
  };
}

export const TextEditingMode: ModeHandler = {
  onPointerDown: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    const { interactionMode, toolLocked } = useStore.getState();
    if (interactionMode.type !== 'textEditing') return;

    // Click finalizes text editing
    if (interactionMode.text.content) {
      actions.addElement(sanitizeElement(interactionMode.text));
    }
    
    if (!toolLocked) {
      actions.setTool(Tool.Select);
    }
    
    useStore.setState({
      interactionMode: { type: 'idle' },
    });
  },

  onPointerMove: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    // No movement handling needed for text editing
  },

  onPointerUp: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    // Nothing to do
  },
};
