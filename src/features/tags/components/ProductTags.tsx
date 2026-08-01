import { Link } from "@/i18n/navigation";
import type { ProductTag } from "@/shared/types";

interface ProductTagsProps {
  tags?: ProductTag[];
}

export function ProductTags({ tags }: ProductTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/tags/${tag.slug}`}
          className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
        >
          <span className="text-primary">#</span>
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
