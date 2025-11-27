import { updateState, useStore } from '@/state';
import { applySelected } from '@/state/actions/select';
import { MouseMove } from '@/types';
import { ModeHandler, PointerEvent } from '@/editor/modes/types';
import { expandIBound, IBounds, insideBound } from '@/element';
import _ from 'lodash';

/**
 * Selecting Mode - Handles box selection of elements
 *
 * **Transitions:**
 * ```txt
 * pointer up → idle
 * ```
 */
export const SelectingMode: ModeHandler = {
  onPointerDown: (_e: PointerEvent, _mouseMove: MouseMove) => {
    // Already selecting, shouldn't happen
  },

  onPointerMove: (_e: PointerEvent, mouseMove: MouseMove) => {
    const { interactionMode, elements } = useStore.getState();
    if (interactionMode.type !== 'selecting') return;

    // Expand selection box
    const expandedBounds = expandIBound(interactionMode.bounds, mouseMove);

    // Find elements inside selection box
    const toSelect = _.map(
      _.filter(_.values(elements), (element) => insideBound(element, expandedBounds)),
      (element) => element.id
    );

    updateSelection(expandedBounds, toSelect);
  },

  onPointerUp: (_e: PointerEvent, _mouseMove: MouseMove) => {
    // End selecting
    updateState((state) => {
      state.interactionMode = { type: 'idle' };
    });
  },
};

/**
 * Updates selection state in a single atomic update.
 */
const updateSelection = (expandedBounds: IBounds, toSelect: string[]) => {
  updateState((state) => {
    applySelected(state, toSelect);
    state.interactionMode = { type: 'selecting', bounds: expandedBounds };
  });
};