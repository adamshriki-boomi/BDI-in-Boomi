import { createSlice } from '@reduxjs/toolkit';
import { fetchActionRivers } from './actionRivers.effects';
import { adapter } from './actionRivers.selectors';
import { IActionRiversState, REDUCER_KEY } from './actionRivers.types';

export const initialState: IActionRiversState = {
  loading: false,
  ids: [],
  entities: {},
};

export const slice = createSlice({
  name: REDUCER_KEY,
  initialState: adapter.getInitialState<IActionRiversState>(initialState),
  reducers: {
    clear(state) {
      adapter.removeAll(state);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchActionRivers.fulfilled, (state, action) => {
        state.loading = false;
        adapter.setAll(state, action.payload);
      })
      .addCase(fetchActionRivers.pending, (state, _) => {
        state.loading = true;
      });
  },
});
