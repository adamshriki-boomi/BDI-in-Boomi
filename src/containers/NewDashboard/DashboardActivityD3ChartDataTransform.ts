import { area, line, curveMonotoneX } from 'd3';
import type {
  Point,
  TooltipSourceRow,
  WideRow,
} from './DashboardActivityD3ChartTypes';

// ============================================================================
// Source & Domain Extraction
// ============================================================================

/**
 * Extracts unique source identifiers from data points.
 * Returns sources sorted alphabetically. Used as the initial source list
 * before sorting by volume. Returns provided sources if available (for color consistency).
 */
export function extractRawSources(
  data: Point[],
  providedSources?: string[],
): string[] {
  if (providedSources && providedSources.length > 0) {
    return providedSources;
  }
  return Array.from(
    new Set(
      data
        .map(d => d.z)
        .filter((z): z is string => typeof z === 'string' && z.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

/**
 * Extracts unique X-axis labels from data points in order of appearance.
 * Used to define the time buckets for both general and source views.
 */
export function extractXDomain(data: Point[]): string[] {
  return Array.from(new Set(data.map(d => String(d.x))));
}

/**
 * Groups data points by their X-axis label.
 * Used in source view to compute per-source totals at each time bucket.
 */
export function groupPointsByX(data: Point[]): Map<string, Point[]> {
  const map = new Map<string, Point[]>();
  data.forEach(point => {
    const xLabel = String(point.x);
    const bucket = map.get(xLabel);
    if (bucket) {
      bucket.push(point);
    } else {
      map.set(xLabel, [point]);
    }
  });
  return map;
}

// ============================================================================
// Source Totals Computation
// ============================================================================

/**
 * Computes total metric value per source at each X position.
 * Returns a map where each X label maps to a record of source name → total value.
 * Missing sources default to 0. Used for building wide rows and sorting sources by volume.
 */
export function computeSourceTotalsByX(
  xDomain: string[],
  pointsByX: Map<string, Point[]>,
): Map<string, Record<string, number>> {
  const totals = new Map<string, Record<string, number>>();
  xDomain.forEach(xLabel => {
    const bucket = pointsByX.get(xLabel) || [];
    const perSource: Record<string, number> = {};
    bucket.forEach(point => {
      const source =
        typeof point.z === 'string' && point.z.length > 0 ? point.z : 'Unknown';
      perSource[source] = (perSource[source] || 0) + (point.y || 0);
    });
    totals.set(xLabel, perSource);
  });
  return totals;
}

/**
 * Computes grand totals per source across all X positions.
 * Used to sort sources by volume (largest at top of stack).
 * Returns a record mapping source name to total value.
 */
export function computeSourceGrandTotals(
  rawSources: string[],
  xDomain: string[],
  sourceTotalsByX: Map<string, Record<string, number>>,
): Record<string, number> {
  const totals: Record<string, number> = {};
  rawSources.forEach(s => {
    totals[s] = 0;
  });
  xDomain.forEach(xLabel => {
    const perSource = sourceTotalsByX.get(xLabel) || {};
    rawSources.forEach(source => {
      totals[source] += perSource[source] || 0;
    });
  });
  return totals;
}

/**
 * Sorts sources by total volume (ascending) with alphabetical tie-breaking.
 * Returns provided sources as-is if available (to maintain color mapping).
 * Used to determine stacking order in source view (smallest at bottom, largest at top).
 */
export function sortSourcesByVolume(
  rawSources: string[],
  sourceTotals: Record<string, number>,
  providedSources?: string[],
): string[] {
  if (providedSources && providedSources.length > 0) {
    return providedSources;
  }
  return [...rawSources].sort((a, b) => {
    const totalA = sourceTotals[a] || 0;
    const totalB = sourceTotals[b] || 0;
    if (totalA === totalB) return a.localeCompare(b);
    return totalA - totalB;
  });
}

// ============================================================================
// Wide-Row Construction
// ============================================================================

/**
 * Transforms source totals into "wide" format rows for D3 stack layout.
 * Each row represents one X bucket with all sources as columns.
 * Missing sources are filled with 0 to ensure consistent stacking.
 * Used in source view for generating stacked area paths.
 */
export function buildWideRows(
  xDomain: string[],
  sources: string[],
  sourceTotalsByX: Map<string, Record<string, number>>,
): WideRow[] {
  return xDomain.map(xLabel => {
    const row: WideRow = {
      xLabel,
      ...(sourceTotalsByX.get(xLabel) || {}),
    };
    // Ensure all sources have numeric values (default to 0)
    sources.forEach(source => {
      const value = row[source];
      row[source] =
        typeof value === 'number' && Number.isFinite(value) ? value : 0;
    });
    return row;
  });
}

/**
 * Creates a fast lookup map from X label to wide row.
 * Used in tooltip hover handlers to quickly fetch row data.
 */
export function indexRowsByXLabel(rows: WideRow[]): Map<string, WideRow> {
  return new Map(rows.map(r => [r.xLabel, r]));
}

// ============================================================================
// Source View Path Generation
// ============================================================================

/**
 * Computes Y-axis maximum for source view.
 * For multi-line mode (success_rate), finds max individual value.
 * For stacked mode, finds max stacked total from D3 stack layers.
 */
export function computeSourceViewYMax(
  rows: WideRow[],
  sources: string[],
  layers: any,
  useMultiLine: boolean,
): number {
  if (useMultiLine) {
    // Multi-line: find max across all individual source values
    let individualYMax = 0;
    rows.forEach(row => {
      sources.forEach(source => {
        const value = row[source];
        if (
          typeof value === 'number' &&
          Number.isFinite(value) &&
          value > individualYMax
        ) {
          individualYMax = value;
        }
      });
    });
    return Math.max(1, individualYMax);
  } else {
    // Stacked: find max from stacked layers
    let stackedYMax = 0;
    for (const layer of layers) {
      for (const segment of layer) {
        const top = segment[1];
        if (
          typeof top === 'number' &&
          Number.isFinite(top) &&
          top > stackedYMax
        ) {
          stackedYMax = top;
        }
      }
    }
    return Math.max(1, stackedYMax);
  }
}

/**
 * Generates individual line paths for multi-line source view (e.g., success_rate percentages).
 * Each source gets its own line path with independent Y values.
 * Used when stacking doesn't make sense (percentages, rates, etc.).
 */
export function generateMultiLinePaths(
  rows: WideRow[],
  sources: string[],
  xScale: any,
  yScale: any,
  getColorForSource: (source: string, index: number) => string,
): Array<{ key: string; d: string; color: string }> {
  return sources.map(source => {
    const sourceData = rows.map(row => ({
      x: row.xLabel,
      y: typeof row[source] === 'number' ? (row[source] as number) : 0,
    }));

    return {
      key: source,
      d:
        line<{ x: string; y: number }>()
          .x(d => xScale(d.x) ?? 0)
          .y(d => yScale(d.y))
          .curve(curveMonotoneX)(sourceData) || '',
      color: getColorForSource(source, sources.indexOf(source)),
    };
  });
}

export function generateMultiLineAreaPaths(
  rows: WideRow[],
  sources: string[],
  xScale: any,
  yScale: any,
  getColorForSource: (source: string, index: number) => string,
): Array<{ key: string; d: string; color: string }> {
  return sources.map(source => {
    const sourceData = rows.map(row => ({
      x: row.xLabel,
      y: typeof row[source] === 'number' ? (row[source] as number) : 0,
    }));

    return {
      key: source,
      d:
        area<{ x: string; y: number }>()
          .x(d => xScale(d.x) ?? 0)
          .y0(yScale(0))
          .y1(d => yScale(d.y))
          .curve(curveMonotoneX)(sourceData) || '',
      color: getColorForSource(source, sources.indexOf(source)),
    };
  });
}

/**
 * Generates stacked area paths for source view.
 * Uses D3 stack layers to create filled areas that stack on top of each other.
 * Used for cumulative metrics (executions, BDU, etc.).
 */
export function generateStackedAreaPaths(
  layers: any,
  xDomainForScale: string[],
  xScale: any,
  yScale: any,
  sources: string[],
  getColorForSource: (source: string, index: number) => string,
): Array<{ key: string; d: string; fill: string }> {
  return layers.map((layer: any) => ({
    key: layer.key as string,
    d:
      area<[number, number]>()
        .x((_, i) => xScale(xDomainForScale[i]) ?? 0)
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(curveMonotoneX)(layer) || '',
    fill: getColorForSource(
      layer.key as string,
      Math.max(0, sources.indexOf(layer.key as string)),
    ),
  }));
}

// ============================================================================
// Tooltip Data Preparation
// ============================================================================

/**
 * Builds sorted tooltip rows for source view, showing each source's contribution at a given X position.
 * Filters out zero-value sources (configurable), sorts by value descending, and aggregates
 * sources beyond maxRows into an "Other" row.
 * Used when hovering over source view stacked areas.
 */
export function buildSourceTooltipRows(
  row: WideRow | undefined,
  sources: string[],
  getColorForSource: (source: string, index: number) => string,
  config: {
    includeZeroSources: boolean;
    maxRows: number;
    otherColor: string;
  },
): TooltipSourceRow[] {
  const baseRows: TooltipSourceRow[] = row
    ? sources
        .map(source => {
          const value = row[source];
          const num =
            typeof value === 'number' && Number.isFinite(value) ? value : 0;
          return {
            source,
            value: num,
            color: getColorForSource(source, sources.indexOf(source)),
          };
        })
        .filter(r => config.includeZeroSources || r.value > 0)
        .sort((a, b) => b.value - a.value)
    : [];

  // Aggregate sources beyond the max count into "Other"
  if (baseRows.length > config.maxRows) {
    return [
      ...baseRows.slice(0, config.maxRows),
      {
        source: 'Other',
        value: baseRows
          .slice(config.maxRows)
          .reduce((sum, r) => sum + r.value, 0),
        color: config.otherColor,
      },
    ];
  }

  return baseRows;
}
