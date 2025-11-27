import produce from 'immer';
import type { Draft } from 'immer';
import * as actions from './actions';
import { useStore } from './store';
import type { AppState } from './store';

export { useStore };
export type { AppState };
export { actions };

/**
 * Helper to update state with immer produce.
 * Abstracts away the boilerplate of useStore.setState(produce(...))
 */
export const updateState = (updater: (state: Draft<AppState>) => void) => {
  useStore.setState(produce<AppState>(updater));
};
