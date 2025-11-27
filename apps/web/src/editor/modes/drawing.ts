import React from 'react';
import { useStore, actions } from '@/state';
import { utilFor, ElementType } from '@/element';
import { X_SCALE, Y_SCALE, DRAGGING_THRESHOLD } from '@/constants';
import { MouseMove } from '@/types';
import { Tool } from '@/tools';
import { ModeHandler } from '@/editor/modes/types';

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

    // Handle multi-segment Line/Arrow
    if (interactionMode.stage === 'pending' && 
        (interactionMode.element.type === ElementType.Line || 
         interactionMode.element.type === ElementType.Arrow)) {
      
      const detail = (e.nativeEvent as MouseEvent).detail || 0;
      console.log('[DrawingMode] Click detail:', detail);
      
      // Skip adding point on double-click (will be handled by handleClick)
      if (detail === 2) {
        console.log('[DrawingMode] Double-click detected, skipping point add');
        return;
      }
      
      const newPoint = {
        x: clipToScale(e.clientX, X_SCALE),
        y: clipToScale(e.clientY, Y_SCALE),
      };
      
      console.log('[DrawingMode] Adding point:', newPoint);
      
      // Initialize points array if not exists
      if (!interactionMode.element.points) {
        interactionMode.element.points = [{ x: interactionMode.element.x, y: interactionMode.element.y }];
      }
      
      // Skip duplicate points
      const lastPoint = interactionMode.element.points[interactionMode.element.points.length - 1];
      if (lastPoint.x === newPoint.x && lastPoint.y === newPoint.y) {
        console.log('[DrawingMode] Skipping duplicate point');
        return;
      }
      
      // Add new point
      const updatedElement = {
        ...interactionMode.element,
        points: [...interactionMode.element.points, newPoint],
      };
      
      console.log('[DrawingMode] Total points:', updatedElement.points.length);
      
      useStore.setState({
        interactionMode: {
          ...interactionMode,
          element: updatedElement,
        },
        draft: { element: updatedElement, stage: 'pending' },
      });
      return;
    }

    // Second click finalizes other elements (Rectangle) in pending mode
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

    // Multi-segment Line/Arrow - update preview via create function
    if (interactionMode.stage === 'pending' &&
        (interactionMode.element.type === ElementType.Line || 
         interactionMode.element.type === ElementType.Arrow) &&
        interactionMode.element.points) {
      
      utilFor(interactionMode.element).create(interactionMode.element, mouseMove, (updated) => {
        useStore.setState({
          draft: { element: updated, stage: 'pending' },
        });
      });
      return;
    }

    // Single-segment or active stage - use existing behavior
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
