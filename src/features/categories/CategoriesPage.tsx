import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { categoryMenuService } from "./services/categoryMenuService";
import CategoryGridCard from "./components/CategoryGridCard";

export async function CategoriesPage({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "categories" });

  let categories;
  try {
    categories = await categoryMenuService.getMenu(locale, 2);
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return null;
  }

  if (!categories?.length) return null;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-4 md:py-8">
      <h1 className="mb-6 text-xl font-bold md:mb-8 md:text-2xl">
        {t("title")}
      </h1>

      <div className="flex flex-col gap-7 md:gap-10">
        {categories.map((category) => {
          const parentImage =
            category.image?.mobile || category.image?.desktop;

          return (
            <section key={category.id}>
              <div className="mb-3 flex items-center justify-between gap-2 md:mb-4">
                <div className="flex min-w-0 items-center gap-2">
                  {parentImage && (
                    <Image
                      src={parentImage}
                      alt=""
                      width={36}
                      height={36}
                      sizes="36px"
                      className="h-9 w-9 shrink-0 rounded-xl object-contain"
                    />
                  )}
                  <h2 className="truncate text-lg font-bold md:text-xl">
                    {category.name}
                  </h2>
                </div>
                <Link
                  href={`/category/${category.slug}`}
                  className="shrink-0 text-xs font-semibold text-primary transition-colors hover:text-primary/80 md:text-sm"
                >
                  {t("viewAll")}
                </Link>
              </div>

              {/* Shared responsive grid on all breakpoints: 4 → 5 → 6 → 8 columns */}
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3 md:grid-cols-6 lg:grid-cols-8 lg:gap-4">
                {category.children.map((child) => (
                  <CategoryGridCard key={child.id} subcategory={child} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
