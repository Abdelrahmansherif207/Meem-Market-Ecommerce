import type { SectionFrontSetting } from "../types";

/**
 * Pure layout math for the homepage "Shop by Category" section.
 *
 * CMS `front` settings are free-form JSON, so every value is parsed
 * defensively here. The grid never hides categories: `targetRows` and
 * `maxColumns` only shape the column count, and the grid grows when the
 * categories cannot fit into the requested shape.
 */

export type CategoryLayout = "grid" | "slider";
export type CategoryTileMode = "circle" | "card";

export interface CategoryBreakpointLayout {
  /** Columns actually used by the grid at this breakpoint. */
  columns: number;
  /** Rows the grid will render for the current category count. */
  rows: number;
  /** Target rows coming from the CMS setting (used for column math). */
  targetRows: number;
  /** Maximum columns coming from the CMS setting. */
  maxColumns: number;
  /** Circle tiles only work for a single row; multi-row grids use cards. */
  tileMode: CategoryTileMode;
}

export interface CategoryGridConfig {
  layout: CategoryLayout;
  balanceLastRow: boolean;
  shape: "square" | "circle";
  desktop: CategoryBreakpointLayout;
  tablet: CategoryBreakpointLayout;
  mobile: CategoryBreakpointLayout;
}

interface BreakpointDefaults {
  columnsKey: string;
  rowsKey: string;
  defaultColumns: number;
  defaultRows: number;
}

const BREAKPOINTS: Record<"desktop" | "tablet" | "mobile", BreakpointDefaults> = {
  desktop: {
    columnsKey: "columns_count",
    rowsKey: "rows_count",
    defaultColumns: 8,
    defaultRows: 1,
  },
  tablet: {
    columnsKey: "tablet_columns_count",
    rowsKey: "tablet_rows_count",
    defaultColumns: 4,
    defaultRows: 2,
  },
  mobile: {
    columnsKey: "mobile_columns_count",
    rowsKey: "mobile_rows_count",
    defaultColumns: 4,
    defaultRows: 2,
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Coerces a CMS count. Accepts numbers or numeric strings, and falls back for
 * null / empty / non-numeric / zero / negative values. There is intentionally
 * no upper cap: the dashboard value is the source of truth.
 */
export function parseIntegerSetting(
  value: unknown,
  fallback: number,
): number {
  const parsed = toFiniteNumber(value);
  if (parsed === null || parsed <= 0) return fallback;
  return Math.max(1, Math.round(parsed));
}

/** Accepts booleans as well as the string/number shapes a CMS may send. */
export function parseBooleanSetting(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;
  }
  return fallback;
}

/** Only `slider` opts into the old rail; every other value is grid. */
export function parseCategoryLayout(value: unknown): CategoryLayout {
  return typeof value === "string" && value.trim().toLowerCase() === "slider"
    ? "slider"
    : "grid";
}

/**
 * Resolves the column count for one breakpoint.
 *
 * `maxCols` is the CMS column value and `targetRows` the CMS row value; both
 * are honored as-is. If the categories cannot fit into the target rows the
 * row count grows, and no category is ever hidden. With balancing enabled,
 * the smallest column count that keeps the same row count wins (e.g. 9 cards
 * / 4 max columns becomes 3x3 instead of 4+4+1).
 */
export function resolveCategoryColumns(
  total: number,
  maxCols: number,
  targetRows: number,
  balance: boolean,
): number {
  if (!Number.isFinite(total) || total <= 0) return 1;

  const safeTotal = Math.floor(total);
  const safeMaxCols = Number.isFinite(maxCols)
    ? Math.max(1, Math.round(maxCols))
    : 8;
  const safeTargetRows = Number.isFinite(targetRows)
    ? Math.max(1, Math.round(targetRows))
    : 1;

  const upper = Math.max(1, Math.min(safeMaxCols, safeTotal));
  let cols = clamp(Math.ceil(safeTotal / safeTargetRows), 1, upper);

  if (!balance) return cols;

  const rows = Math.ceil(safeTotal / cols);
  // Keep the same row count and use the smallest column count that does not
  // add another row. This avoids lonely cards in the final row.
  while (cols > 1 && Math.ceil(safeTotal / (cols - 1)) === rows) {
    cols -= 1;
  }
  return cols;
}

function resolveBreakpoint(
  total: number,
  front: Record<string, unknown> | undefined,
  defaults: BreakpointDefaults,
  balance: boolean,
  shape: "square" | "circle",
): CategoryBreakpointLayout {
  const maxColumns = parseIntegerSetting(
    front?.[defaults.columnsKey],
    defaults.defaultColumns,
  );
  const targetRows = parseIntegerSetting(
    front?.[defaults.rowsKey],
    defaults.defaultRows,
  );
  const columns = resolveCategoryColumns(total, maxColumns, targetRows, balance);
  const rows = Math.max(1, Math.ceil(total / columns));

  return {
    columns,
    rows,
    targetRows,
    maxColumns,
    tileMode: shape === "square" || rows >= 2 ? "card" : "circle",
  };
}

/** Parses all category layout settings for the three storefront breakpoints. */
export function resolveCategoryGridConfig(
  total: number,
  setting?: SectionFrontSetting,
): CategoryGridConfig {
  // Runtime values are free-form even though the TS type is narrower.
  const front = setting as Record<string, unknown> | undefined;
  const shape = front?.shape === "circle" ? "circle" : "square";
  const balanceLastRow = parseBooleanSetting(front?.balance_last_row, true);

  return {
    layout: parseCategoryLayout(front?.layout),
    balanceLastRow,
    shape,
    desktop: resolveBreakpoint(
      total,
      front,
      BREAKPOINTS.desktop,
      balanceLastRow,
      shape,
    ),
    tablet: resolveBreakpoint(
      total,
      front,
      BREAKPOINTS.tablet,
      balanceLastRow,
      shape,
    ),
    mobile: resolveBreakpoint(
      total,
      front,
      BREAKPOINTS.mobile,
      balanceLastRow,
      shape,
    ),
  };
}
