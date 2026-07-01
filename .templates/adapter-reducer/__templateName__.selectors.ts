import { createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { AppState } from 'store/reducers';
import {
  I__templateNameToPascalCase__Entity,
  I__templateNameToPascalCase__State,
  REDUCER_KEY,
} from './__templateName__.types';

export const adapter = createEntityAdapter<I__templateNameToPascalCase__Entity>({
  selectId: item => item.id,
});

export const selectors = adapter.getSelectors();

export const select__templateNameToPascalCase__ = (state: AppState): I__templateNameToPascalCase__State =>
  state[REDUCER_KEY];
export const select__templateNameToPascalCase__Entities = createSelector(
  select__templateNameToPascalCase__,
  selectors.selectEntities,
);
export const select__templateNameToPascalCase__Array = createSelector(
  select__templateNameToPascalCase__,
  selectors.selectAll,
);
export const selectTotal__templateNameToPascalCase__ = createSelector(
  select__templateNameToPascalCase__,
  selectors.selectTotal,
);
export const selectSelected__templateNameToPascalCase__ = createSelector(select__templateNameToPascalCase__, state =>
  selectors.selectById(state, state.selectedId),
);
