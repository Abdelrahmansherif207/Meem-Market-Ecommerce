"use client";

import { Mail, Phone } from "lucide-react";
import { cn } from "@/shared/utils/cn";

type ContactMethod = "email" | "phone";

interface AuthTabsProps {
  method: ContactMethod;
  onMethodChange: (method: ContactMethod) => void;
  isLogin: boolean;
}

export function AuthTabs({ method, onMethodChange, isLogin }: AuthTabsProps) {
  if (isLogin) {
    return (
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface p-1">
        <button
          type="button"
          onClick={() => onMethodChange("email")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition",
            method === "email"
              ? "bg-primary text-white"
              : "text-text-secondary hover:bg-white",
          )}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          type="button"
          onClick={() => onMethodChange("phone")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition",
            method === "phone"
              ? "bg-primary text-white"
              : "text-text-secondary hover:bg-white",
          )}
        >
          <Phone className="h-4 w-4" />
          Phone
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface p-1">
      <button
        type="button"
        onClick={() => onMethodChange("email")}
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition",
          method === "email"
            ? "bg-primary text-white"
            : "text-text-secondary hover:bg-white",
        )}
      >
        <Mail className="h-4 w-4" />
        Email
      </button>
      <button
        type="button"
        onClick={() => onMethodChange("phone")}
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition",
          method === "phone"
            ? "bg-primary text-white"
            : "text-text-secondary hover:bg-white",
        )}
      >
        <Phone className="h-4 w-4" />
        Phone
      </button>
    </div>
  );
}
