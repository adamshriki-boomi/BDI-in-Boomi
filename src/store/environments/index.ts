import { initialState, slice } from './environments.reducer';
export * from './hooks';

export const actions = slice.actions;
const api = {
  reducer: { [slice.name]: slice.reducer },
  initialState,
};
export default api;
