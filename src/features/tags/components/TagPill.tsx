import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";

interface TagPillProps {
  name: string;
  slug: string;
  className?: string;
  theme?: "light" | "dark";
}

export function TagPill({ name, slug, className, theme = "light" }: TagPillProps) {
  const isDark = theme === "dark";

  return (
    <Link
      href={`/tags/${slug}`}
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        isDark
          ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
          : "border-border bg-surface text-text-primary hover:border-primary hover:text-primary",
        className,
      )}
    >
      <span className={cn(isDark ? "text-white/60" : "text-primary")}>#</span>
      <span className="truncate">{name}</span>
    </Link>
  );
}
