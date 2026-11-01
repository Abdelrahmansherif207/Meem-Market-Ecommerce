/**
 * Static Tailwind grid-column classes keyed by admin-configured column counts.
 * Literal strings are required (no runtime interpolation) so the Tailwind
 * scanner can see every variant.
 *
 * - "one": grids that collapse to a single column on mobile (promo cards, etc.)
 * - "two": grids that keep two columns on mobile (brand logos, circles, etc.)
 */
export type GridBasis = "one" | "two";

const ONE_COLUMN: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  7: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7",
  8: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8",
};

const TWO_COLUMNS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
  7: "grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7",
  8: "grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
};

/**
 * Responsive grid-column classes for a section front setting
 * of `columns_count` (clamped to 1–8).
 */
export function gridColumnsClass(
  columnsCount?: number,
  basis: GridBasis = "one",
): string {
  const count = Math.max(1, Math.min(8, Math.round(columnsCount ?? 3)));
  const catalog = basis === "two" ? TWO_COLUMNS : ONE_COLUMN;
  return catalog[count] ?? catalog[3];
}
