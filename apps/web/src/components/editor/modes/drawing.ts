import React from 'react';
import { useStore, actions } from '../../../state';
import { utilFor, ElementType } from '../../../element';
import { X_SCALE, Y_SCALE, DRAGGING_THRESHOLD } from '../../../constants';
import { MouseMove } from '../../../types';
import { Tool } from '../../../tools';
import { ModeHandler } from './types';

function clipToScale(value: number, scale: number) {
  return Math.floor(value / scale) * scale;
}

function sanitizeElement(element: any) {
  if (element.type === ElementType.Rectangle) {
    return {
      ...element,
      x: clipToScale(element.x, X_SCALE),
      y: clipToScale(element.y, Y_SCALE),
      width: Math.abs(element.width),
      height: Math.abs(element.height),
    };
  }
  return {
    ...element,
    x: clipToScale(element.x, X_SCALE),
    y: clipToScale(element.y, Y_SCALE),
  };
}

export const DrawingMode: ModeHandler = {
  onPointerDown: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    const { interactionMode, toolLocked } = useStore.getState();
    if (interactionMode.type !== 'drawing') return;

    // Second click finalizes the drawing (only in pending mode)
    if (interactionMode.stage === 'pending') {
      actions.addElement(sanitizeElement(interactionMode.element), false);
      actions.select(interactionMode.element.id, true);
      
      if (!toolLocked) {
        actions.setTool(Tool.Select);
      }
      
      useStore.setState({
        interactionMode: { type: 'idle' },
        draft: null,
      });
    }
  },

  onPointerMove: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    const { interactionMode } = useStore.getState();
    if (interactionMode.type !== 'drawing') return;

    let currentStage = interactionMode.stage;

    // Switch from pending to active if dragged beyond threshold
    if (interactionMode.stage === 'pending' && e.buttons > 0) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - interactionMode.element.x, 2) + 
        Math.pow(e.clientY - interactionMode.element.y, 2)
      );

      if (distance > DRAGGING_THRESHOLD) {
        currentStage = 'active';
      }
    }

    // Update element
    utilFor(interactionMode.element).create(interactionMode.element, mouseMove, (updated) => {
      useStore.setState({
        interactionMode: { type: 'drawing', element: updated, stage: currentStage },
        draft: { element: updated, stage: currentStage },
      });
    });

    // Update current cell
    useStore.setState({
      currentCell: {
        x: clipToScale(e.clientX, X_SCALE),
        y: clipToScale(e.clientY - Y_SCALE / 2, Y_SCALE) + Y_SCALE / 2,
      },
    });
  },

  onPointerUp: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>, mouseMove: MouseMove) => {
    const { interactionMode, toolLocked } = useStore.getState();
    if (interactionMode.type !== 'drawing') return;

    // Only finalize if in active (drag) mode, not pending (click-move-click)
    if (interactionMode.stage === 'active') {
      actions.addElement(sanitizeElement(interactionMode.element), false);
      actions.select(interactionMode.element.id, true);
      
      if (!toolLocked) {
        actions.setTool(Tool.Select);
      }
      
      useStore.setState({
        interactionMode: { type: 'idle' },
        draft: null,
      });
    }
  },
};
