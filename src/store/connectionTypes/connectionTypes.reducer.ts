import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IConnectionType } from 'api/types';
import { fetchRiver } from 'store/river/river.effects';
import { actions, isRiverDraft } from '../river';
import { fetchConnectionsByType } from './connectionTypes.effects';
import { adapter } from './connectionTypes.selectors';
import { IRiverConnectionsState, REDUCER_KEY } from './connectionTypes.types';
export const initialState: IRiverConnectionsState = {
  selectedId: '',
  loading: false,
  ids: [],
  entities: {},
  currentRequest: undefined,
};
export const slice = createSlice({
  name: REDUCER_KEY,
  initialState: adapter.getInitialState<IRiverConnectionsState>(initialState),
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
      .addCase(
        fetchConnectionsByType.fulfilled,
        (state, action: PayloadAction<IConnectionType[], string, any, any>) => {
          state.currentRequest = undefined;
          if (action?.error) return;
          state.loading = false;
          adapter.upsertMany(state, action.payload);
        },
      )
      .addCase(fetchConnectionsByType.pending, (state, action) => {
        state.loading = true;
        state.currentRequest = {
          id: action.meta.requestId,
          type: action.meta.arg,
        };
      })
      .addCase(fetchRiver.pending, state => {
        clearEntities(state);
      })
      .addCase(actions.selectRiver, (state, action) => {
        if (isRiverDraft(action.payload)) {
          clearEntities(state);
        }
      });
  },
});

const clearEntities = (state: IRiverConnectionsState) =>
  adapter.removeAll(state);
