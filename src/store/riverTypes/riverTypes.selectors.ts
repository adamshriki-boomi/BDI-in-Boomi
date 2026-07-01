import { createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { RiverTypeProperties } from 'api/types';
import { AppState } from 'store/reducers';
import { getOId } from 'utils/api.sanitizer';
import { IRiverTypesState, REDUCER_KEY } from './riverTypes.types';

export const adapter = createEntityAdapter<RiverTypeProperties>({
  selectId: item => getOId(item._id),
});

export const selectors = adapter.getSelectors();

export const selectRiverTypes = (state: AppState): IRiverTypesState =>
  state[REDUCER_KEY];
export const selectRiverTypesEntities = createSelector(
  selectRiverTypes,
  selectors.selectEntities,
);
export const selectRiverTypesArray = createSelector(
  selectRiverTypes,
  selectors.selectAll,
);
export const selectTotalRiverTypes = createSelector(
  selectRiverTypes,
  selectors.selectTotal,
);
export const selectLoading = createSelector(
  selectRiverTypes,
  state => state.loading,
);
