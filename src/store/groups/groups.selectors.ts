import { createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { IGroup } from 'api/types';
import { AppState } from 'store/reducers';
import { getOId } from 'utils/api.sanitizer';
import { IGroupsState, REDUCER_KEY } from './groups.types';

export const adapter = createEntityAdapter<IGroup>({
  selectId: item => getOId(item.cross_id),
  sortComparer: (a, b) => 1, // keep natural sort order, see DEV-1291
});

export const selectors = adapter.getSelectors();

export const selectGroups = (state: AppState): IGroupsState =>
  state[REDUCER_KEY];
export const selectGroupsEntities = createSelector(
  selectGroups,
  selectors.selectEntities,
);
export const selectGroupsArray = createSelector(
  selectGroups,
  selectors.selectAll,
);
export const selectTotalGroups = createSelector(
  selectGroups,
  selectors.selectTotal,
);
export const selectLoading = createSelector(
  selectGroups,
  state => state.loading,
);
export const selectDefaultGroup = createSelector(selectGroupsArray, groups => {
  return groups?.find(group => Boolean(group?.is_default));
});
