/**
 * BDI prototype — shared mock-data helpers + registries.
 *
 * These modules build a coherent, believable dataset for a *mature* B2B-SaaS
 * account (Salesforce / HubSpot / Stripe / Zendesk / GA → Snowflake & BigQuery)
 * and project it into each API response shape the app expects. One canonical
 * seed (see ./seed.ts) feeds every screen, so the same Data Flows appear — with
 * the same groups, sources and run history — across the Data Flows list,
 * Activities and the Dashboard.
 *
 * Timestamps are anchored to the real `Date.now()` (this is app runtime code,
 * not a deterministic fixture) so the Dashboard's "last 30 days" query window
 * and "last run 2h ago" style dates always look current.
 */

export const NOW = Date.now();
export const MIN = 60_000;
export const HOUR = 60 * MIN;
export const DAY = 24 * HOUR;

export const oid = (s: string) => ({ $oid: s });

/** Deterministic, unique 24-char hex id per (kind, index). */
export const mkId = (kind: number, i: number): string =>
  (kind * 1_000_000 + i).toString(16).padStart(24, '0');

/** Small seeded PRNG (LCG) so generated data varies but is stable per reload. */
export const rng = (seed: number) => {
  let s = (seed * 2654435761) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

export const minsAgo = (m: number) => NOW - m * MIN;
export const hoursAgo = (h: number) => NOW - h * HOUR;
export const daysAgo = (d: number) => NOW - d * DAY;

/**
 * Icon path forms (assets live in public/dist/images/dataSources/*.png).
 *
 * Prefix with the Vite base path so icons resolve both locally (base '/') and
 * on GitHub Pages (base '/BDI-in-Boomi/'). `import.meta.env.BASE_URL` carries
 * that prefix with a trailing slash — the same pattern src/app/App.tsx (router
 * basename) and src/mocks/index.ts (MSW worker URL) use. Without it, absolute
 * `/dist/...` paths 404 on Pages because the site is served from a sub-path.
 */
const ICON_DIR = 'dist/images/dataSources';
const BASE = import.meta.env.BASE_URL; // '/' locally, '/BDI-in-Boomi/' on Pages
export const iconUrl = (file: string) => `${BASE}${ICON_DIR}/${file}`; // used as <Image src> directly
export const iconRel = (file: string) =>
  `${BASE}${ICON_DIR}/${file}`.replace(/^\//, ''); // connections table prepends "/"

/**
 * Connector registry. `id`/`api_name` are the values used as `datasource_id` on
 * flows/activities and `connection_type` on connections; the app resolves source
 * icons via these ids (useSourceByType) so they MUST match. Icon files are
 * verified to exist under public/dist/images/dataSources/.
 */
export interface Connector {
  id: string;
  name: string;
  icon: string; // filename under dataSources/
  kind: 'source' | 'warehouse';
}

export const CONNECTORS: Connector[] = [
  // Sources
  { id: 'salesforce', name: 'Salesforce', icon: 'sf.png', kind: 'source' },
  { id: 'hubspot', name: 'HubSpot', icon: 'hubspot.png', kind: 'source' },
  { id: 'stripe', name: 'Stripe', icon: 'stripe.png', kind: 'source' },
  { id: 'zendesk', name: 'Zendesk', icon: 'zendesk.png', kind: 'source' },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    icon: 'google-analytics.png',
    kind: 'source',
  },
  { id: 'marketo', name: 'Marketo', icon: 'marketo.png', kind: 'source' },
  {
    id: 'facebook_ads',
    name: 'Facebook Ads',
    icon: 'facebook_ads.png',
    kind: 'source',
  },
  { id: 'netsuite', name: 'NetSuite', icon: 'netsuite.png', kind: 'source' },
  { id: 'intercom', name: 'Intercom', icon: 'intercom.png', kind: 'source' },
  { id: 'mixpanel', name: 'Mixpanel', icon: 'mixpanel.png', kind: 'source' },
  { id: 'postgres', name: 'PostgreSQL', icon: 'pg.png', kind: 'source' },
  { id: 'mysql', name: 'MySQL', icon: 'mysql.png', kind: 'source' },
  { id: 'shopify', name: 'Shopify', icon: 'shopify.png', kind: 'source' },
  {
    id: 'linkedin',
    name: 'LinkedIn Ads',
    icon: 'linkedin.png',
    kind: 'source',
  },
  { id: 'jira', name: 'Jira', icon: 'jira.png', kind: 'source' },
  { id: 'logic', name: 'Logic', icon: 'logic.png', kind: 'source' },
  // Warehouses / targets
  {
    id: 'snowflake',
    name: 'Snowflake',
    icon: 'snowflake.png',
    kind: 'warehouse',
  },
  {
    id: 'bigquery',
    name: 'Google BigQuery',
    icon: 'bq.png',
    kind: 'warehouse',
  },
  {
    id: 'redshift',
    name: 'Amazon Redshift',
    icon: 'redshift.png',
    kind: 'warehouse',
  },
  { id: 's3', name: 'Amazon S3', icon: 'amazon-s3.png', kind: 'warehouse' },
];

export const connectorById = (id: string) =>
  CONNECTORS.find(c => c.id === id) as Connector;

/**
 * Data Flow groups. Colors are plain hex — the group Dot renders `bg={color}`
 * directly (unlike the environment switcher, which needs Rivery color tokens).
 * Group `icon` names map to public/dist/icons/icon-picker-<icon>.svg.
 */
export interface Group {
  key: string;
  name: string;
  color: string;
  icon: string;
  cross: string;
}

export const GROUPS: Group[] = [
  {
    key: 'sales',
    name: 'Sales',
    color: '#2E7DE1',
    icon: 'crown',
    cross: mkId(1, 1),
  },
  {
    key: 'marketing',
    name: 'Marketing',
    color: '#B45AF2',
    icon: 'flower',
    cross: mkId(1, 2),
  },
  {
    key: 'finance',
    name: 'Finance',
    color: '#1CA87B',
    icon: 'coffee',
    cross: mkId(1, 3),
  },
  {
    key: 'product',
    name: 'Product',
    color: '#F2A93B',
    icon: 'flags',
    cross: mkId(1, 4),
  },
  {
    key: 'cs',
    name: 'Customer Success',
    color: '#E8618C',
    icon: 'friendly',
    cross: mkId(1, 5),
  },
  {
    key: 'data',
    name: 'Data Platform',
    color: '#5A6B7B',
    icon: 'camera',
    cross: mkId(1, 6),
  },
];

export const groupByKey = (key: string) =>
  GROUPS.find(g => g.key === key) as Group;

/** Teammates who "own"/last-modified flows and connections. */
export const PEOPLE = [
  'Adam Shriki',
  'Maya Chen',
  'Diego Ramirez',
  'Priya Patel',
  'Tom Becker',
  'Sara Cohen',
];
