import { createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { IRiver } from 'api/types';
import { AppState } from '../reducers';
import { IRiversState, REDUCER_KEY } from './rivers.types';

export const adapter = createEntityAdapter<IRiver>({
  selectId: item => item._id.$oid,
});

export const selectors = adapter.getSelectors();

export const selectRivers = (state: AppState): IRiversState =>
  state[REDUCER_KEY];
export const selectRiversEntities = createSelector(
  selectRivers,
  selectors.selectEntities,
);
export const selectRiversArray = createSelector(
  selectRivers,
  selectors.selectAll,
);
export const selectTotalRivers = createSelector(
  selectRivers,
  selectors.selectTotal,
);
export const selectSelectedRivers = createSelector(selectRivers, state =>
  selectors.selectById(state, state.selectedId),
);
