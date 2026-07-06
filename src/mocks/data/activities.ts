/**
 * Activities / Monitoring responses.
 *   GET  .../activities            → ActivitiesResponse { items: IActivity[], ... }
 *   GET  .../activities_statistics → aggregate counts
 *   POST .../activities_graph      → { items: [{ river_id, last_runs }] }
 *
 * Status counts use the current field names the table reads
 * (succeeded/failed/running/pending/canceled) with success/waiting aliases for
 * safety. `last_runs` is embedded directly AND returned by the graph endpoint
 * (keyed by river_id === master_river_id) so the run-segmentation bars fill in
 * whichever path the page takes.
 */
import { ACCOUNT_ID, ENV_PROD_ID } from '../fixtures';
import { Flow, FLOWS } from './seed';

const toActivity = (f: Flow) => ({
  account: ACCOUNT_ID,
  env_id: ENV_PROD_ID,
  cross_id: f.cross,
  river_id: f.cross,
  master_river_id: f.cross,
  river_name: f.name,
  is_sub_river: false,
  is_master_river: true,
  is_multi: false,
  group_id: f.groupCross,
  is_scheduled: f.scheduled,
  total_files: f.counts.succeeded + f.counts.failed,
  units: f.units,
  rpu: f.units,
  total_size: Math.round(f.units * 5_000_000),
  last_run: f.lastRun,
  succeeded: f.counts.succeeded,
  failed: f.counts.failed,
  running: f.counts.running,
  pending: f.counts.pending,
  canceled: f.counts.canceled,
  // aliases some code paths / older shapes expect
  success: f.counts.succeeded,
  waiting: f.counts.pending,
  datasource_id: f.source,
  dry_runs: 0,
  last_runs: f.runHistory,
});

const countKey: Record<string, keyof Flow['counts']> = {
  succeeded: 'succeeded',
  success: 'succeeded',
  failed: 'failed',
  failure: 'failed',
  running: 'running',
  pending: 'pending',
  waiting: 'pending',
  canceled: 'canceled',
};

const matchesStatus = (f: Flow, statuses: string[]) =>
  statuses.length === 0 ||
  statuses.some(s => {
    const key = countKey[s?.toLowerCase?.()];
    return key ? f.counts[key] > 0 : false;
  });

const paginate = <T>(items: T[], page: number, size: number) =>
  items.slice((page - 1) * size, (page - 1) * size + size);

export function activitiesPage(
  page = 1,
  itemsPerPage = 25,
  statuses: string[] = [],
) {
  const filtered = FLOWS.filter(f => matchesStatus(f, statuses));
  const items = paginate(filtered, page, itemsPerPage).map(toActivity);
  return {
    items,
    cache_context_id: 'bdi-mock-activities',
    next_page: page * itemsPerPage < filtered.length ? String(page + 1) : '',
    total_pages: Math.ceil(filtered.length / itemsPerPage),
    total_items: filtered.length,
    page,
    current_page_size: items.length,
  };
}

export const activitiesGraph = {
  items: FLOWS.map(f => ({ river_id: f.cross, last_runs: f.runHistory })),
};

export const activitiesStatistics = {
  account: ACCOUNT_ID,
  env_id: ENV_PROD_ID,
  total_units: Number(FLOWS.reduce((s, f) => s + f.units, 0).toFixed(1)),
  running: FLOWS.reduce((s, f) => s + f.counts.running, 0),
  canceled: FLOWS.reduce((s, f) => s + f.counts.canceled, 0),
  pending: FLOWS.reduce((s, f) => s + f.counts.pending, 0),
  failed: FLOWS.reduce((s, f) => s + f.counts.failed, 0),
  succeeded: FLOWS.reduce((s, f) => s + f.counts.succeeded, 0),
};
