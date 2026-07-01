import { Metric, View } from './dashboard.query';

/** Data point shape expected by Exosphere charts (x/y with a series key). */
export interface ExosphereDataPoint {
  x: number; // timestamp (seconds)
  y: number; // value
  z: string; // series name (metric label or datasource)
}

/** Public props for `DashboardActivityChart`. */
export interface DashboardActivityChartProps {
  data?: any;
  isLoading?: boolean;
  error?: any;
  view?: View;
  metric?: Metric;
  onResetToDefault?: () => void;
}

/** Normalized return type for source-view transformations. */
export interface SourceTransformResult {
  chartData: ExosphereDataPoint[] | null;
  sources: string[];
}

/** Palette of colors used to render source series consistently. */
export const SOURCE_COLORS = [
  'var(--exo-palette-navy-20)',
  'var(--exo-palette-coral-20)',
  'var(--exo-palette-gray-20)',
  'var(--exo-palette-purple-20)',
  'var(--exo-palette-periwinkle-20)',
  'var(--exo-palette-blue-20)',
  'var(--exo-palette-green-20)',
  'var(--exo-palette-yellow-20)',
  'var(--exo-palette-red-20)',
  'var(--exo-palette-navy-40)',
  'var(--exo-palette-coral-40)',
  'var(--exo-palette-gray-40)',
  'var(--exo-palette-purple-40)',
  'var(--exo-palette-periwinkle-40)',
  'var(--exo-palette-blue-40)',
  'var(--exo-palette-green-40)',
  'var(--exo-palette-yellow-40)',
  'var(--exo-palette-red-40)',
  'var(--exo-palette-navy-60)',
  'var(--exo-palette-coral-60)',
  'var(--exo-palette-gray-60)',
  'var(--exo-palette-purple-60)',
  'var(--exo-palette-periwinkle-60)',
  'var(--exo-palette-blue-60)',
  'var(--exo-palette-green-60)',
  'var(--exo-palette-yellow-60)',
  'var(--exo-palette-red-60)',
];

/** Deterministically pick a color for a source by index. */
export function getColorForSource(source: string, index: number): string {
  return SOURCE_COLORS[index % SOURCE_COLORS.length];
}

/** Normalize a variety of timestamp inputs into seconds (number) for ExChart. */
export function getDateTimestamp(raw: any): number | null {
  if (!raw) return null;
  const dateValue = raw?.$date ?? raw;

  // If it's already a number, check if it's seconds or milliseconds
  if (typeof dateValue === 'number') {
    // If it's less than year 2000 in seconds, it's likely already in seconds
    // If it's greater than year 2000 in milliseconds, it's in milliseconds
    if (dateValue < 946684800) {
      // Already in seconds (before year 2000 in seconds)
      return dateValue;
    }
    if (dateValue > 946684800000) {
      // In milliseconds, convert to seconds
      return Math.floor(dateValue / 1000);
    }
    // Between these values, assume milliseconds for safety
    return Math.floor(dateValue / 1000);
  }

  // Try to parse as date string
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  // ExChart expects seconds, convert from milliseconds
  return Math.floor(date.getTime() / 1000);
}

/** Extract a timestamp-like field from an API row and normalize to seconds. */
export function extractDateField(item: any): number | null {
  const dateValue =
    item.run_date ??
    item.date ??
    item.timestamp ??
    item.start_time ??
    item.time;

  return getDateTimestamp(dateValue);
}

/** Format a UTC day bucket (seconds) for the x-axis label. */
export function formatDateLabel(timestampSeconds: number): string {
  const date = new Date(timestampSeconds * 1000);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${month}/${day}`;
}

/** Convert any timestamp (seconds) to its UTC day-start bucket (seconds). */
export function toUtcDayStartSeconds(timestampSeconds: number): number {
  const date = new Date(timestampSeconds * 1000);
  return Math.floor(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ) / 1000,
  );
}

/** Extract the numeric metric value from an API row (with fallbacks). */
export function extractMetricValue(item: any, metric: Metric): number {
  switch (metric) {
    case 'bdu':
      return item.units ?? item.bdu ?? 0;
    case 'executions':
      return item.runs ?? item.executions ?? item.count ?? 0;
    case 'success_rate':
      return item.success_rate ?? 0;
    default:
      return (
        item.runs ??
        item.units ??
        item.count ??
        item.executions ??
        item.value ??
        item.total ??
        0
      );
  }
}

/** Extract a datasource/source identifier from an API row (with fallbacks). */
export function extractDatasourceName(item: any): string {
  return (
    item.datasource_id ??
    item.source_name ??
    item.source ??
    item.datasource_name ??
    item.source_id ??
    item.datasource ??
    'Unknown'
  );
}

/** Normalize multiple possible API response shapes into an array of rows. */
export function normalizeApiArray(apiData: any): any[] {
  if (!apiData) return [];
  if (Array.isArray(apiData)) return apiData;
  if (Array.isArray(apiData.time_series)) return apiData.time_series;
  if (Array.isArray(apiData.data)) return apiData.data;
  return [];
}

/** Normalize unknown error shapes into a readable string. */
export function normalizeError(error: any): string | null {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (error.data?.detail) return String(error.data.detail);
  if (error.data?.message) return String(error.data.message);
  if (error.message) return String(error.message);
  if (error.msg) return String(error.msg);
  return 'Unexpected error';
}

/** Dashboard-safe error message string for UI display. */
export function getErrorMessage(error: any): string | null {
  return normalizeError(error) || 'An error occurred while loading data';
}

/** Check whether an API error is a permission issue (403 or equivalent message). */
export function isPermissionError(
  error: any,
  errorMessage: string | null,
): boolean {
  const errorStatus = error && 'status' in error ? error.status : undefined;
  const errorOriginalStatus =
    error && 'originalStatus' in error ? error.originalStatus : undefined;
  const errorDataStatus =
    error &&
    'data' in error &&
    error.data &&
    typeof error.data === 'object' &&
    'status' in error.data
      ? (error.data as any).status
      : undefined;

  return (
    errorStatus === 403 ||
    errorOriginalStatus === 403 ||
    errorDataStatus === 403 ||
    (errorMessage && errorMessage.toLowerCase().includes('insufficient'))
  );
}

/** Human label for the y-axis and tooltip subheader for a metric. */
export function getYAxisLabel(metric: Metric): string {
  switch (metric) {
    case 'bdu':
      return 'BDU';
    case 'success_rate':
      return 'Success Rate (%)';
    case 'executions':
    default:
      return 'Executions';
  }
}

/** Human label for the series name in general view (and for boundary points). */
export function getSeriesLabel(metric: Metric): string {
  switch (metric) {
    case 'bdu':
      return 'BDU';
    case 'success_rate':
      return 'Success Rate';
    case 'executions':
    default:
      return 'Executions';
  }
}

/** Filter chart points to an inclusive [start,end] UTC bucket range when provided. */
export function filterChartDataByRange<T extends { x: number }>(
  chartData: T[],
  rangeStartBucketSeconds?: number,
  rangeEndBucketSeconds?: number,
): T[] {
  if (
    rangeStartBucketSeconds === undefined ||
    rangeEndBucketSeconds === undefined
  ) {
    return chartData;
  }
  return chartData.filter(
    p => p.x >= rangeStartBucketSeconds && p.x <= rangeEndBucketSeconds,
  );
}

/** Iterate inclusive UTC day buckets in seconds for a provided range. */
export function forEachDayBucketInRange(
  rangeStartBucketSeconds: number | undefined,
  rangeEndBucketSeconds: number | undefined,
  onBucket: (timestampSeconds: number) => void,
): void {
  if (
    rangeStartBucketSeconds === undefined ||
    rangeEndBucketSeconds === undefined
  ) {
    return;
  }

  for (
    let ts = rangeStartBucketSeconds;
    ts <= rangeEndBucketSeconds;
    ts += 86400
  ) {
    onBucket(ts);
  }
}
