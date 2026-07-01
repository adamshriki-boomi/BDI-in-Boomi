import { initialState, slice } from './river.reducer';
export * from './hooks';
export * from './utils';

export const actions = slice.actions;
const api = {
  reducer: { [slice.name]: slice.reducer },
  initialState,
};
export default api;
