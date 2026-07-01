import { Box } from '@chakra-ui/react';
import { area, extent, line, scaleLinear, scalePoint, stack } from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getColorForSource } from './DashboardActivityChartUtil';
import type {
  Point,
  ScaledPoint,
  TooltipSourceRow,
  TooltipState,
  WideRow,
} from './DashboardActivityD3ChartTypes';
import {
  buildSourceTooltipRows as buildSourceTooltipRowsUtil,
  buildWideRows,
  computeSourceGrandTotals,
  computeSourceTotalsByX,
  computeSourceViewYMax,
  extractRawSources,
  extractXDomain,
  generateMultiLinePaths,
  generateMultiLineAreaPaths,
  generateStackedAreaPaths,
  groupPointsByX,
  indexRowsByXLabel,
  sortSourcesByVolume,
} from './DashboardActivityD3ChartDataTransform';
import { DashboardActivityChartTooltip } from './DashboardActivityD3ChartComponents';
import { METRICS, VIEWS } from './dashboard.query';

// ============================================================================
// Constants & Configuration
// ============================================================================

const CHART_CONFIG = {
  height: 350,
  margin: { top: 10, right: 10, bottom: 20, left: 50 },
  maxXLabels: 12,
  generalViewYTicks: 6,
  sourceViewYTicks: 8,
  tooltipMaxWidth: 240,
  tooltipEdgePadding: 16,
};

const GENERAL_VIEW_COLOR = 'var(--exo-palette-green-40)';

// ============================================================================
// Component
// ============================================================================

export function DashboardActivityD3Chart({
  data,
  tooltipSubheader,
  view = VIEWS.GENERAL,
  sources: sourcesProp,
  metric,
  sourceIndexMap,
  highlightedSource,
}: {
  data: Point[];
  tooltipSubheader?: string;
  view?: string;
  sources?: string[];
  metric?: string;
  sourceIndexMap?: Map<string, number>;
  highlightedSource?: string | null;
}) {
  const isSuccessRate = metric === METRICS.SUCCESS_RATE;
  const isMultiLinesView = view === VIEWS.SOURCE && isSuccessRate;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [isInitialRender, setIsInitialRender] = useState(true);

  const getColorForSourceWithMap = useMemo(
    () => (source: string, index: number) => {
      const originalIndex = sourceIndexMap?.get(source) ?? index;
      return getColorForSource(source, originalIndex);
    },
    [sourceIndexMap],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialRender(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // ==========================================================================
  // Formatting Helpers
  // ==========================================================================

  const monthFormatter = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', { month: 'long' });
  }, []);

  const formatXLabel = (label: string) => {
    const match = /^(\d{1,2})\/(\d{1,2})$/.exec(label.trim());
    if (!match) return label;
    const monthNum = Number(match[1]);
    const dayNum = Number(match[2]);
    if (!Number.isFinite(monthNum) || !Number.isFinite(dayNum)) return label;
    const date = new Date(2000, monthNum - 1, dayNum);
    if (Number.isNaN(date.getTime())) return label;
    return `${dayNum}-${monthFormatter.format(date)}`;
  };

  const formatValue = (value: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
    return isSuccessRate ? `${formatted}%` : formatted;
  };

  // ==========================================================================
  // Data Preparation (Source View)
  // ==========================================================================

  const rawSources = useMemo(
    () => extractRawSources(data, sourcesProp),
    [data, sourcesProp],
  );
  const xDomain = useMemo(() => extractXDomain(data), [data]);
  const pointsByX = useMemo(() => groupPointsByX(data), [data]);
  const sourceTotalsByX = useMemo(
    () => computeSourceTotalsByX(xDomain, pointsByX),
    [pointsByX, xDomain],
  );
  const sourceTotals = useMemo(
    () => computeSourceGrandTotals(rawSources, xDomain, sourceTotalsByX),
    [rawSources, sourceTotalsByX, xDomain],
  );
  const sources = useMemo(
    () => sortSourcesByVolume(rawSources, sourceTotals, sourcesProp),
    [rawSources, sourceTotals, sourcesProp],
  );
  const rows = useMemo(
    () => buildWideRows(xDomain, sources, sourceTotalsByX),
    [sourceTotalsByX, xDomain, sources],
  );
  const rowByXLabel = useMemo(() => indexRowsByXLabel(rows), [rows]);

  // ==========================================================================
  // Chart Computation
  // ==========================================================================

  const chartState = useMemo(() => {
    const { height, margin } = CHART_CONFIG;
    const innerW = containerWidth - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    // Shared axis computation for both views
    const computeAxes = (
      xDomainForScale: string[],
      xScale: any,
      yScale: any,
    ) => {
      const { maxXLabels } = CHART_CONFIG;
      const labelCount = Math.min(maxXLabels, xDomainForScale.length);
      const labelIndices = new Set<number>();

      if (labelCount <= 1) {
        labelIndices.add(0);
      } else {
        // Distribute labels evenly across the X-axis
        let lastIdx = -1;
        for (let i = 0; i < labelCount; i += 1) {
          let idx = Math.round(
            (i * (xDomainForScale.length - 1)) / (labelCount - 1),
          );
          if (idx <= lastIdx) idx = lastIdx + 1;
          if (idx > xDomainForScale.length - 1)
            idx = xDomainForScale.length - 1;
          labelIndices.add(idx);
          lastIdx = idx;
        }
        // Always show first and last labels
        labelIndices.add(0);
        labelIndices.add(xDomainForScale.length - 1);
      }

      const xTicks = xDomainForScale.map((value, index) => ({
        value,
        x: xScale(value) ?? 0,
        showLabel: labelIndices.has(index),
      }));

      const yTickCount =
        view === VIEWS.SOURCE
          ? CHART_CONFIG.sourceViewYTicks
          : CHART_CONFIG.generalViewYTicks;
      const yTicks = yScale.ticks(yTickCount).map((value: number) => ({
        value,
        y: yScale(value),
      }));

      return { xTicks, yTicks };
    };

    // General View: single line + area chart
    if (view === VIEWS.GENERAL) {
      const validData = data.filter(
        d => d != null && d.x != null && d.y != null,
      );
      const yExtent = extent(validData, d => d.y) as
        | [number, number]
        | undefined;
      const yExtentSafe =
        yExtent && Number.isFinite(yExtent[0]) && Number.isFinite(yExtent[1])
          ? yExtent
          : [0, 1];
      const xDomainForScale = xDomain;
      const xScale = scalePoint<string>()
        .domain(xDomainForScale)
        .range([0, innerW])
        .padding(0.5);
      const yMax = Number.isFinite(yExtentSafe[1])
        ? Math.max(0, yExtentSafe[1])
        : 1;
      const yScale = scaleLinear()
        .domain([0, yMax])
        .nice(CHART_CONFIG.generalViewYTicks)
        .range([innerH, 0]);
      const { xTicks, yTicks } = computeAxes(xDomainForScale, xScale, yScale);

      const scaledPoints = validData.map(d => ({
        ...d,
        xLabel: String(d.x),
        cx: xScale(String(d.x)) ?? 0,
        cy: yScale(d.y),
      }));

      const areaPath =
        area<Point>()
          .x(d => xScale(String(d.x)) ?? 0)
          .y0(yScale(0))
          .y1(d => yScale(d.y))(validData) || '';

      const linePath =
        line<Point>()
          .x(d => xScale(String(d.x)) ?? 0)
          .y(d => yScale(d.y))(validData) || '';

      return {
        view: VIEWS.GENERAL,
        useMultiLine: false,
        linePath,
        areaPath,
        scaledPoints,
        stackedAreaPaths: [],
        sourceLinePaths: [],
        sourceLineAreaPaths: [],
        hoverTargets: [],
        layers: null,
        xTicks,
        yTicks,
        innerW,
        innerH,
        width: containerWidth,
        height,
        margin,
        yMaxForScale: yScale.domain()[1] || yMax,
      };
    }

    // Source View: stacked area chart OR multi-line chart (for success_rate)
    const xDomainForScale = rows.map(r => r.xLabel);
    const xScale = scalePoint<string>()
      .domain(xDomainForScale)
      .range([0, innerW])
      .padding(0.5);

    // Compute layers for stacked view (needed for yMax calculation)
    const layers = isMultiLinesView
      ? null
      : stack<WideRow>().keys(sources)(rows);

    // Calculate yMax based on view
    const yMax = computeSourceViewYMax(rows, sources, layers, isMultiLinesView);
    const yScale = scaleLinear()
      .domain([0, yMax])
      .nice(CHART_CONFIG.sourceViewYTicks)
      .range([innerH, 0]);

    // Generate paths based on view
    const sourceLinePaths = isMultiLinesView
      ? generateMultiLinePaths(
          rows,
          sources,
          xScale,
          yScale,
          getColorForSourceWithMap,
        )
      : [];

    const sourceLineAreaPaths = isMultiLinesView
      ? generateMultiLineAreaPaths(
          rows,
          sources,
          xScale,
          yScale,
          getColorForSourceWithMap,
        )
      : [];

    const stackedAreaPaths = isMultiLinesView
      ? []
      : generateStackedAreaPaths(
          layers,
          xDomainForScale,
          xScale,
          yScale,
          sources,
          getColorForSourceWithMap,
        );

    const { xTicks, yTicks } = computeAxes(xDomainForScale, xScale, yScale);

    // Compute hover target rectangles for each X position
    const xPositions = xDomainForScale.map(xLabel => ({
      xLabel,
      cx: xScale(xLabel) ?? 0,
    }));

    const hoverTargets = xPositions.map((pos, index) => {
      const row = rowByXLabel.get(pos.xLabel);

      // Calculate Y value for tooltip positioning
      // For multi-line: use max individual value, for stacked: use stacked total
      const total = isMultiLinesView
        ? row
          ? Math.max(
              ...sources.map(s => {
                const value = row[s];
                return typeof value === 'number' && Number.isFinite(value)
                  ? value
                  : 0;
              }),
            )
          : 0
        : layers && index >= 0
        ? layers.reduce((max, layer: any) => {
            const seg = layer && layer[index];
            const top = seg && typeof seg[1] === 'number' ? seg[1] : 0;
            return top > max ? top : max;
          }, 0)
        : row
        ? sources.reduce((sum, s) => {
            const value = row[s];
            return (
              sum +
              (typeof value === 'number' && Number.isFinite(value) ? value : 0)
            );
          }, 0)
        : 0;

      // Calculate hover rectangle bounds (centered between adjacent points)
      const prevCx = index > 0 ? xPositions[index - 1].cx : pos.cx;
      const nextCx =
        index < xPositions.length - 1 ? xPositions[index + 1].cx : pos.cx;
      const leftBound =
        index === 0 ? pos.cx - (nextCx - pos.cx) / 2 : (prevCx + pos.cx) / 2;
      const rightBound =
        index === xPositions.length - 1
          ? pos.cx + (pos.cx - prevCx) / 2
          : (pos.cx + nextCx) / 2;
      const x = Math.max(0, leftBound);
      const right = Math.min(innerW, rightBound);
      const rectWidth = Math.max(0, right - x);

      return {
        xLabel: pos.xLabel,
        index,
        cx: pos.cx,
        x,
        width: rectWidth,
        tooltipY: yScale(total),
      };
    });

    return {
      view: VIEWS.SOURCE,
      useMultiLine: isMultiLinesView,
      linePath: '',
      areaPath: '',
      scaledPoints: [],
      stackedAreaPaths,
      sourceLinePaths,
      sourceLineAreaPaths,
      hoverTargets,
      layers,
      xTicks,
      yTicks,
      innerW,
      innerH,
      width: containerWidth,
      height,
      margin,
      yMaxForScale: yScale.domain()[1] || yMax,
    };
  }, [
    data,
    containerWidth,
    view,
    rows,
    xDomain,
    rowByXLabel,
    sources,
    isMultiLinesView,
    getColorForSourceWithMap,
  ]);

  // ==========================================================================
  // Tooltip Logic
  // ==========================================================================

  // Build sorted list of sources for source view tooltip
  const buildSourceTooltipRows = (
    row: WideRow | undefined,
  ): TooltipSourceRow[] => {
    return buildSourceTooltipRowsUtil(row, sources, getColorForSourceWithMap, {
      includeZeroSources: true,
      maxRows: Infinity,
      otherColor: 'var(--exo-color-font-secondary)',
    });
  };

  // Detect which stacked source layer the mouse is hovering over
  const getActiveSourceAt = (
    layerIndex: number,
    yValue: number,
    layers: any,
  ): string | null => {
    if (!layers || layerIndex < 0) return null;
    // Check layers from top to bottom
    for (let i = layers.length - 1; i >= 0; i -= 1) {
      const layer: any = layers[i];
      const seg = layer && layer[layerIndex];
      if (seg && typeof seg[0] === 'number' && typeof seg[1] === 'number') {
        if (yValue >= seg[0] && yValue <= seg[1]) {
          return (layer as any).key as string;
        }
      }
    }
    return null;
  };

  // Compute tooltip position (clamped to container bounds)
  const tooltipHalfWidth = useMemo(() => {
    if (!tooltip || tooltip.kind !== VIEWS.SOURCE)
      return CHART_CONFIG.tooltipMaxWidth / 2;
    const numSources = (
      tooltip as typeof tooltip & { rows: TooltipSourceRow[] }
    ).rows.length;
    const maxPerColumn = 6;
    const numColumns = Math.ceil(numSources / maxPerColumn);
    const tooltipWidth =
      numColumns > 1
        ? CHART_CONFIG.tooltipMaxWidth * numColumns
        : CHART_CONFIG.tooltipMaxWidth;
    return tooltipWidth / 2;
  }, [tooltip]);

  const tooltipLeft = useMemo(() => {
    if (!tooltip) return 0;
    const minLeft = tooltipHalfWidth + CHART_CONFIG.tooltipEdgePadding;
    const maxLeft = Math.max(
      minLeft,
      containerWidth - tooltipHalfWidth - CHART_CONFIG.tooltipEdgePadding,
    );
    return Math.max(minLeft, Math.min(maxLeft, tooltip.left));
  }, [tooltip, tooltipHalfWidth, containerWidth]);

  // Compute tooltip pointer triangle position
  const tooltipPointerLeft = useMemo(() => {
    if (!tooltip) return '50%';
    const delta = tooltip.left - tooltipLeft;
    const raw = tooltipHalfWidth + delta;
    const tooltipFullWidth = tooltipHalfWidth * 2;
    const clamped = Math.max(12, Math.min(tooltipFullWidth - 12, raw));
    return `${clamped}px`;
  }, [tooltip, tooltipHalfWidth, tooltipLeft]);

  // ==========================================================================
  // Effects
  // ==========================================================================

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      const nextWidth = entries[0]?.contentRect?.width;
      if (typeof nextWidth === 'number' && Number.isFinite(nextWidth)) {
        setContainerWidth(nextWidth);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  const handleHover = (
    targetData: {
      xLabel: string;
      index: number;
      cx: number;
      tooltipY: number;
      point?: ScaledPoint;
    },
    mouseEvent: any,
  ) => {
    // Handle General view
    if (chartState.view === VIEWS.GENERAL && targetData.point) {
      setTooltip({
        kind: VIEWS.GENERAL,
        point: targetData.point,
        left: chartState.margin.left + targetData.point.cx,
        top: chartState.margin.top + targetData.point.cy,
        cx: targetData.point.cx,
      });
      return;
    }

    // Handle Source view
    if (chartState.view !== VIEWS.SOURCE) return;

    const rect = containerRef.current?.getBoundingClientRect();
    const pointerX = rect
      ? mouseEvent.clientX - rect.left
      : chartState.margin.left + targetData.cx;
    const pointerY = rect
      ? mouseEvent.clientY - rect.top
      : chartState.margin.top + targetData.tooltipY;
    const cx = Math.max(
      0,
      Math.min(chartState.innerW, pointerX - chartState.margin.left),
    );

    const row = rowByXLabel.get(targetData.xLabel);
    const tooltipRows = buildSourceTooltipRows(row);

    // Convert mouse Y position to data value to determine active layer
    const y = Math.max(
      0,
      Math.min(chartState.innerH, pointerY - chartState.margin.top),
    );
    const yValue = chartState.yMaxForScale
      ? (1 - y / chartState.innerH) * chartState.yMaxForScale
      : 0;
    const activeSource = getActiveSourceAt(
      targetData.index,
      yValue,
      chartState.layers,
    );

    setTooltip({
      kind: VIEWS.SOURCE,
      xLabel: targetData.xLabel,
      rows: tooltipRows,
      activeSource,
      left: chartState.margin.left + cx,
      top: chartState.margin.top + targetData.tooltipY,
      cx,
    });
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  const viewBox = `0 0 ${chartState.width} ${chartState.height}`;

  return (
    <Box ref={containerRef} position="relative">
      {/* Tooltip */}
      {tooltip && (
        <DashboardActivityChartTooltip
          tooltip={tooltip}
          tooltipSubheader={tooltipSubheader}
          formatXLabel={formatXLabel}
          formatValue={formatValue}
          tooltipLeft={tooltipLeft}
          tooltipPointerLeft={tooltipPointerLeft}
          maxWidth={CHART_CONFIG.tooltipMaxWidth}
          generalViewColor={GENERAL_VIEW_COLOR}
        />
      )}

      {/* Chart SVG */}
      <svg viewBox={viewBox} width="100%" height={chartState.height}>
        <defs>
          <linearGradient
            id="dashboard-chart-gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={GENERAL_VIEW_COLOR}
              stopOpacity={0.25}
            />
            <stop
              offset="100%"
              stopColor={GENERAL_VIEW_COLOR}
              stopOpacity={0}
            />
          </linearGradient>
          {chartState.view === VIEWS.SOURCE &&
            !chartState.useMultiLine &&
            chartState.stackedAreaPaths.map((pathData, idx) => (
              <linearGradient
                key={`gradient-${idx}`}
                id={`source-gradient-${idx}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={pathData.fill} stopOpacity={0.5} />
                <stop
                  offset="100%"
                  stopColor={pathData.fill}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          {chartState.view === VIEWS.SOURCE &&
            chartState.useMultiLine &&
            chartState.sourceLineAreaPaths.map((pathData, idx) => (
              <linearGradient
                key={`line-gradient-${idx}`}
                id={`line-gradient-${idx}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={pathData.color}
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor={pathData.color}
                  stopOpacity={0.05}
                />
              </linearGradient>
            ))}
        </defs>

        <g
          transform={`translate(${chartState.margin.left},${chartState.margin.top})`}
        >
          {/* Area fills or lines depending on view */}
          {chartState.view === VIEWS.SOURCE && chartState.useMultiLine ? (
            <>
              {/* Multi-line view: gradient fills first */}
              {chartState.sourceLineAreaPaths.map((areaData, idx) => {
                const isHighlighted = areaData.key === highlightedSource;
                const hasHighlight = highlightedSource !== null;
                const baseOpacity = hasHighlight
                  ? isHighlighted
                    ? 0.8
                    : 0.2
                  : 0.1;
                return (
                  <path
                    key={`area-${areaData.key}`}
                    d={areaData.d}
                    fill={`url(#line-gradient-${idx})`}
                    opacity={
                      tooltip &&
                      tooltip.kind === VIEWS.SOURCE &&
                      (tooltip as any).activeSource
                        ? (tooltip as any).activeSource === areaData.key
                          ? 1
                          : 0.2
                        : baseOpacity
                    }
                    style={
                      isInitialRender
                        ? undefined
                        : { transition: 'opacity 0.3s ease' }
                    }
                  />
                );
              })}
              {/* Then smooth curved lines on top */}
              {chartState.sourceLinePaths.map(lineData => {
                const isHighlighted = lineData.key === highlightedSource;
                const hasHighlight = highlightedSource !== null;
                const baseOpacity = hasHighlight
                  ? isHighlighted
                    ? 0.85
                    : 0.3
                  : 0.85;
                const baseStrokeWidth = hasHighlight && isHighlighted ? 3 : 2;
                return (
                  <path
                    key={lineData.key}
                    d={lineData.d}
                    fill="none"
                    stroke={lineData.color}
                    strokeWidth={
                      tooltip &&
                      tooltip.kind === VIEWS.SOURCE &&
                      (tooltip as any).activeSource === lineData.key
                        ? 3
                        : baseStrokeWidth
                    }
                    opacity={
                      tooltip &&
                      tooltip.kind === VIEWS.SOURCE &&
                      (tooltip as any).activeSource
                        ? (tooltip as any).activeSource === lineData.key
                          ? 1
                          : 0.3
                        : baseOpacity
                    }
                    style={
                      isInitialRender
                        ? undefined
                        : {
                            transition:
                              'opacity 0.3s ease, stroke-width 0.3s ease',
                          }
                    }
                  />
                );
              })}
            </>
          ) : chartState.view === VIEWS.SOURCE ? (
            // Stacked area view
            chartState.stackedAreaPaths.map((pathData, idx) => {
              const isHighlighted = pathData.key === highlightedSource;
              const hasHighlight = highlightedSource !== null;
              const baseOpacity = hasHighlight ? (isHighlighted ? 1 : 0.3) : 1;
              return (
                <path
                  key={pathData.key}
                  d={pathData.d}
                  fill={`url(#source-gradient-${idx})`}
                  opacity={
                    tooltip &&
                    tooltip.kind === VIEWS.SOURCE &&
                    (tooltip as any).activeSource
                      ? (tooltip as any).activeSource === pathData.key
                        ? 1
                        : 0.25
                      : baseOpacity
                  }
                  stroke={pathData.fill}
                  strokeOpacity={0.9}
                  strokeWidth={1.2}
                  style={
                    isInitialRender
                      ? undefined
                      : { transition: 'opacity 0.3s ease, d 0.3s ease' }
                  }
                />
              );
            })
          ) : (
            // General view: area fill
            <path
              d={chartState.areaPath}
              fill="url(#dashboard-chart-gradient)"
            />
          )}

          {/* Crosshair line on hover */}
          {tooltip && (
            <line
              x1={tooltip.cx}
              y1={0}
              x2={tooltip.cx}
              y2={chartState.innerH}
              stroke="var(--exo-color-font)"
              strokeWidth={1}
              opacity={0.35}
            />
          )}

          {/* General view hover targets */}
          {chartState.view === VIEWS.GENERAL &&
            chartState.scaledPoints.map((point, index) => {
              const nextPoint = chartState.scaledPoints[index + 1];
              const prevPoint = chartState.scaledPoints[index - 1];
              const leftEdge = prevPoint ? (prevPoint.cx + point.cx) / 2 : 0;
              const rightEdge = nextPoint
                ? (point.cx + nextPoint.cx) / 2
                : chartState.innerW;
              return (
                <rect
                  key={point.xLabel}
                  x={leftEdge}
                  y={0}
                  width={rightEdge - leftEdge}
                  height={chartState.innerH}
                  fill="transparent"
                  onMouseEnter={(e: any) =>
                    handleHover(
                      {
                        xLabel: point.xLabel,
                        index: 0,
                        cx: point.cx,
                        tooltipY: point.cy,
                        point,
                      },
                      e,
                    )
                  }
                  onMouseMove={(e: any) =>
                    handleHover(
                      {
                        xLabel: point.xLabel,
                        index: 0,
                        cx: point.cx,
                        tooltipY: point.cy,
                        point,
                      },
                      e,
                    )
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}

          {/* Source view hover targets */}
          {chartState.view === VIEWS.SOURCE &&
            chartState.hoverTargets.map(targetData => (
              <rect
                key={targetData.xLabel}
                x={targetData.x}
                y={0}
                width={targetData.width}
                height={chartState.innerH}
                fill="transparent"
                onMouseEnter={(e: any) => handleHover(targetData, e)}
                onMouseMove={(e: any) => handleHover(targetData, e)}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}

          {/* Horizontal gridlines */}
          {chartState.yTicks.map(tick => (
            <line
              key={`grid-${tick.value}`}
              x1={0}
              y1={tick.y}
              x2={chartState.innerW}
              y2={tick.y}
              stroke="var(--exo-color-border)"
              strokeWidth={1}
              opacity={0.3}
            />
          ))}

          {/* X and Y axes */}
          <line
            x1={0}
            y1={chartState.innerH}
            x2={chartState.innerW}
            y2={chartState.innerH}
            stroke="var(--exo-color-border)"
            strokeWidth={1}
          />
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={chartState.innerH}
            stroke="var(--exo-color-border)"
            strokeWidth={1}
          />

          {/* X-axis ticks and labels */}
          {chartState.xTicks.map(tick => (
            <g
              key={tick.value}
              transform={`translate(${tick.x},${chartState.innerH})`}
            >
              <line y2={6} stroke="var(--exo-color-border)" strokeWidth={1} />
              {tick.showLabel && (
                <text
                  y={16}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--exo-color-font-secondary)"
                >
                  {formatXLabel(tick.value)}
                </text>
              )}
            </g>
          ))}

          {/* Y-axis ticks and labels */}
          {chartState.yTicks.map(tick => (
            <g key={tick.value} transform={`translate(0,${tick.y})`}>
              <line x2={-6} stroke="var(--exo-color-border)" strokeWidth={1} />
              <text
                x={-8}
                y={3}
                textAnchor="end"
                fontSize={10}
                fill="var(--exo-color-font-secondary)"
              >
                {tick.value}
                {isSuccessRate ? '%' : ''}
              </text>
            </g>
          ))}

          {/* General view line */}
          {chartState.view === VIEWS.GENERAL && (
            <path
              d={chartState.linePath}
              fill="none"
              stroke={GENERAL_VIEW_COLOR}
              strokeWidth={2}
              style={
                isInitialRender
                  ? undefined
                  : { transition: 'opacity 0.3s ease' }
              }
            />
          )}
        </g>
      </svg>
    </Box>
  );
}
