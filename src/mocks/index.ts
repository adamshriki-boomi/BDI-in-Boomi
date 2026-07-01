/**
 * BDI prototype mock backend entrypoint.
 *
 * Gated by the `VITE_USE_MOCKS` env flag so it is fully tree-shaken out of any
 * non-mock build. To run against a real staging/dev backend instead, set
 * `VITE_USE_MOCKS=false` (and point VITE_API_BASE_URL_DEFAULT / VITE_PROXY at it).
 */
export async function startMocks(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCKS !== 'true') return;

  const { worker } = await import('./browser');
  await worker.start({
    // Let everything we don't explicitly mock (HMR, assets, /ng iframe,
    // 3rd-party analytics scripts) pass through untouched.
    onUnhandledRequest: 'bypass',
    // Base-relative so it also works under a GitHub Pages sub-path
    // (import.meta.env.BASE_URL is '/' locally, '/BDI-in-Boomi/' on Pages).
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  });
  // eslint-disable-next-line no-console
  console.info('[BDI] Mock backend active (VITE_USE_MOCKS=true)');
}
