"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const SCROLL_THRESHOLD = 300;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={cn(
        "fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-primary text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary-dark hover:shadow-primary/30 active:scale-95 lg:bottom-6 lg:right-6",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}