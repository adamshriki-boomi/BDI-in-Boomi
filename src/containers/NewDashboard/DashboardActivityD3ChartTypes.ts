import { VIEWS } from './dashboard.query';

// ============================================================================
// Chart Data Types
// ============================================================================

/**
 * Represents a single raw data point consumed by the chart.
 * Used in both general view (line/area chart) and source view (stacked area chart).
 * The `x` field is the time bucket label, `y` is the metric value, and `z` is the source/series identifier.
 */
export type Point = { x: string | number; y: number; z?: string };

/**
 * A data point that has been scaled to SVG coordinates for rendering.
 * Extends `Point` with computed pixel positions (`cx`, `cy`) and a normalized `xLabel`.
 * Used in general view for rendering line points and handling hover interactions.
 */
export type ScaledPoint = Point & { cx: number; cy: number; xLabel: string };

/**
 * A "wide" data row used for D3 stack layout in source view.
 * Each row represents one X-axis bucket with all source values as columns.
 * The `xLabel` is the time bucket identifier, and other keys are source names mapping to numeric values.
 * Missing sources default to 0 to ensure consistent stacking.
 */
export type WideRow = { xLabel: string; [key: string]: number | string };

// ============================================================================
// Tooltip State Types
// ============================================================================

/**
 * Discriminated union representing the tooltip's current state and data.
 * The `kind` field determines which view mode is active and what data is displayed.
 */
export type TooltipState = TooltipStateGeneral | TooltipStateSource;

/**
 * Tooltip state for general view (line/area chart).
 * Displays a single data point's value when hovering over a point on the line.
 * `cx` is used for positioning the vertical crosshair line.
 */
export type TooltipStateGeneral = {
  kind: typeof VIEWS.GENERAL;
  point: ScaledPoint;
  left: number;
  top: number;
  cx: number;
};

/**
 * Tooltip state for source view (stacked area chart).
 * Displays all sources at a given X position, sorted by value descending.
 * `activeSource` tracks which stacked layer the mouse is hovering over (for highlighting).
 * `rows` contains the list of sources and their values, potentially aggregated with "Other".
 */
export type TooltipStateSource = {
  kind: typeof VIEWS.SOURCE;
  xLabel: string;
  rows: TooltipSourceRow[];
  activeSource: string | null;
  left: number;
  top: number;
  cx: number;
};

/**
 * A single row in the source view tooltip, representing one source's contribution.
 * `source` is the name, `value` is the numeric metric, and `color` is the fill color for the legend swatch.
 */
export type TooltipSourceRow = {
  source: string;
  value: number;
  color: string;
};
