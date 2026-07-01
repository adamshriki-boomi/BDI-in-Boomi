import { bindActionCreators, createSlice } from '@reduxjs/toolkit';
import { BaseQueryApi } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface ActivitiesState {
  filterId: string;
}
const initialState: ActivitiesState = {
  filterId: null,
};
const REDUCER_KEY = 'activities';

const slice = createSlice({
  name: REDUCER_KEY,
  initialState,
  reducers: {
    clear(state) {
      state.filterId = null;
    },
    save(state, { payload }) {
      state.filterId = payload;
    },
  },
});
export const saveFilterId = slice.actions.save;
export const activitiesSliceApi = {
  reducer: { [slice.name]: slice.reducer },
  // with manual logout, auto sign in should not trigger
  initialState,
};
function selectActivitiesStore(state): ActivitiesState {
  return state[REDUCER_KEY];
}
function selectFilterId(state: ActivitiesState) {
  return state.filterId;
}
export function useActivitiesFilter(): ActivitiesState {
  const state = useSelector(selectActivitiesStore);
  return state;
}

export function useActivitiesFilterActions() {
  const dispatch = useDispatch();
  const bindedActions = useMemo(
    () => bindActionCreators(slice.actions, dispatch),
    [dispatch],
  );

  return bindedActions;
}

export function resolveFilterId(state) {
  const cache_context_id = selectFilterId(selectActivitiesStore(state));
  return cache_context_id ? { cache_context_id } : {};
}

export function dispatchFilterIdUpdate(api: BaseQueryApi, filterId: string) {
  if (filterId) {
    api.dispatch(saveFilterId(filterId));
  }
}
