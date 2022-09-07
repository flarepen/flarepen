import produce from 'immer';
import _ from 'lodash';
import { AppState, useStore } from '../store';
import { snapshot } from './undo';

export const select = (id: number, doSnapshot = true) => {
  doSnapshot && snapshot();

  if (_.includes(useStore.getState().selectedIds, id)) {
    return null;
  }

  useStore.setState(
    produce<AppState>((state) => {
      state.selectedIds.push(id);
    })
  );
};

export const unselect = (selectedId: number, doSnapshot = true) => {
  doSnapshot && snapshot();

  useStore.setState(
    produce<AppState>((state) => {
      const index = state.selectedIds.findIndex((id: number) => selectedId === id);
      if (index !== -1) {
        state.selectedIds.splice(index, 1);
      }
    })
  );
};

export const resetSelected = (ids: number[], doSnapshot = true) => {
  doSnapshot && snapshot();

  useStore.setState((state) => ({ selectedIds: ids }));
};