"use client";

import { X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const FILTER_KEYS = ["brand", "height", "width", "length", "weight", "category"];

export default function ActiveFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const chips: { key: string; value: string; label: string }[] = [];

  for (const key of FILTER_KEYS) {
    const vals = searchParams.get(key)?.split(",").filter(Boolean) || [];
    for (const v of vals) {
      chips.push({ key, value: v, label: `${key}: ${v}` });
    }
  }

  const page = searchParams.get("page");
  const sort = searchParams.get("sort");
  const search = searchParams.get("search");

  const removeChip = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(",").filter(Boolean) || [];
    const next = current.filter((v) => v !== value);
    if (next.length > 0) {
      params.set(key, next.join(","));
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    if (search) params.set("search", search);
    if (page) params.set("page", page);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {chips.map((chip) => (
        <span
          key={`${chip.key}-${chip.value}`}
          className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-primary"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => removeChip(chip.key, chip.value)}
            className="ml-0.5 hover:text-primary transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-xs text-text-secondary hover:text-primary transition-colors underline"
      >
        Clear all
      </button>
    </div>
  );
}
