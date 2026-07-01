import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { duplicateRiver, fetchRivers } from './rivers.effects';
import { adapter } from './rivers.selectors';
import { IRiversState, REDUCER_KEY } from './rivers.types';

export const initialState: IRiversState = {
  selectedId: '',
  ids: [],
  entities: {},
};

export const slice = createSlice({
  name: REDUCER_KEY,
  initialState: adapter.getInitialState<IRiversState>(initialState),
  reducers: {
    selectItem(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
    clear(state) {
      adapter.removeAll(state);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchRivers.fulfilled, (state, action) => {
        adapter.removeAll(state);
        adapter.addMany(state, action.payload);
      })
      .addCase(duplicateRiver.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload);
      });
  },
});
