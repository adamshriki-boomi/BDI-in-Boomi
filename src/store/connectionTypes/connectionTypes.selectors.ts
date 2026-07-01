import { createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { IConnectionType } from 'api/types';
import { AppState } from 'store/reducers';
import { getCrossId } from 'utils/api.sanitizer';
import { IRiverConnectionsState, REDUCER_KEY } from './connectionTypes.types';

export const adapter = createEntityAdapter<IConnectionType>({
  selectId: item => getCrossId(item),
});

export const selectors = adapter.getSelectors();

export const selectConnectionTypes = (
  state: AppState,
): IRiverConnectionsState => state[REDUCER_KEY];
export const selectConnectionTypesEntities = createSelector(
  selectConnectionTypes,
  selectors.selectEntities,
);
export const selectConnectionTypesArray = createSelector(
  selectConnectionTypes,
  selectors.selectAll,
);
export const selectTotalConnectionTypes = createSelector(
  selectConnectionTypes,
  selectors.selectTotal,
);
export const selectSelectedConnectionTypes = createSelector(
  selectConnectionTypes,
  state => selectors.selectById(state, state.selectedId),
);
export const selectLoading = createSelector(
  selectConnectionTypes,
  state => state.loading,
);
