import { Suspense } from "react";
import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import CategoryProducts from "@/features/categories/components/CategoryProducts";
import SidebarContent from "@/features/categories/components/SidebarContent";
import MobileSidebarContent from "@/features/categories/components/MobileSidebarContent";
import { getCachedSearchPageData } from "@/features/categories/services/categoryProductsService";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProductsSidebarSkeleton } from "@/features/categories/components/skeletons/ProductsSidebarSkeleton";
import { CategoryProductsSkeleton } from "@/features/categories/components/skeletons/CategoryProductsSkeleton";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const resolved = await searchParams;
  const query = Array.isArray(resolved.q) ? resolved.q[0] : resolved.q;
  return {
    title: query ? `Search: ${query}` : "Search",
  };
}

async function SearchProductsGrid({
  locale,
  searchParams,
}: {
  locale: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { products } = await getCachedSearchPageData(locale, searchParams);

  if (products.length === 0) {
    notFound();
  }

  return <CategoryProducts products={products} />;
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const query = Array.isArray(resolvedSearchParams.q)
    ? resolvedSearchParams.q[0]
    : resolvedSearchParams.q;

  if (!query) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "header.breadcrumb" });
  const tf = await getTranslations({ locale, namespace: "header.filters" });

  const sidebarPromise = getCachedSearchPageData(locale, resolvedSearchParams);

  return (
    <div className="w-full pb-16">
      <Breadcrumb
        items={[
          { label: t("home"), href: "/" },
          { label: `Search: ${query}` },
        ]}
      />
      <div className="flex gap-5 max-[991px]:gap-0 items-stretch">
        <div className="max-[991px]:hidden block">
          <Suspense fallback={<ProductsSidebarSkeleton />}>
            <SidebarContent
              sidebarPromise={sidebarPromise}
              seeMoreText={tf("seeMore")}
              seeLessText={tf("seeLess")}
            />
          </Suspense>
        </div>
        <div className="flex-1 max-[991px]:p-0">
          <div className="hidden max-[991px]:block">
            <Suspense fallback={null}>
              <MobileSidebarContent
                sidebarPromise={sidebarPromise}
                seeMoreText={tf("seeMore")}
                seeLessText={tf("seeLess")}
              />
            </Suspense>
          </div>
          <div className="max-[991px]:p-3">
            <Suspense fallback={<CategoryProductsSkeleton />}>
              <SearchProductsGrid
                locale={locale}
                searchParams={resolvedSearchParams}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
