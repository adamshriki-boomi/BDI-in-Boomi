import { createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { IRiver } from 'api/types';
import { AppState } from 'store/reducers';
import { getCrossId } from 'utils/api.sanitizer';
import { IActionRiversState, REDUCER_KEY } from './actionRivers.types';

export const adapter = createEntityAdapter<IRiver>({
  selectId: getCrossId,
});

export const selectors = adapter.getSelectors();

export const selectActionRivers = (state: AppState): IActionRiversState =>
  state[REDUCER_KEY];

export const selectActionRiversEntities = createSelector(
  selectActionRivers,
  selectors.selectEntities,
);
export const selectActionRiversArray = createSelector(
  selectActionRivers,
  selectors.selectAll,
);
export const selectTotalActionRivers = createSelector(
  selectActionRivers,
  selectors.selectTotal,
);

export const selectLoading = createSelector(
  selectActionRivers,
  state => state.loading,
);
