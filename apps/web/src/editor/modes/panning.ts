import React from 'react';
import { useStore, actions } from '../../state';
import { X_SCALE, Y_SCALE } from '../../constants';
import { MouseMove } from '../../types';
import { ModeHandler, PointerEvent } from './types';

export const PanningMode: ModeHandler = {
  onPointerDown: (e: PointerEvent, mouseMove: MouseMove) => {
    // Never called - mode transition happens in idle's onPointerDown
  },

  onPointerMove: (e: PointerEvent, mouseMove: MouseMove) => {
    // Grid-stepped panning - only move in full grid cells
    const { cols, rows } = mouseMove.getGridCellsMoved();

    if (cols !== 0 || rows !== 0) {
      actions.shiftElements(cols * X_SCALE, rows * Y_SCALE);
    }
  },

  onPointerUp: (e: PointerEvent, mouseMove: MouseMove) => {
    // No sanitize needed - already grid-aligned
    useStore.setState({
      interactionMode: { type: 'idle' },
      canvasDrag: 'inactive',
    });
  },
};
