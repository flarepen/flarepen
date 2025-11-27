import { updateState, useStore } from '@/state';
import { applySnapshot } from '@/state/actions/undo';
import { MouseMove, InteractionMode } from '@/types';
import { Tool } from '@/tools';
import { ModeHandler, PointerEvent } from '@/editor/modes/types';

/**
 * Finalizes text editing in a single atomic state update.
 * Adds element to canvas, creates undo snapshot, switches tool, and returns to idle mode.
 */
const commitTextEdit = (interactionMode: InteractionMode, toolLocked: boolean) => {
  updateState((state) => {
    if (interactionMode.type !== 'textEditing') return;

    if (interactionMode.text.content) {
      applySnapshot(state);
      state.elements[interactionMode.text.id] = interactionMode.text;
    }

    if (!toolLocked) {
      state.tool = Tool.Select;
    }

    state.interactionMode = { type: 'idle' };
  });
};

/**
 * Text Editing Mode - Handles text input via TextInput component
 *
 * **Transitions:**
 * ```txt
 * pointer down → idle (finalizes text if content exists)
 * ```
 */
export const TextEditingMode: ModeHandler = {
  onPointerDown: (_e: PointerEvent, _mouseMove: MouseMove) => {
    const { interactionMode, toolLocked } = useStore.getState();
    if (interactionMode.type !== 'textEditing') return;

    commitTextEdit(interactionMode, toolLocked);
  },

  onPointerMove: (_e: PointerEvent, _mouseMove: MouseMove) => {
    // No movement handling needed for text editing
  },

  onPointerUp: (_e: PointerEvent, _mouseMove: MouseMove) => {
    // Nothing to do
  },
};
