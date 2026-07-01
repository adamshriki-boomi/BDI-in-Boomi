import {
  ActionReducerMapBuilder,
  AnyAction,
  AsyncThunk,
} from '@reduxjs/toolkit';

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>;
type PendingAction = ReturnType<GenericAsyncThunk['pending']>;

function isPendingAction(action: AnyAction): action is PendingAction {
  return action.type.endsWith('/pending');
}

function isFulfilledAction(action: AnyAction): action is PendingAction {
  return action.type.endsWith('/fulfilled');
}

function setLoading(state, loading: boolean) {
  state.loading = loading;
}
export const addLoadingMatchers = (builder: ActionReducerMapBuilder<any>) => {
  builder
    .addMatcher(isPendingAction, state => {
      setLoading(state, true);
    })
    .addMatcher(isFulfilledAction, state => {
      setLoading(state, false);
    });
};
