"use client";

import Image from "next/image";
import Link from "next/link";
import type { CategoryMenuItem } from "../types";

type SubCategoryPaneProps = {
  activeCategory: CategoryMenuItem;
  onClose?: () => void;
};

function toCategoryHref(slug: string) {
  return `/category/${encodeURIComponent(slug)}`;
}

export default function SubCategoryPane({ activeCategory, onClose }: SubCategoryPaneProps) {
  return (
    <section className="overflow-y-auto overscroll-contain scrollbar-brand min-h-0">
      <div className="p-6">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-12 gap-y-8">
          {activeCategory.children.map((level2) => {
            const imageSrc = level2.image?.desktop || level2.image?.mobile;
            return (
            <div key={level2.id} className="min-w-0">
              <Link
                href={toCategoryHref(level2.slug)}
                onClick={onClose}
                className="flex items-center gap-2.5 text-[13px] font-semibold text-text-primary hover:text-primary-dark transition-colors"
              >
                {imageSrc && (
                  <Image
                    src={imageSrc}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-lg bg-white object-contain ring-1 ring-border"
                  />
                )}
                <span className="min-w-0">{level2.name}</span>
              </Link>

              {level2?.children?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {level2?.children?.map((level3) => (
                    <li key={level3.id}>
                      <Link
                        href={toCategoryHref(level3.slug)}
                        onClick={onClose}
                        className="block text-[13px] text-text-secondary hover:text-primary-dark transition-colors"
                      >
                        {level3.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
