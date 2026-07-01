import { createSlice } from '@reduxjs/toolkit';
import { fetchRiverTypes } from './riverTypes.effects';
import { adapter } from './riverTypes.selectors';
import { IRiverTypesState, REDUCER_KEY } from './riverTypes.types';

export const initialState: IRiverTypesState = {
  ids: [],
  entities: {},
  loading: false,
};
export const slice = createSlice({
  name: REDUCER_KEY,
  initialState: adapter.getInitialState<IRiverTypesState>(initialState),
  reducers: {
    clear(state) {
      adapter.removeAll(state);
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchRiverTypes.fulfilled, (state, action) => {
      adapter.upsertMany(state, action.payload);
    });
  },
});
