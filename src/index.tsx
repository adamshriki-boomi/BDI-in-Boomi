import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './app/App';
import './fonts/index.scss';
import { store } from './store';
// Load exosphere icons
import '@boomi/exosphere/dist/icon.js';

async function bootstrap() {
  // BDI prototype: optionally start the MSW mock backend before first render
  // so the app boots into its authenticated shell with no real backend.
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    const { startMocks } = await import('./mocks');
    await startMocks();
  }

  const root = createRoot(document.querySelector('#root'));
  root.render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
}

bootstrap();
