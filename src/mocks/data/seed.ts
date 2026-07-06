/**
 * BDI prototype — canonical seed dataset.
 *
 * FLOWS is the single source of truth: every Data Flow carries its group, its
 * source connector, a schedule flag and a generated run history. The Data Flows
 * list, Activities table + run-segmentation bars, and the Dashboard all project
 * from this same list, so the prototype stays internally consistent.
 */

import {
  connectorById,
  daysAgo,
  groupByKey,
  hoursAgo,
  mkId,
  minsAgo,
  oid,
  PEOPLE,
  rng,
} from './_shared';

export const STATUS = {
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  RUNNING: 'running',
  PARTIAL: 'partially succeeded',
  PENDING: 'pending',
  CANCELED: 'canceled',
} as const;

type Health = 'healthy' | 'failing' | 'running' | 'mixed';

interface FlowSpec {
  name: string;
  group: string; // group key
  source: string; // connector id (datasource_id)
  type: 'src_to_trgt' | 'logic';
  scheduled: boolean;
  health: Health;
}

// ~30 flows across 6 groups — a mature B2B-SaaS account.
const SPECS: FlowSpec[] = [
  // Sales
  {
    name: 'Salesforce Accounts → Snowflake',
    group: 'sales',
    source: 'salesforce',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'healthy',
  },
  {
    name: 'Salesforce Opportunities → Snowflake',
    group: 'sales',
    source: 'salesforce',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'healthy',
  },
  {
    name: 'Salesforce Leads → BigQuery',
    group: 'sales',
    source: 'salesforce',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'mixed',
  },
  {
    name: 'Salesforce Activities → Snowflake',
    group: 'sales',
    source: 'salesforce',
    type: 'src_to_trgt',
    scheduled: false,
    health: 'healthy',
  },
  {
    name: 'LinkedIn Ads Campaigns → Snowflake',
    group: 'sales',
    source: 'linkedin',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'running',
  },
  // Marketing
  {
    name: 'HubSpot Contacts → Snowflake',
    group: 'marketing',
    source: 'hubspot',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'healthy',
  },
  {
    name: 'HubSpot Email Events → BigQuery',
    group: 'marketing',
    source: 'hubspot',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'healthy',
  },
  {
    name: 'Marketo Leads → Snowflake',
    group: 'marketing',
    source: 'marketo',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'mixed',
  },
  {
    name: 'GA4 Sessions → BigQuery',
    group: 'marketing',
    source: 'google_analytics',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'healthy',
  },
  {
    name: 'Facebook Ads Insights → Snowflake',
    group: 'marketing',
    source: 'facebook_ads',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'failing',
  },
  {
    name: 'GA4 Events → BigQuery',
    group: 'marketing',
    source: 'google_analytics',
    type: 'src_to_trgt',
    scheduled: false,
    health: 'healthy',
  },
  // Finance
  {
    name: 'Stripe Charges → Snowflake',
    group: 'finance',
    source: 'stripe',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'healthy',
  },
  {
    name: 'Stripe Invoices → BigQuery',
    group: 'finance',
    source: 'stripe',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'healthy',
  },
  {
    name: 'Stripe Subscriptions → Snowflake',
    group: 'finance',
    source: 'stripe',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'running',
  },
  {
    name: 'NetSuite Transactions → Snowflake',
    group: 'finance',
    source: 'netsuite',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'mixed',
  },
  {
    name: 'NetSuite GL Accounts → Snowflake',
    group: 'finance',
    source: 'netsuite',
    type: 'src_to_trgt',
    scheduled: false,
    health: 'healthy',
  },
  {
    name: 'Revenue Recognition Model',
    group: 'finance',
    source: 'logic',
    type: 'logic',
    scheduled: true,
    health: 'healthy',
  },
  // Product
  {
    name: 'Postgres App DB → Snowflake',
    group: 'product',
    source: 'postgres',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'healthy',
  },
  {
    name: 'MySQL Event Log → BigQuery',
    group: 'product',
    source: 'mysql',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'failing',
  },
  {
    name: 'Mixpanel Events → Snowflake',
    group: 'product',
    source: 'mixpanel',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'healthy',
  },
  {
    name: 'Shopify Orders → Snowflake',
    group: 'product',
    source: 'shopify',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'healthy',
  },
  {
    name: 'Product Usage Rollup',
    group: 'product',
    source: 'logic',
    type: 'logic',
    scheduled: true,
    health: 'running',
  },
  {
    name: 'Postgres Feature Flags → Snowflake',
    group: 'product',
    source: 'postgres',
    type: 'src_to_trgt',
    scheduled: false,
    health: 'healthy',
  },
  // Customer Success
  {
    name: 'Zendesk Tickets → Snowflake',
    group: 'cs',
    source: 'zendesk',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'healthy',
  },
  {
    name: 'Zendesk Satisfaction → BigQuery',
    group: 'cs',
    source: 'zendesk',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'mixed',
  },
  {
    name: 'Intercom Conversations → Snowflake',
    group: 'cs',
    source: 'intercom',
    type: 'src_to_trgt',
    scheduled: true,
    health: 'healthy',
  },
  {
    name: 'Churn Risk Scoring',
    group: 'cs',
    source: 'logic',
    type: 'logic',
    scheduled: true,
    health: 'healthy',
  },
  // Data Platform
  {
    name: 'Jira Issues → Snowflake',
    group: 'data',
    source: 'jira',
    type: 'src_to_trgt',
    scheduled: false,
    health: 'healthy',
  },
  {
    name: 'Warehouse Cost Monitoring',
    group: 'data',
    source: 'logic',
    type: 'logic',
    scheduled: true,
    health: 'mixed',
  },
  {
    name: 'Data Quality Tests',
    group: 'data',
    source: 'logic',
    type: 'logic',
    scheduled: true,
    health: 'failing',
  },
];

export interface RunEntry {
  status: string;
  max_run_duration_milliseconds: number;
  run_group_id: string;
  rpu: number;
  run_date: number;
}

export interface Flow extends FlowSpec {
  index: number;
  cross: string;
  groupCross: string;
  modifiedBy: string;
  units: number;
  lastRun: number;
  lastModified: number;
  counts: {
    succeeded: number;
    failed: number;
    running: number;
    pending: number;
    canceled: number;
  };
  runHistory: RunEntry[];
}

const pick = <T>(r: () => number, arr: T[]): T =>
  arr[Math.floor(r() * arr.length)];

function buildRunHistory(
  spec: FlowSpec,
  r: () => number,
  lastRun: number,
  flowIndex: number,
): RunEntry[] {
  const len = 14 + Math.floor(r() * 16); // 14–30 runs
  const baseDur = spec.type === 'logic' ? 12_000 : 40_000;
  const spread = spec.type === 'logic' ? 90_000 : 320_000;
  // gap between runs: scheduled hourly-ish, ad-hoc flows spaced further apart
  const gap = spec.scheduled
    ? 60 * 60_000 + r() * 3 * 60_000
    : 20 * 60 * 60_000;

  const runs: RunEntry[] = [];
  for (let j = 0; j < len; j++) {
    let status: string = STATUS.SUCCEEDED;
    if (spec.health === 'failing') {
      status =
        j < 3 ? STATUS.FAILED : r() < 0.25 ? STATUS.FAILED : STATUS.SUCCEEDED;
    } else if (spec.health === 'mixed') {
      const roll = r();
      status =
        roll < 0.68
          ? STATUS.SUCCEEDED
          : roll < 0.9
          ? STATUS.FAILED
          : STATUS.PARTIAL;
    } else if (spec.health === 'running') {
      status =
        j === 0 ? STATUS.RUNNING : r() < 0.1 ? STATUS.FAILED : STATUS.SUCCEEDED;
    } else {
      // healthy
      status = r() < 0.06 ? STATUS.PARTIAL : STATUS.SUCCEEDED;
    }
    runs.push({
      status,
      max_run_duration_milliseconds: Math.round(baseDur + r() * spread),
      run_group_id: mkId(3, flowIndex * 100 + j),
      rpu: Number((r() * 4).toFixed(2)),
      run_date: Math.round(lastRun - j * gap),
    });
  }
  return runs; // index 0 = most recent
}

function buildFlow(spec: FlowSpec, i: number): Flow {
  const r = rng(i + 7);
  const group = groupByKey(spec.group);

  // Most-recent-run recency by health / schedule.
  const lastRun =
    spec.health === 'running'
      ? minsAgo(4 + Math.floor(r() * 80))
      : spec.health === 'failing'
      ? minsAgo(25 + Math.floor(r() * 160))
      : spec.scheduled
      ? hoursAgo(1 + Math.floor(r() * 9))
      : daysAgo(1 + Math.floor(r() * 6));

  const runHistory = buildRunHistory(spec, rng(i + 101), lastRun, i);

  // Window totals (busy account runs many times/day) sized off schedule.
  const base = spec.scheduled
    ? 40 + Math.floor(r() * 260)
    : 3 + Math.floor(r() * 22);
  const successRate =
    spec.health === 'healthy'
      ? 0.97
      : spec.health === 'running'
      ? 0.92
      : spec.health === 'mixed'
      ? 0.8
      : 0.58;
  const succeeded = Math.round(base * successRate);
  const failed = base - succeeded;
  const running = spec.health === 'running' ? 1 + Math.floor(r() * 2) : 0;
  const pending = spec.scheduled && r() < 0.3 ? 1 : 0;
  const canceled = r() < 0.12 ? 1 : 0;

  // BDU (Boomi Data Units): logic/monitoring flows cost little; ingest flows more.
  const units =
    spec.type === 'logic'
      ? Number((r() * 3).toFixed(2))
      : Number((base * (0.4 + r() * 2.2)).toFixed(1));

  return {
    ...spec,
    index: i,
    cross: mkId(2, i),
    groupCross: group.cross,
    modifiedBy: pick(r, PEOPLE),
    units,
    lastRun,
    lastModified: daysAgo(3 + Math.floor(r() * 110)),
    counts: { succeeded, failed, running, pending, canceled },
    runHistory,
  };
}

export const FLOWS: Flow[] = SPECS.map(buildFlow);

/** Human label for a flow's source connector (for descriptions/tooltips). */
export const flowSourceName = (f: Flow) =>
  connectorById(f.source)?.name ?? f.source;

// ---------------------------------------------------------------------------
// Connections — one per distinct source + the warehouses. A couple are invalid.
// ---------------------------------------------------------------------------

interface ConnSpec {
  connector: string;
  label: string;
  valid?: boolean;
}

const CONN_SPECS: ConnSpec[] = [
  { connector: 'salesforce', label: 'Salesforce (Production)' },
  { connector: 'hubspot', label: 'HubSpot Marketing' },
  { connector: 'stripe', label: 'Stripe — Billing' },
  { connector: 'zendesk', label: 'Zendesk Support' },
  { connector: 'google_analytics', label: 'Google Analytics 4' },
  { connector: 'marketo', label: 'Marketo' },
  { connector: 'facebook_ads', label: 'Facebook Ads', valid: false },
  { connector: 'netsuite', label: 'NetSuite ERP' },
  { connector: 'intercom', label: 'Intercom' },
  { connector: 'mixpanel', label: 'Mixpanel — Product' },
  { connector: 'postgres', label: 'App DB (Postgres)' },
  { connector: 'mysql', label: 'Events DB (MySQL)', valid: false },
  { connector: 'shopify', label: 'Shopify Store' },
  { connector: 'linkedin', label: 'LinkedIn Ads' },
  { connector: 'jira', label: 'Jira Cloud' },
  { connector: 'snowflake', label: 'Snowflake — Analytics' },
  { connector: 'bigquery', label: 'BigQuery — Warehouse' },
  { connector: 'redshift', label: 'Redshift — Archive' },
];

export interface Connection extends ConnSpec {
  index: number;
  cross: string;
  updated: number;
  created: number;
  modifiedBy: string;
}

export const CONNECTIONS: Connection[] = CONN_SPECS.map((spec, i) => {
  const r = rng(i + 313);
  return {
    ...spec,
    valid: spec.valid ?? true,
    index: i,
    cross: mkId(4, i),
    updated: daysAgo(1 + Math.floor(r() * 90)),
    created: daysAgo(120 + Math.floor(r() * 240)),
    modifiedBy: pick(r, PEOPLE),
  };
});
