import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchConnections } from './connections.effects';
import { adapter } from './connections.selectors';
import { IConnectionsState, REDUCER_KEY } from './connections.types';

export const initialState: IConnectionsState = {
  selectedId: '',
  ids: [],
  entities: {},
};
export const slice = createSlice({
  name: REDUCER_KEY,
  initialState: adapter.getInitialState<IConnectionsState>(initialState),
  reducers: {
    selectItem(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchConnections.fulfilled, (state, action) => {
      adapter.setAll(state, action.payload);
    });
  },
});
