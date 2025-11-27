import { useStore, actions } from '@/state';
import { X_SCALE, Y_SCALE } from '@/constants';
import { MouseMove } from '@/types';
import { ModeHandler, PointerEvent } from '@/editor/modes/types';

/**
 * Panning Mode - Handles grid-stepped canvas panning
 *
 * **Transitions:**
 * ```txt
 * pointer up → idle
 * ```
 */
export const PanningMode: ModeHandler = {
  onPointerDown: (_e: PointerEvent, _mouseMove: MouseMove) => {
    // Never called - mode transition happens in idle's onPointerDown
  },

  onPointerMove: (_e: PointerEvent, mouseMove: MouseMove) => {
    // Grid-stepped panning - only move in full grid cells
    const { cols, rows } = mouseMove.getGridCellsMoved();

    if (cols !== 0 || rows !== 0) {
      // TODO: Scaling wont be needed once we switch elements to 
      // be positioned based on grid cells instead of raw points.
      actions.shiftElements(cols * X_SCALE, rows * Y_SCALE);
    }
  },

  onPointerUp: (_e: PointerEvent, _mouseMove: MouseMove) => {
    useStore.setState({
      interactionMode: { type: 'idle' }
    });
  },
};
