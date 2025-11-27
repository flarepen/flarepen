import { updateState, useStore, actions } from '@/state';
import { applySanitizeElements } from '@/state/actions/elements';
import { MouseMove } from '@/types';
import { ModeHandler, PointerEvent } from '@/editor/modes/types';
import { handlerFor } from '@/element';

/**
 * Editing Mode - Handles element resize/edit via edit handles
 *
 * **Transitions:**
 * ```txt
 * pointer up → idle
 * ```
 */
export const EditingMode: ModeHandler = {
  onPointerDown: (_e: PointerEvent, _mouseMove: MouseMove) => {
    // Already editing
  },

  onPointerMove: (_e: PointerEvent, mouseMove: MouseMove) => {
    const { interactionMode, elements } = useStore.getState();
    if (interactionMode.type !== 'editing') return;

    // Edit element using handle
    const element = elements[interactionMode.elementId];
    if (element) {
      actions.updateElement(
        interactionMode.elementId,
        handlerFor(element).edit(element, mouseMove, interactionMode.handleId)
      );
    }
  },

  onPointerUp: (_e: PointerEvent, _mouseMove: MouseMove) => {
    // End editing, sanitize elements
    updateState((state) => {
      // TODO: Do we really need to sanitize?
      applySanitizeElements(state);
      state.interactionMode = { type: 'idle' };
    });
  },
};
