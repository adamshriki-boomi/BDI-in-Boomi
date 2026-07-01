import { createSlice } from '@reduxjs/toolkit';
import { addLoadingMatchers } from 'store/utils';
import { getOId } from 'utils/api.sanitizer';
import {
  createOne,
  deleteOne,
  fetchGroups,
  updateGroup,
} from './groups.effects';
import { adapter } from './groups.selectors';
import { IGroupsState, REDUCER_KEY } from './groups.types';

export const initialState: IGroupsState = {
  ids: [],
  entities: {},
  loading: false,
};
export const slice = createSlice({
  name: REDUCER_KEY,
  initialState: adapter.getInitialState<IGroupsState>(initialState),
  reducers: {
    clear(state) {
      adapter.removeAll(state);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchGroups.fulfilled, (state, action) => {
        adapter.upsertMany(state, action.payload);
      })
      .addCase(deleteOne.fulfilled, (state, action) => {
        adapter.removeOne(state, getOId(action.payload.deleted_group));
      })
      .addCase(createOne.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload);
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        adapter.upsertOne(state, action.payload);
      });
    addLoadingMatchers(builder);
  },
});
