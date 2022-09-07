import produce from 'immer';
import { AppState, useStore } from '../store';

export const snapshot = () =>
  useStore.setState(
    produce<AppState>((state) => {
      state.past.push({ elements: state.elements, selectedIds: state.selectedIds });
      state.future = [];
    })
  );

export const undo = () =>
  useStore.setState(
    produce<AppState>((state) => {
      // Fetch past snapshot
      const lastSnapshot = state.past.pop();
      if (lastSnapshot) {
        // Push current snapshot to future
        state.future.push({ elements: state.elements, selectedIds: state.selectedIds });
        // Apply past snapshot
        state.elements = lastSnapshot.elements;
        state.selectedIds = lastSnapshot.selectedIds;
      }
    })
  );

export const redo = () =>
  useStore.setState(
    produce<AppState>((state) => {
      // Fetch future snapshot
      const nextSnapshot = state.future.pop();
      if (nextSnapshot) {
        // Push current snapshot to past
        state.past.push({ elements: state.elements, selectedIds: state.selectedIds });
        // Apply future snapshot
        state.elements = nextSnapshot.elements;
        state.selectedIds = nextSnapshot.selectedIds;
      }
    })
  );
