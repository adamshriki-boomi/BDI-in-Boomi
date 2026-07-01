import { createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { IConnection } from 'api/types';
import { AppState } from 'store/reducers';
import { getCrossId } from 'utils/api.sanitizer';
import { IConnectionsState, REDUCER_KEY } from './connections.types';

export const adapter = createEntityAdapter<IConnection>({
  selectId: getCrossId,
});

export const selectors = adapter.getSelectors();

export const selectConnections = (state: AppState): IConnectionsState =>
  state[REDUCER_KEY];
export const selectConnectionsEntities = createSelector(
  selectConnections,
  selectors.selectEntities,
);
export const selectConnectionsArray = createSelector(
  selectConnections,
  selectors.selectAll,
);
export const selectTotalConnections = createSelector(
  selectConnections,
  selectors.selectTotal,
);
export const selectSelectedConnections = createSelector(
  selectConnections,
  state => selectors.selectById(state, state.selectedId),
);
