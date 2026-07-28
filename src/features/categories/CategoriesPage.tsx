import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { categoryMenuService } from "./services/categoryMenuService";
import SubcategoryCard from "./components/SubcategoryCard";

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
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">{t("title")}</h1>

      <div className="flex flex-col gap-10">
        {categories.map((category) => (
          <section key={category.id}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{category.name}</h2>
              <Link
                href={`/category/${category.slug}`}
                className="text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                {t("viewAll")}
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {category.children.map((child) => (
                <SubcategoryCard key={child.id} subcategory={child} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
