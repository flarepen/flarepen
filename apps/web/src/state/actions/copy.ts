import _ from 'lodash';
import { AppState, useStore } from '../store';
import { snapshot } from './undo';
import { elementIDGenerator, groupIDGenerator } from '../../id';
import produce from 'immer';
import { X_SCALE, Y_SCALE } from '../../constants';

export const copy = (elementIds: string[], groupIds: string[]) => {
  const elements = _.map(elementIds, (id) => useStore.getState().elements[id]);
  const elementsFromGroups = _.flatMap(groupIds, (groupId) => {
    return _.map(useStore.getState().groups[groupId].elementIds, (elementId) => {
      return useStore.getState().elements[elementId];
    });
  });
  const groups = _.map(groupIds, (id) => useStore.getState().groups[id]);

  useStore.setState((state) => ({
    clipboard: {
      elementIds: _.clone(elementIds),
      elements: [..._.cloneDeep(elements), ..._.cloneDeep(elementsFromGroups)],
      groups: [..._.cloneDeep(groups)],
    },
  }));
};

export const paste = (doSnapshot = true) => {
  doSnapshot && snapshot();

  const elementIds = useStore.getState().clipboard.elementIds;
  const elements = useStore.getState().clipboard.elements;
  const groups = useStore.getState().clipboard.groups;

  useStore.setState(
    produce<AppState>((state) => {
      // Generate elements with new IDs

      const idMap = new Map();
      elements.map((element) => {
        const newId = elementIDGenerator.getNextID();

        idMap.set(element.id, newId); // Need this to create groups in next step.

        state.elements[newId] = {
          ...element,
          id: newId,
          x: element.x + X_SCALE,
          y: element.y + Y_SCALE,
        };
      });

      // Generate groups with new Ids

      const newGroupIds: string[] = [];
      groups.map((group) => {
        const newId = groupIDGenerator.getNextID();
        const newGroup = { id: newId, elementIds: group.elementIds.map((id) => idMap.get(id)) };

        newGroupIds.push(newId);

        state.groups[newId] = newGroup;
        newGroup.elementIds.forEach((elementId) => {
          state.groupForElement[elementId] = newId;
        });
      });

      // Select new elements and groups
      state.selectedIds = _.map(elementIds, (id) => idMap.get(id));
      state.selectedGroupIds = newGroupIds;
    })
  );
};
