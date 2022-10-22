import produce from 'immer';
import { AppState, Snapshot, useStore } from '../store';

export const snapshot = () => {
  useStore.setState(
    produce<AppState>((state) => {
      state.past.push({
        elements: state.elements,
        selectedIds: state.selectedIds,
        groups: state.groups,
        groupForElement: state.groupForElement,
        selectedGroupIds: state.selectedGroupIds,
      });
      state.future = [];
    })
  );
};

export const undo = () =>
  useStore.setState(
    produce<AppState>((state) => {
      // Fetch past snapshot
      const lastSnapshot = state.past.pop();
      if (lastSnapshot) {
        // Push current snapshot to future
        state.future.push({
          elements: state.elements,
          selectedIds: state.selectedIds,
          groups: state.groups,
          groupForElement: state.groupForElement,
          selectedGroupIds: state.selectedGroupIds,
        });
        // Apply past snapshot
        state.elements = lastSnapshot.elements;
        state.selectedIds = lastSnapshot.selectedIds;
        state.groups = lastSnapshot.groups;
        state.groupForElement = lastSnapshot.groupForElement;
        state.selectedGroupIds = lastSnapshot.selectedGroupIds;
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
        state.past.push({
          elements: state.elements,
          selectedIds: state.selectedIds,
          groups: state.groups,
          groupForElement: state.groupForElement,
          selectedGroupIds: state.selectedGroupIds,
        });
        // Apply future snapshot
        state.elements = nextSnapshot.elements;
        state.selectedIds = nextSnapshot.selectedIds;
        state.groups = nextSnapshot.groups;
        state.groupForElement = nextSnapshot.groupForElement;
        state.selectedGroupIds = nextSnapshot.selectedGroupIds;
      }
    })
  );
