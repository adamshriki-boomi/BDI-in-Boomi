/**
 * POST .../dashboard → { data: [ daily points ], ... }
 *
 * The activity chart aggregates by UTC day and filters to the requested window
 * (last N days from *now*), so points MUST be recent. Each point carries every
 * metric field (executions/success_rate/bdu) so any metric toggle renders:
 *   executions → runs/executions,  bdu → units,  success_rate → success_rate
 */
import { ACCOUNT_ID } from '../fixtures';
import { DAY, NOW, rng } from './_shared';
import { FLOWS } from './seed';

// Treat the seeded window counts as ~7 days of activity to derive a daily base.
const windowExecutions = FLOWS.reduce(
  (s, f) =>
    s +
    f.counts.succeeded +
    f.counts.failed +
    f.counts.running +
    f.counts.pending,
  0,
);
const windowUnits = FLOWS.reduce((s, f) => s + f.units, 0);
const dailyExecBase = Math.max(50, Math.round(windowExecutions / 7));
const dailyUnitBase = Math.max(1, windowUnits / 7);

const DAYS = 30;
const todayStart = Math.floor(NOW / DAY) * DAY;

function buildSeries(seed: number, scale: number, rateBase: number) {
  const r = rng(seed);
  const data = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const dayVar = 0.82 + r() * 0.36; // ±18%
    const executions = Math.round(dailyExecBase * scale * dayVar);
    const rate = rateBase + r() * 0.05;
    const succeeded = Math.round(executions * rate);
    const failed = executions - succeeded;
    data.push({
      run_date: todayStart - i * DAY,
      runs: executions,
      executions,
      succeeded,
      failed,
      success_rate: Number((rate * 100).toFixed(1)),
      units: Number((dailyUnitBase * scale * dayVar).toFixed(1)),
    });
  }
  return data;
}

// Current period, and a prior period ~10% lower / slightly worse success rate,
// so the KPI cards show believable single-digit growth vs "+100%".
const series = buildSeries(42, 1, 0.93);
const previousSeries = buildSeries(7, 0.9, 0.905);

export function dashboardData(metric = 'executions', view = 'general') {
  return {
    account_id: ACCOUNT_ID,
    metric,
    view,
    data: series,
    previous_kpis: previousSeries,
  };
}
