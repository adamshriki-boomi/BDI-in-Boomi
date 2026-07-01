import { initialState, slice } from './core.reducer';
export * from './hooks/';

export const actions = slice.actions;
const api = {
  reducer: { [slice.name]: slice.reducer },
  // with manual logout, auto sign in should not trigger
  initialState: { ...initialState, signOutPending: true },
};
export default api;
