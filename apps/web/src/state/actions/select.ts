import produce from 'immer';
import type { Draft } from 'immer';
import _ from 'lodash';
import { Element } from '../../element';
import { AppState, useStore } from '../store';
import { updateState } from '../index';
import { snapshot, applySnapshot } from './undo';

export const select = (id: string, only: boolean, doSnapshot = true) => {
  doSnapshot && snapshot();

  const groupId = useStore.getState().groupForElement[id];

  if (groupId && _.includes(useStore.getState().selectedGroupIds, groupId)) {
    return null;
  }

  if (_.includes(useStore.getState().selectedIds, id)) {
    // Remove from selection if already selected in multi select mode
    if (!only) {
      useStore.setState(
        produce<AppState>((state) => {
          state.selectedIds = _.without(state.selectedIds, id);
        })
      );
    }

    return;
  }

  useStore.setState(
    produce<AppState>((state) => {
      if (groupId) {
        if (only) {
          state.selectedGroupIds = [groupId];
          state.selectedIds = [];
        } else {
          state.selectedGroupIds.push(groupId);
        }
      } else {
        if (only) {
          state.selectedIds = [id];
          state.selectedGroupIds = [];
        } else {
          state.selectedIds.push(id);
        }
      }
    })
  );
};

/**
 * Helper that mutates draft state - separates element IDs into
 * standalone elements vs grouped elements (reusable in updateState)
 */
export const applySelected = (state: Draft<AppState>, ids: string[]) => {
  const idsToSelect = _.reduce(
    ids,
    (result, elementId) => {
      const groupId = state.groupForElement[elementId];
      if (groupId) {
        result.groupIds.push(groupId);
      } else {
        result.elementIds.push(elementId);
      }
      return result;
    },
    {
      groupIds: [] as string[],
      elementIds: [] as string[],
    }
  );

  state.selectedIds = _.uniq(idsToSelect.elementIds);
  state.selectedGroupIds = _.uniq(idsToSelect.groupIds);
};

// Old API stays for compatibility (uses the helper)
export const setSelected = (ids: string[], doSnapshot = true) => {
  updateState((state) => {
    if (doSnapshot) {
      applySnapshot(state);
    }
    applySelected(state, ids);
  });
};

export const unSelectAll = (doSnapshot = true) => {
  doSnapshot && snapshot();

  useStore.setState((state) => ({ selectedIds: [], selectedGroupIds: [] }));
};

export const selectAll = (doSnapshot = true) => {
  doSnapshot && snapshot();

  const elementsToSelect = _.keys(useStore.getState().elements);
  const groupsToSelect = _.keys(useStore.getState().groups);

  useStore.setState((_state) => ({
    selectedIds: elementsToSelect,
    selectedGroupIds: groupsToSelect,
  }));
};

export const updateAllSelected = (update: (element: Element) => void, doSnapshot = true) => {
  doSnapshot && snapshot();

  useStore.setState(
    produce<AppState>((state) => {
      // Update Groups
      state.selectedGroupIds.forEach((groupId) => {
        state.groups[groupId].elementIds.forEach((elementId) => {
          update(state.elements[elementId]);
        });
      });

      // Update Elements
      state.selectedIds.forEach((elementId) => {
        update(state.elements[elementId]);
      });
    })
  );
};

export const deleteAllSelected = (doSnapshot = true) => {
  doSnapshot && snapshot();

  useStore.setState(
    produce<AppState>((state) => {
      state.selectedGroupIds.forEach((groupId) => {
        state.groups[groupId].elementIds.forEach((elementId) => {
          delete state.elements[elementId];
        });
      });

      state.selectedIds.forEach((elementId) => {
        delete state.elements[elementId];
      });
    })
  );
};
