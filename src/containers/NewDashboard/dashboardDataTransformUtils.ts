import { Metric, METRICS, View, VIEWS } from './dashboard.query';
import * as ChartUtils from './DashboardActivityChartUtil';
import { SourceTransformResult } from './DashboardActivityChartUtil';

/** Normalize general-view success_rate series for display (scale + boundary points). */
export function normalizeSuccessRateSeriesForGeneralView(
  generalData: ChartUtils.ExosphereDataPoint[] | null,
  metric: Metric,
  view: View,
): ChartUtils.ExosphereDataPoint[] | null {
  // Scale success_rate values from 0-1 to 0-100 for display
  if (
    metric === METRICS.SUCCESS_RATE &&
    view === VIEWS.GENERAL &&
    generalData
  ) {
    const scaledData = generalData.map(point => ({
      ...point,
      y: point.y * 100,
    }));

    // Add boundary points to force y-axis domain to 0-100
    const seriesName = ChartUtils.getSeriesLabel(metric);
    const timestamps = scaledData.map(p => p.x).filter(Boolean);

    if (timestamps.length > 0) {
      const firstTimestamp = scaledData.find(
        p => p.x === Math.min(...(timestamps as any)),
      )?.x;
      const lastTimestamp = scaledData.find(
        p => p.x === Math.max(...(timestamps as any)),
      )?.x;

      if (firstTimestamp && lastTimestamp) {
        // Add points at the actual first and last timestamps with y=0 and y=100
        scaledData.unshift({ x: firstTimestamp, y: 0, z: seriesName });
        scaledData.unshift({ x: firstTimestamp, y: 100, z: seriesName });
        scaledData.push({ x: lastTimestamp, y: 0, z: seriesName });
        scaledData.push({ x: lastTimestamp, y: 100, z: seriesName });
      }
    }

    return scaledData;
  }

  return generalData;
}

/** Transform source-view data when rows are commons-like (datasource_id + run_date present). */
export function transformSourceViewCommonsRows(
  dataArray: any[],
  metric: Metric,
  rangeStartBucketSeconds?: number,
  rangeEndBucketSeconds?: number,
): SourceTransformResult | null {
  const hasDatasourceId = dataArray.some(
    item => item && item.datasource_id !== undefined,
  );
  const hasRunDate = dataArray.some(
    item => item && item.run_date !== undefined,
  );

  if (!hasDatasourceId || !hasRunDate) return null;

  const perTimestamp: Map<number, Record<string, number>> = new Map();
  const sourcesSet = new Set<string>();

  for (const item of dataArray) {
    const timestamp = ChartUtils.extractDateField(item);
    if (!timestamp) continue;

    const dayBucket = ChartUtils.toUtcDayStartSeconds(timestamp);
    const sourceName = ChartUtils.extractDatasourceName(item);
    const value = ChartUtils.extractMetricValue(item, metric);

    sourcesSet.add(sourceName);

    const bucket = perTimestamp.get(dayBucket) ?? {};
    bucket[sourceName] = (bucket[sourceName] ?? 0) + value;
    perTimestamp.set(dayBucket, bucket);
  }

  const sources = Array.from(sourcesSet);
  const chartData: ChartUtils.ExosphereDataPoint[] = [];

  if (
    rangeStartBucketSeconds !== undefined &&
    rangeEndBucketSeconds !== undefined
  ) {
    ChartUtils.forEachDayBucketInRange(
      rangeStartBucketSeconds,
      rangeEndBucketSeconds,
      ts => {
        if (!perTimestamp.has(ts)) perTimestamp.set(ts, {});
      },
    );
  }

  perTimestamp.forEach((values, timestamp) => {
    sources.forEach(source => {
      let yValue = values[source] ?? 0;
      if (metric === METRICS.SUCCESS_RATE) {
        yValue = yValue * 100;
      }
      chartData.push({
        x: timestamp,
        y: yValue,
        z: source,
      });
    });
  });

  const filteredChartData = ChartUtils.filterChartDataByRange(
    chartData,
    rangeStartBucketSeconds,
    rangeEndBucketSeconds,
  );

  filteredChartData.sort((a, b) => a.x - b.x);
  return {
    chartData: filteredChartData.map(point => ({
      ...point,
      x: ChartUtils.formatDateLabel(point.x) as any,
    })) as any,
    sources,
  };
}

/** Transform source-view data when the response is wide (numeric columns per datasource). */
export function transformSourceViewWideShape(
  dataArray: any[],
  metric: Metric,
  rangeStartBucketSeconds?: number,
  rangeEndBucketSeconds?: number,
): SourceTransformResult | null {
  const first = dataArray[0];
  if (!first) return null;

  const wideSources = Object.keys(first).filter(key => {
    const lower = key.toLowerCase();
    if (
      ['date', 'run_date', 'timestamp', 'start_time', 'time', 'runs'].includes(
        lower,
      )
    ) {
      return false;
    }
    return typeof first[key] === 'number';
  });

  if (!wideSources.length) return null;

  const chartData: ChartUtils.ExosphereDataPoint[] = [];

  for (const item of dataArray) {
    const timestamp = ChartUtils.extractDateField(item);
    if (!timestamp) continue;

    const dayBucket = ChartUtils.toUtcDayStartSeconds(timestamp);
    for (const source of wideSources) {
      let yValue = item[source] ?? 0;
      if (metric === METRICS.SUCCESS_RATE) {
        yValue = yValue * 100;
      }
      chartData.push({
        x: dayBucket,
        y: yValue,
        z: source,
      });
    }
  }

  if (
    rangeStartBucketSeconds !== undefined &&
    rangeEndBucketSeconds !== undefined
  ) {
    const existingTimestamps = new Set(chartData.map(p => p.x));
    ChartUtils.forEachDayBucketInRange(
      rangeStartBucketSeconds,
      rangeEndBucketSeconds,
      ts => {
        if (!existingTimestamps.has(ts)) {
          wideSources.forEach(source => {
            chartData.push({ x: ts, y: 0, z: source });
          });
        }
      },
    );
  }

  const filteredChartData = ChartUtils.filterChartDataByRange(
    chartData,
    rangeStartBucketSeconds,
    rangeEndBucketSeconds,
  );

  filteredChartData.sort((a, b) => a.x - b.x);
  return {
    chartData: filteredChartData.map(point => ({
      ...point,
      x: ChartUtils.formatDateLabel(point.x) as any,
    })) as any,
    sources: wideSources,
  };
}

/** Fallback source-view transform when we can only infer sources via `extractDatasourceName`. */
export function transformSourceViewFallback(
  dataArray: any[],
  metric: Metric,
  rangeStartBucketSeconds?: number,
  rangeEndBucketSeconds?: number,
): SourceTransformResult {
  const perTimestamp: Map<number, Record<string, number>> = new Map();
  const sourcesSet = new Set<string>();

  for (const item of dataArray) {
    const timestamp = ChartUtils.extractDateField(item);
    if (!timestamp) continue;

    const dayBucket = ChartUtils.toUtcDayStartSeconds(timestamp);
    const sourceName = ChartUtils.extractDatasourceName(item);
    const value = ChartUtils.extractMetricValue(item, metric);

    sourcesSet.add(sourceName);

    const bucket = perTimestamp.get(dayBucket) ?? {};
    bucket[sourceName] = (bucket[sourceName] ?? 0) + value;
    perTimestamp.set(dayBucket, bucket);
  }

  const sources = Array.from(sourcesSet);
  const chartData: ChartUtils.ExosphereDataPoint[] = [];

  if (
    rangeStartBucketSeconds !== undefined &&
    rangeEndBucketSeconds !== undefined
  ) {
    ChartUtils.forEachDayBucketInRange(
      rangeStartBucketSeconds,
      rangeEndBucketSeconds,
      ts => {
        if (!perTimestamp.has(ts)) perTimestamp.set(ts, {});
      },
    );
  }

  perTimestamp.forEach((values, timestamp) => {
    sources.forEach(source => {
      chartData.push({
        x: timestamp,
        y: values[source] ?? 0,
        z: source,
      });
    });
  });

  const filteredChartData = ChartUtils.filterChartDataByRange(
    chartData,
    rangeStartBucketSeconds,
    rangeEndBucketSeconds,
  );

  filteredChartData.sort((a, b) => a.x - b.x);
  return {
    chartData: filteredChartData.map(point => ({
      ...point,
      x: ChartUtils.formatDateLabel(point.x) as any,
    })) as any,
    sources,
  };
}
