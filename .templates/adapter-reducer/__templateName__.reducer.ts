import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { adapter } from './__templateName__.selectors';
import {
  I__templateNameToPascalCase__State,
  REDUCER_KEY,
} from './__templateName__.types';

export const initialState: I__templateNameToPascalCase__State = {
  selectedId: '',
  ids: [],
  entities: {},
};
export const slice = createSlice({
  name: REDUCER_KEY,
  initialState: adapter.getInitialState<I__templateNameToPascalCase__State>(
    initialState,
  ),
  reducers: {
    selectItem(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
  },
  extraReducers: builder => {
    // builder
  },
});
