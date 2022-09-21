import produce from 'immer';
import { snapshot } from './undo';
import { groupIDGenerator } from '../../id';
import { AppState, useStore } from '../store';
import _ from 'lodash';

/**
 * Groups currently selected groups and elements into a new group.
 *
 * @param doSnapshot Do Snapshot for undo/redo
 */
export const group = (doSnapshot = true) => {
  doSnapshot && snapshot();

  const state = useStore.getState();

  // Find all elements to group
  let elementIds = _.flatMap(state.selectedGroupIds, (groupId) => {
    return state.groups[groupId].elementIds;
  });
  elementIds = elementIds.concat(state.selectedIds);

  useStore.setState(
    produce<AppState>((state) => {
      // Remove current groups
      state.selectedGroupIds.forEach((groupId) => {
        delete state.groups[groupId];
      });

      // Add new group
      const id = groupIDGenerator.getNextID();
      state.groups[id] = {
        id,
        elementIds,
      };

      // Update element to group mapping
      elementIds.forEach((elementID) => {
        state.groupForElement[elementID] = id;
      });

      // Select new group
      state.selectedIds = [];
      state.selectedGroupIds = [id];
    })
  );
};

/**
 * Ungroups currently selected groups.
 *
 * @param doSnapshot Do Snapshot for undo/redo
 */
export const ungroup = (doSnapshot = true) => {
  doSnapshot && snapshot();

  const state = useStore.getState();

  // Find all elements in the groups
  let elementIds = _.flatMap(state.selectedGroupIds, (groupId) => {
    return state.groups[groupId].elementIds;
  });

  useStore.setState(
    produce<AppState>((state) => {
      // Delete Groups
      state.selectedGroupIds.forEach((groupId) => {
        delete state.groups[groupId];
      });

      // Delete element Id reverse mappings
      elementIds.forEach((elementId) => {
        delete state.groupForElement[elementId];
      });

      // Select elements instead of group
      state.selectedGroupIds = [];
      state.selectedIds = state.selectedIds.concat(elementIds);
    })
  );
};
