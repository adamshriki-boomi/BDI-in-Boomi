import { Box } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { RenderGuard } from 'components';
import { useGetAllDataSourcesQuery } from 'modules/Datasources/store';
import { Metric, METRICS, VIEWS } from './dashboard.query';
import { useDashboardRequestBody } from './hooks/useDashboardRequestBody';
import { useLocation } from 'react-router-dom';
import {
  getHasRivers,
  HasRiversResponse,
} from 'containers/Rivers/RiversV1/riversV1.query';
import { useAsyncFn, useEffectOnce } from 'react-use';
import { useCore } from 'store/core';
import {
  ChartLegend,
  DashboardEmptyState,
  ErrorState,
  LoadingState,
  NoRiversState,
  PermissionNeededState,
} from './DashboardActivityChartComponents';
import * as ChartUtils from './DashboardActivityChartUtil';
import {
  normalizeSuccessRateSeriesForGeneralView,
  transformSourceViewCommonsRows,
  transformSourceViewFallback,
  transformSourceViewWideShape,
} from './dashboardDataTransformUtils';
import { DashboardActivityD3Chart } from './DashboardActivityD3Chart';
import { DATA_CONNECTOR_AGENT_API_NAME } from './DashboardDropdownUtils';

// ---------- Transformations: general view ----------

function transformForGeneralView(
  apiData: any,
  metric: Metric,
  rangeStartBucketSeconds?: number,
  rangeEndBucketSeconds?: number,
): ChartUtils.ExosphereDataPoint[] | null {
  const dataArray = ChartUtils.normalizeApiArray(apiData);
  if (!dataArray.length) return null;

  const seriesName = ChartUtils.getSeriesLabel(metric);
  const byDay: Map<number, { sum: number; count: number }> = new Map();

  for (const item of dataArray) {
    const timestamp = ChartUtils.extractDateField(item);
    if (!timestamp) continue;

    const dayBucket = ChartUtils.toUtcDayStartSeconds(timestamp);
    const value = ChartUtils.extractMetricValue(item, metric);
    const agg = byDay.get(dayBucket) || { sum: 0, count: 0 };
    agg.sum += value;
    agg.count += 1;
    byDay.set(dayBucket, agg);
  }

  if (
    rangeStartBucketSeconds !== undefined &&
    rangeEndBucketSeconds !== undefined
  ) {
    ChartUtils.forEachDayBucketInRange(
      rangeStartBucketSeconds,
      rangeEndBucketSeconds,
      ts => {
        if (!byDay.has(ts)) byDay.set(ts, { sum: 0, count: 1 });
      },
    );
  }

  const chartData: ChartUtils.ExosphereDataPoint[] = Array.from(
    byDay.entries(),
  ).map(([x, agg]) => ({
    x,
    y: metric === METRICS.SUCCESS_RATE ? agg.sum / agg.count : agg.sum,
    z: seriesName,
  }));
  const filteredChartData = ChartUtils.filterChartDataByRange(
    chartData,
    rangeStartBucketSeconds,
    rangeEndBucketSeconds,
  );

  filteredChartData.sort((a, b) => a.x - b.x);
  return filteredChartData.map(point => ({
    ...point,
    x: ChartUtils.formatDateLabel(point.x) as any,
  })) as any;
}

// ---------- Transformations: source view ----------

function transformForSourceView(
  apiData: any,
  metric: Metric,
  rangeStartBucketSeconds?: number,
  rangeEndBucketSeconds?: number,
): ChartUtils.SourceTransformResult {
  const dataArray = ChartUtils.normalizeApiArray(apiData);
  if (!dataArray.length) {
    return { chartData: null, sources: [] };
  }

  const commonsResult = transformSourceViewCommonsRows(
    dataArray,
    metric,
    rangeStartBucketSeconds,
    rangeEndBucketSeconds,
  );
  if (commonsResult) return commonsResult;

  const wideResult = transformSourceViewWideShape(
    dataArray,
    metric,
    rangeStartBucketSeconds,
    rangeEndBucketSeconds,
  );
  if (wideResult) return wideResult;

  return transformSourceViewFallback(
    dataArray,
    metric,
    rangeStartBucketSeconds,
    rangeEndBucketSeconds,
  );
}

export function DashboardActivityChart({
  data,
  isLoading,
  error,
  view = VIEWS.GENERAL,
  metric = METRICS.EXECUTIONS,
  onResetToDefault,
}: ChartUtils.DashboardActivityChartProps) {
  const { activeAccountId } = useCore();
  const [{ value: riversData, loading: loadingRivers }, getHasRiversFn] =
    useAsyncFn(
      async (account_id: string) =>
        getHasRivers(account_id) as Promise<HasRiversResponse>,
      [],
    );

  useEffectOnce(() => {
    if (activeAccountId) {
      getHasRiversFn(activeAccountId);
    }
  });

  const hasRivers = Boolean(riversData?.has_rivers);

  // ---------- Range bucketing (requestBody timestamps -> day buckets) ----------
  const { search } = useLocation();
  const timezoneParam = useMemo(
    () => new URLSearchParams(search).get('timezone'),
    [search],
  );
  const requestBody = useDashboardRequestBody();
  const rangeStartSeconds = requestBody?.start_time
    ? Math.floor(requestBody.start_time / 1000)
    : undefined;
  const rangeEndSeconds = requestBody?.end_time
    ? Math.floor(requestBody.end_time / 1000)
    : undefined;
  const rangeStartBucketSeconds =
    rangeStartSeconds && rangeEndSeconds
      ? timezoneParam === 'local'
        ? Math.floor(
            Date.UTC(
              new Date(rangeStartSeconds * 1000).getFullYear(),
              new Date(rangeStartSeconds * 1000).getMonth(),
              new Date(rangeStartSeconds * 1000).getDate(),
              0,
              0,
              0,
              0,
            ) / 1000,
          )
        : ChartUtils.toUtcDayStartSeconds(rangeStartSeconds)
      : undefined;
  const rangeEndBucketSeconds =
    rangeStartSeconds && rangeEndSeconds
      ? timezoneParam === 'local'
        ? Math.floor(
            Date.UTC(
              new Date(rangeEndSeconds * 1000).getFullYear(),
              new Date(rangeEndSeconds * 1000).getMonth(),
              new Date(rangeEndSeconds * 1000).getDate(),
              0,
              0,
              0,
              0,
            ) / 1000,
          )
        : ChartUtils.toUtcDayStartSeconds(rangeEndSeconds)
      : undefined;
  const { data: allDataSources } = useGetAllDataSourcesQuery('source');

  // ---------- Source name mapping (id/api_name -> display name) ----------
  // For connector_executor, prefer Blueprint (api_name 'blueprint') over Data Connector Agent (api_name 'blueprint_copilot') so Source View legend matches the filter
  const getSourceDisplayName = useMemo(() => {
    const sourceMap = new Map<string, string>();
    if (allDataSources) {
      allDataSources.forEach((ds: any) => {
        const name = ds.name || ds.api_name || ds.id;
        if (ds.id) {
          if (ds.api_name === DATA_CONNECTOR_AGENT_API_NAME) return;
          if (!sourceMap.has(ds.id)) sourceMap.set(ds.id, name);
        }
        if (ds.api_name && !sourceMap.has(ds.api_name))
          sourceMap.set(ds.api_name, name);
      });
    }
    return (sourceId: string) => sourceMap.get(sourceId) || sourceId;
  }, [allDataSources]);

  // ---------- Data transform selection (general vs source view) ----------
  const { chartData, sources } = useMemo(() => {
    if (view === VIEWS.SOURCE) {
      const result = transformForSourceView(
        data,
        metric,
        rangeStartBucketSeconds,
        rangeEndBucketSeconds,
      );
      if (result.chartData && result.sources) {
        const processedChartData = result.chartData.map(point => ({
          ...point,
          z: getSourceDisplayName(point.z),
        }));

        return {
          chartData: processedChartData,
          sources: result.sources
            .map(getSourceDisplayName)
            .sort((a, b) => a.localeCompare(b)),
        };
      }
      return result;
    }
    const generalData = transformForGeneralView(
      data,
      metric,
      rangeStartBucketSeconds,
      rangeEndBucketSeconds,
    );

    return {
      chartData: normalizeSuccessRateSeriesForGeneralView(
        generalData,
        metric,
        view,
      ),
      sources: [],
    };
  }, [
    data,
    view,
    metric,
    getSourceDisplayName,
    rangeStartBucketSeconds,
    rangeEndBucketSeconds,
  ]);

  // ---------- Source highlighting state ----------
  const [highlightedSource, setHighlightedSource] = useState<string | null>(
    null,
  );

  const handleSourceClick = (source: string) => {
    setHighlightedSource(prev => (prev === source ? null : source));
  };

  // ---------- Error classification + derived flags ----------
  const isSourceView = view === VIEWS.SOURCE && sources.length > 0;
  const errorMessage = error ? ChartUtils.getErrorMessage(error) : null;
  const is403Error = ChartUtils.isPermissionError(error, errorMessage);

  // ---------- Chart options (colors, tooltip, axes) ----------
  const chartOptions = useMemo(() => {
    if (!chartData || !chartData.length) return null;

    const customization: Record<string, { color: string }> = {};

    if (isSourceView && sources.length > 0) {
      sources.forEach((source, index) => {
        customization[source] = {
          color: ChartUtils.getColorForSource(source, index),
        };
      });
    } else {
      const seriesName = ChartUtils.getSeriesLabel(metric);
      customization[seriesName] = {
        color: 'var(--exo-color-data-solid-coral)',
      };
    }

    const isGeneralView = view === VIEWS.GENERAL;
    const displayedChartData =
      metric === METRICS.SUCCESS_RATE
        ? chartData.map(point => ({
            ...point,
            y:
              typeof point.y === 'number'
                ? Number(point.y.toFixed(2))
                : point.y,
          }))
        : chartData;

    const baseOptions: any = {
      type: isGeneralView ? ('area' as const) : ('line-graph' as const),
      width: 1000,
      height: 340,
      areaBaseline: 0,
      scaleX: {
        type: 'ordinal' as const, // ordinal should fix the coloring, pending exosphere answer
        localizeTime: false,
        padding: 0,
      },
      data: displayedChartData,
      tooltip: {
        subheader: ChartUtils.getYAxisLabel(metric),
        compactNumber: true,
      },
      compactNumberYaxis: true,
      customization,
      hideXAxis: false,
      hideYAxis: false,
      hideGrid: false,
      paddingBottom: 0,
      paddingRight: 0,
      xAxisLabelDirection: 'slanted' as const,
      showLegends: false,
    };

    if (metric === METRICS.SUCCESS_RATE) {
      baseOptions.scaleY = {
        type: 'linear' as const,
        min: 0,
        max: 100,
        clamp: true,
      };
    }

    return baseOptions;
  }, [chartData, isSourceView, sources, metric, view]);

  const sourceIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    sources.forEach((source, index) => {
      map.set(source, index);
    });
    return map;
  }, [sources]);

  // ---------- Render states ----------
  if (is403Error) {
    return <PermissionNeededState onResetToDefault={onResetToDefault} />;
  }

  if (isLoading || loadingRivers) {
    return <LoadingState />;
  }

  if (!chartData || !chartData.length || !chartOptions) {
    if (errorMessage) {
      return <ErrorState message={errorMessage} />;
    }
    if (!hasRivers) {
      return <NoRiversState />;
    }
    return <DashboardEmptyState onResetToDefault={onResetToDefault} />;
  }

  return (
    <Box>
      {/* <ExChart options={chartOptions} /> */}
      <DashboardActivityD3Chart
        data={chartOptions.data}
        tooltipSubheader={chartOptions.tooltip?.subheader}
        view={view}
        sources={sources}
        metric={metric}
        sourceIndexMap={sourceIndexMap}
        highlightedSource={highlightedSource}
      />
      <RenderGuard condition={isSourceView}>
        <ChartLegend
          sources={sources}
          getColor={ChartUtils.getColorForSource}
          highlightedSource={highlightedSource}
          onSourceClick={handleSourceClick}
        />
      </RenderGuard>
    </Box>
  );
}
