import { getTranslations } from "next-intl/server";
import { tagService } from "../services/tagService";
import { TagPill } from "./TagPill";

export async function TagsPage({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "tags" });

  let tags;
  try {
    tags = await tagService.getTags(locale);
  } catch (error) {
    console.error("[TagsPage] Failed to load tags", error);
    return null;
  }

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">{t("title")}</h1>
      <p className="mb-6 text-sm text-text-secondary">{t("description")}</p>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <TagPill key={tag.id} name={tag.name} slug={tag.slug} />
        ))}
      </div>
    </main>
  );
}
