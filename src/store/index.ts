import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import middleware from './middleware';
import { appReducer } from './reducers';

const devTools = import.meta.env.VITE_NODE_ENV !== 'production';

// avoid endless warning in the console in dev mode
const middlewareOptions = devTools
  ? {
      // serializableCheck: false,
      // immutableCheck: false,
      serializableCheck: {
        warnAfter: 1000,
      },
      immutableCheck: {
        warnAfter: 1000,
      },
    }
  : undefined;

const appStore = configureStore({
  reducer: appReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware(middlewareOptions).concat(middleware),
  devTools,
});

setupListeners(appStore.dispatch);
export const store = appStore;
