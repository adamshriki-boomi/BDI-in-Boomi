import { rest } from 'msw';
import { accountDetails, environmentsPage, userLogin } from './fixtures';

/**
 * MSW request handlers for the BDI prototype mock backend.
 *
 * Order matters — MSW responds with the FIRST matching handler, so specific
 * auth/bootstrap handlers come first and broad "keep the app from hitting the
 * network" fallbacks come last. Anything not matched here (HMR, assets, the
 * legacy Angular `/ng` iframe, 3rd-party scripts) is bypassed to the network
 * (see browser.ts onUnhandledRequest: 'bypass').
 */

const ok = (body: unknown) => (_req: any, res: any, ctx: any) =>
  res(ctx.status(200), ctx.json(body));

export const handlers = [
  // --- Critical auth handshake (axios `api` instance: <origin>/api/*) ---
  rest.post('*/api/login', ok(userLogin)),
  rest.post('*/api/token', ok(accountDetails)),

  // --- Shell bootstrap (RTK Query v1: https://api.*/v1/*) ---
  rest.get('*/v1/accounts/:accountId/environments', ok(environmentsPage)),

  // --- Permissive fallbacks: never let an API call escape to the network ---
  // v1 host (paginated-style empty page covers fetchAllPages consumers)
  rest.get(
    '*/v1/*',
    ok({ items: [], next_page: '', current_page_size: 0, page: 1 }),
  ),
  rest.post('*/v1/*', ok({})),
  rest.put('*/v1/*', ok({})),
  rest.patch('*/v1/*', ok({})),
  rest.delete('*/v1/*', ok({})),
  // same-origin /api host
  rest.get('*/api/*', ok([])),
  rest.post('*/api/*', ok({})),
  rest.put('*/api/*', ok({})),
  rest.patch('*/api/*', ok({})),
  rest.delete('*/api/*', ok({})),
];
