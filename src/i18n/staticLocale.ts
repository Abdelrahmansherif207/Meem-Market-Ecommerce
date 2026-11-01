import { setRequestLocale } from "next-intl/server";

type LocaleParams = { locale: string } & Record<string, unknown>;

/**
 * Resolves route params and opts the current layout/page into static
 * rendering with next-intl.
 *
 * next-intl requires `setRequestLocale()` in every layout AND page that should
 * be statically prerendered. Call it anywhere `params` is unwrapped:
 *
 * ```tsx
 * export default async function Page({ params }) {
 *   const { locale, slug } = await withStaticLocale(params);
 *   ...
 * }
 * ```
 */
export async function withStaticLocale<T extends LocaleParams>(
  params: Promise<T>,
): Promise<T> {
  const resolved = await params;
  setRequestLocale(resolved.locale);
  return resolved;
}
