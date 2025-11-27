import { useStore, actions } from '@/state';
import { X_SCALE, Y_SCALE } from '@/constants';
import { MouseMove } from '@/types';
import { ModeHandler, PointerEvent } from '@/editor/modes/types';
import { utilFor } from '@/element';

function clipToScale(value: number, scale: number) {
  return Math.floor(value / scale) * scale;
}

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
        utilFor(element).edit(element, mouseMove, interactionMode.handleId)
      );
    }
  },

  onPointerUp: (_e: PointerEvent, _mouseMove: MouseMove) => {
    // End editing, sanitize elements
    actions.sanitizeElements();
    useStore.setState({
      interactionMode: { type: 'idle' },
    });
  },
};
