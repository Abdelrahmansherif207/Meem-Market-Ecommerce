"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import FilterCheckbox from "./FilterCheckbox";

interface ExpandableListProps {
  items: string[];
  seeMoreText: string;
  seeLessText: string;
  checkedItems: string[];
  onToggle: (value: string) => void;
}

export default function ExpandableList({
  items,
  seeMoreText,
  seeLessText,
  checkedItems,
  onToggle,
}: ExpandableListProps) {
  const [expanded, setExpanded] = useState(false);
  const maxVisible = 6;
  const hasMore = items.length > maxVisible;
  const visibleItems = expanded ? items : items.slice(0, maxVisible);
  const remaining = items.length - maxVisible;

  return (
    <div className="space-y-0.5">
      {visibleItems.map((value) => (
        <FilterCheckbox
          key={value}
          value={value}
          checked={checkedItems.includes(value)}
          onChange={() => onToggle(value)}
        />
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="mt-1 flex min-h-9 w-full items-center justify-between rounded-xl px-2.5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
        >
          <span>
            {expanded ? seeLessText : `${seeMoreText} (+${remaining})`}
          </span>
          <ChevronDown
            className={`size-4 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}
