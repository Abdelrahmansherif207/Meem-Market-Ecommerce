"use client";

import { useState, type ReactNode } from "react";
import ChevronIcon from "@/components/ui/icons/ChevronIcon";

interface Props {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function FooterAccordionItem({
  title,
  children,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between py-4 text-left text-xs text-white transition-colors hover:no-underline"
      >
        <span className="text-sm font-normal">{title}</span>
        <ChevronIcon
          className={`size-5 shrink-0 text-white transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}
