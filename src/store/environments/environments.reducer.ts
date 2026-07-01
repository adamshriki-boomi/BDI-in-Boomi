import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { updateVariableValue } from './environments.effects';
import { adapter } from './environments.selectors';
import { IEnvironmentsState, REDUCER_KEY } from './environments.types';

export const initialState: IEnvironmentsState = {
  selectedEnvironment: '',
  ids: [],
  entities: {},
  variablesDrawer: false,
};
export const slice = createSlice({
  name: REDUCER_KEY,
  initialState: adapter.getInitialState<IEnvironmentsState>(initialState),
  reducers: {
    setDrawerState(state, action: PayloadAction<boolean>) {
      state.variablesDrawer = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(updateVariableValue.fulfilled, (state, action: any) => {
      adapter.upsertOne(state, action.payload);
    });
  },
});
