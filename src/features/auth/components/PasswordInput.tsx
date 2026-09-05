"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

interface PasswordInputProps {
  placeholder?: string;
  error?: string;
  name?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PasswordInput({
  placeholder = "Enter your password",
  error,
  name,
  defaultValue,
  onChange,
}: PasswordInputProps) {
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-text-secondary transition hover:text-text-primary"
          tabIndex={-1}
          aria-label={showPassword ? t("hidePassword") : t("showPassword")}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onChange={onChange}
          className={
            "w-full rounded-xl border bg-background ps-4 pe-10 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary " +
            (error ? "border-error" : "border-border")
          }
        />
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}