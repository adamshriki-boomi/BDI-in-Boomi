import { initialState, slice } from './__templateName__.reducer';
export * from './hooks';

export const actions = slice.actions;
const api = {
  reducer: { [slice.name]: slice.reducer },
  initialState,
};
export default api;
