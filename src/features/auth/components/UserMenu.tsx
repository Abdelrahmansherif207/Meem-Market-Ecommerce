"use client";

import { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "@/i18n/navigation";

export function UserMenu() {
  const { isAuthenticated, logout, name, image } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-semibold text-text-primary transition hover:text-primary"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-1 ring-border">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={name ?? "user"}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-primary" />
          )}
        </span>
        {name && (
          <span className="hidden max-w-[7rem] truncate md:inline">{name}</span>
        )}
        <ChevronDown className="hidden h-4 w-4 md:inline" />
      </button>

      {open && (
        <div className="absolute end-0 top-full mt-2 w-48 rounded-xl border border-border bg-white shadow-lg z-50 py-2">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-surface transition"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <button
            type="button"
            onClick={() => { logout(); setOpen(false); }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
