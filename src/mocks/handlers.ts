import { rest } from 'msw';
import { accountDetails, environmentsPage, userLogin } from './fixtures';
import {
  activitiesGraph,
  activitiesPage,
  activitiesStatistics,
  connectionsList,
  dashboardData,
  dataSourceTypes,
  hasRivers,
  riverGroups,
  riversLegacyPage,
  riversSearchPage,
  sourcesList,
} from './data';

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

  // --- Source-icon registry (resolves datasource icons app-wide) ---
  rest.get('*/data_source_types', ok(dataSourceTypes)),

  // --- Dashboard ---
  rest.get('*/has_rivers', ok(hasRivers)),
  rest.get('*/sources_list', ok(sourcesList)),
  rest.post('*/dashboard', (req, res, ctx) => {
    const body = (req.body as any) || {};
    return res(
      ctx.status(200),
      ctx.json(dashboardData(body.metric, body.view)),
    );
  }),

  // --- Activities / Monitoring (specific before the broad `*/activities`) ---
  rest.get('*/activities_statistics', ok(activitiesStatistics)),
  rest.post('*/activities_graph', ok(activitiesGraph)),
  rest.get('*/activities', (req, res, ctx) => {
    const p = req.url.searchParams;
    const page = Number(p.get('page')) || 1;
    const perPage = Number(p.get('items_per_page')) || 25;
    const status = [...p.getAll('status'), ...p.getAll('status[]')]
      .flatMap(s => s.split(','))
      .filter(Boolean);
    return res(
      ctx.status(200),
      ctx.json(activitiesPage(page, perPage, status)),
    );
  }),

  // --- Data Flows (V1 grid is primary; legacy list as a safety net) ---
  rest.get('*/rivers_search', (req, res, ctx) => {
    const p = req.url.searchParams;
    const page = Number(p.get('page')) || 1;
    const perPage = Number(p.get('items_per_page')) || 20;
    return res(ctx.status(200), ctx.json(riversSearchPage(page, perPage)));
  }),
  rest.get('*/api/rivers', (req, res, ctx) => {
    const p = req.url.searchParams;
    const page = Number(p.get('page')) || 1;
    const perPage = Number(p.get('page_size')) || 20;
    return res(ctx.status(200), ctx.json(riversLegacyPage(page, perPage)));
  }),
  rest.get('*/api/river_groups', ok(riverGroups)),

  // --- Connections (React connections screen) ---
  rest.get('*/api/connections/list', ok(connectionsList)),

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
