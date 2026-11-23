import type { SectionFrontSetting } from "../types";

/**
 * Pure presentation config for the homepage "Shop by Category" section.
 *
 * The dashboard is the source of truth: `columns_count` / `rows_count` (and
 * the tablet/mobile variants) are rendered literally — there is no balancing
 * or column derivation. Tiles beyond a breakpoint's `columns × rows` capacity
 * are hidden on that breakpoint only, so each device shows exactly the
 * requested rows while desktop can keep more tiles than phones.
 */

type CategoryLayout = "grid" | "slider";
type CategoryShape = "square" | "circle";
type CategoryTileMode = "circle" | "card";

interface CategoryBreakpointLayout {
  columns: number;
  rows: number;
  /** Maximum tiles this breakpoint can show (`columns × rows`). */
  slots: number;
  /** `circle` renders round tiles; `card` renders the boxed square tile. */
  tileMode: CategoryTileMode;
}

export interface CategoryGridConfig {
  layout: CategoryLayout;
  shape: CategoryShape;
  /**
   * Tiles rendered by the server: the largest breakpoint capacity wins and
   * CSS hides the overflow per breakpoint (see the `data-cat-hide-*` rules).
   */
  maxVisible: number;
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
function parseCategoryLayout(value: unknown): CategoryLayout {
  return typeof value === "string" && value.trim().toLowerCase() === "slider"
    ? "slider"
    : "grid";
}

/**
 * Resolves one breakpoint's layout literally from the CMS counts. The shape
 * setting drives the tile style directly — a multi-row grid keeps circular
 * tiles when `shape` is `circle`.
 */
function resolveBreakpoint(
  front: Record<string, unknown> | undefined,
  defaults: BreakpointDefaults,
  shape: CategoryShape,
): CategoryBreakpointLayout {
  const columns = parseIntegerSetting(
    front?.[defaults.columnsKey],
    defaults.defaultColumns,
  );
  const rows = parseIntegerSetting(
    front?.[defaults.rowsKey],
    defaults.defaultRows,
  );

  return {
    columns,
    rows,
    slots: columns * rows,
    tileMode: shape === "circle" ? "circle" : "card",
  };
}

/** Parses all category layout settings for the three storefront breakpoints. */
export function resolveCategoryGridConfig(
  setting?: SectionFrontSetting,
): CategoryGridConfig {
  // Runtime values are free-form even though the TS type is narrower.
  const front = setting as Record<string, unknown> | undefined;
  const shape: CategoryShape = front?.shape === "circle" ? "circle" : "square";

  const desktop = resolveBreakpoint(front, BREAKPOINTS.desktop, shape);
  const tablet = resolveBreakpoint(front, BREAKPOINTS.tablet, shape);
  const mobile = resolveBreakpoint(front, BREAKPOINTS.mobile, shape);

  return {
    layout: parseCategoryLayout(front?.layout),
    shape,
    maxVisible: Math.max(desktop.slots, tablet.slots, mobile.slots),
    desktop,
    tablet,
    mobile,
  };
}
