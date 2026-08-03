import { Suspense } from "react";
import type { Metadata } from "next";
import Breadcrumb from "@/components/ui/Breadcrumb";
import CategoryProducts from "@/features/categories/components/CategoryProducts";
import CategorySlider from "@/features/categories/components/CategorySlider";
import ProductsSidebar from "@/features/categories/components/ProductsSidebar";
import MobileCategorySidebar from "@/features/categories/components/MobileCategorySidebar";
import SidebarContent from "@/features/categories/components/SidebarContent";
import MobileSidebarContent from "@/features/categories/components/MobileSidebarContent";
import ProductsGridContent from "@/features/categories/components/ProductsGridContent";
import ProductsToolbar from "@/features/categories/components/ProductsToolbar";
import ActiveFilterChips from "@/features/categories/components/ActiveFilterChips";
import { CategoryMobileLayout } from "@/features/categories/components/CategoryMobileLayout";
import { categoryMenuService } from "@/features/categories/services/categoryMenuService";
import { getCategoryPageData, getCachedCategoryPageData, getBannerBySlug } from "@/features/categories/services/categoryProductsService";
import { findCategoryPath } from "@/features/categories/utils/categoryBreadcrumbs";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import ErrorState from "@/components/ui/ErrorState";
import RetryButton from "@/components/ui/RetryButton";
import { guardLoad } from "@/shared/lib/guardedFetch";
import { ProductsSidebarSkeleton } from "@/features/categories/components/skeletons/ProductsSidebarSkeleton";
import { CategoryProductsSkeleton } from "@/features/categories/components/skeletons/CategoryProductsSkeleton";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  let categoryName = decodedSlug;
  try {
    const categories = await categoryMenuService.getMenu(locale);
    const categoryPath = findCategoryPath(categories, decodedSlug);
    categoryName = categoryPath?.[categoryPath.length - 1]?.name ?? decodedSlug;
  } catch {
    // menu unavailable — fall back to the slug as the page title
  }
  const t = await getTranslations({ locale, namespace: "meta.category" });
  const description = t("description", { name: categoryName });

  return {
    title: categoryName,
    description,
    openGraph: {
      title: categoryName,
      description,
    },
  };
}

async function BannerPromotionContent({
  slug,
  locale,
  searchParams,
  seeMoreText,
  seeLessText,
}: {
  slug: string;
  locale: string;
  searchParams: Record<string, string | string[] | undefined>;
  seeMoreText: string;
  seeLessText: string;
}) {
  let result = await guardLoad(() => getCategoryPageData(slug, locale, searchParams, "banner"));
  if (result.ok && result.data.products.length === 0) {
    result = await guardLoad(() => getCategoryPageData(slug, locale, searchParams, "promotion"));
  }
  if (!result.ok) {
    const te = await getTranslations({ locale, namespace: "error" });
    return (
      <main className="flex flex-col py-10">
        <ErrorState
          variant="serverError"
          title={te("serverDownTitle")}
          description={te("serverDownDesc")}
          actions={<RetryButton label={te("retry")} />}
        />
      </main>
    );
  }
  const pageData = result.data;
  if (pageData.products.length === 0) {
    const banner = await getBannerBySlug(slug, locale);
    if (!banner) {
      notFound();
    }
  }
  const { products, filters, filterLabels, links } = pageData;

  return (
    <div className="flex gap-5 max-[991px]:gap-0 items-stretch">
      {/* Desktop sidebar */}
      <div className="max-[991px]:hidden block">
        <ProductsSidebar
          filters={filters}
          filterLabels={filterLabels}
          seeMoreText={seeMoreText}
          seeLessText={seeLessText}
        />
      </div>
      <div className="flex-1 max-[991px]:p-0">
        {/* Mobile filter bar — sits above the grid */}
        <div className="hidden max-[991px]:block">
          <MobileSidebarContent
            sidebarPromise={Promise.resolve({ filters, filterLabels })}
            seeMoreText={seeMoreText}
            seeLessText={seeLessText}
          />
        </div>
        <div className="max-[991px]:p-3">
          <ProductsToolbar links={links} />
          <ActiveFilterChips />
          <CategoryProducts products={products} links={links} />
        </div>
      </div>
    </div>
  );
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, slug } = await params;
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations({ locale, namespace: "header.breadcrumb" });
  const tf = await getTranslations({ locale, namespace: "header.filters" });
  const menuResult = await guardLoad(() => categoryMenuService.getMenu(locale));

  if (!menuResult.ok) {
    const te = await getTranslations({ locale, namespace: "error" });
    return (
      <main className="flex flex-col py-10">
        <ErrorState
          variant="serverError"
          title={te("serverDownTitle")}
          description={te("serverDownDesc")}
          actions={<RetryButton label={te("retry")} />}
        />
      </main>
    );
  }

  const categories = menuResult.data;

  const decodedSlug = decodeURIComponent(slug);
  const categoryPath = findCategoryPath(categories, decodedSlug);

  // banner/promotion page — slug is not a category
  if (!categoryPath) {
    return (
      <div className="w-full flex flex-col flex-1">
        <Breadcrumb
          items={[
            { label: t("home"), href: "/" },
            { label: decodedSlug },
          ]}
        />
        <Suspense
          fallback={
            <div className="flex gap-5 max-[991px]:gap-0 items-stretch flex-1">
              <div className="max-[991px]:hidden block">
                <ProductsSidebarSkeleton />
              </div>
              <div className="flex-1 max-[991px]:p-3">
                <CategoryProductsSkeleton />
              </div>
            </div>
          }
        >
          <BannerPromotionContent
            slug={decodedSlug}
            locale={locale}
            searchParams={resolvedSearchParams}
            seeMoreText={tf("seeMore")}
            seeLessText={tf("seeLess")}
          />
        </Suspense>
      </div>
    );
  }

  const parentCategory = categoryPath.length > 1 
    ? categoryPath[categoryPath.length - 2] 
    : categoryPath[0];
    
  const sliderCategories = parentCategory?.children || [];
  const sliderParentSlug = parentCategory?.slug || decodedSlug;

  const breadcrumbItems = [
    { label: t("home"), href: "/" },
    ...categoryPath.map((category) => ({
      label: category.name,
      href: `/category/${category.slug}`,
    })),
  ];

  const sidebarPromise = getCachedCategoryPageData(decodedSlug, locale, resolvedSearchParams)
    .catch(() => ({
      products: [],
      filters: {},
      filterLabels: {},
      links: {},
    }));

  return (
    <div className="w-full flex flex-col flex-1">
      {/* Breadcrumb — desktop only */}
      <div className="max-[991px]:hidden">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* ── MOBILE (≤991px) ─────────────────────────────────────────────────
       *  CategoryMobileLayout is a client component that:
       *   1. Measures the real header height on mount.
       *   2. Locks document body overflow so the PAGE itself doesn't scroll.
       *   3. Renders two panels (sidebar / content) each with their own
       *      overflow-y-auto so they scroll completely independently.
       * ──────────────────────────────────────────────────────────────────── */}
      <CategoryMobileLayout
        sidebar={
          <MobileCategorySidebar
            subCategories={sliderCategories}
            currentSlug={decodedSlug}
            parentSlug={sliderParentSlug}
          />
        }
        topBar={
          <Suspense fallback={null}>
            <MobileSidebarContent
              sidebarPromise={sidebarPromise}
              seeMoreText={tf("seeMore")}
              seeLessText={tf("seeLess")}
            />
          </Suspense>
        }
        content={
          <div className="p-3">
            <Suspense fallback={null}>
              <ProductsGridContent
                slug={decodedSlug}
                locale={locale}
                searchParams={resolvedSearchParams}
                renderToolbar
              />
            </Suspense>
            <Suspense fallback={<CategoryProductsSkeleton />}>
              <ProductsGridContent
                slug={decodedSlug}
                locale={locale}
                searchParams={resolvedSearchParams}
              />
            </Suspense>
          </div>
        }
      />

      {/* ── DESKTOP (>991px) ─────────────────────────────────────────────── */}
      <div className="hidden min-[992px]:flex gap-5 items-stretch flex-1">
        {/* Desktop Sidebar — streams independently */}
        <div>
          <Suspense fallback={<ProductsSidebarSkeleton />}>
            <SidebarContent
              sidebarPromise={sidebarPromise}
              seeMoreText={tf("seeMore")}
              seeLessText={tf("seeLess")}
            />
          </Suspense>
        </div>

        <div className="flex-1">
          {/* Desktop Category Slider */}
          <CategorySlider
            subCategories={sliderCategories}
            currentSlug={decodedSlug}
            parentSlug={sliderParentSlug}
          />
          {/* Products toolbar (search, sort, result count) */}
          <Suspense fallback={null}>
            <ProductsGridContent
              slug={decodedSlug}
              locale={locale}
              searchParams={resolvedSearchParams}
              renderToolbar
            />
          </Suspense>
          {/* Products grid */}
          <Suspense fallback={<CategoryProductsSkeleton />}>
            <ProductsGridContent
              slug={decodedSlug}
              locale={locale}
              searchParams={resolvedSearchParams}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
