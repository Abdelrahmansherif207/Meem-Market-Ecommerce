"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { cn } from "@/shared/utils/cn";

export type SearchInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "placeholder" | "onSubmit"
> & {
  prefixText: string;
  highlightText: string;
  wrapperClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
};

export function SearchInput({
  prefixText,
  highlightText,
  wrapperClassName,
  inputClassName,
  iconClassName,
  value,
  onSubmit,
  ...inputProps
}: SearchInputProps) {

  return (
    <form onSubmit={onSubmit} className={cn("relative w-full", wrapperClassName)}>
      <input
        {...inputProps}
        value={value}
        type="search"
        placeholder=" "
        className={cn(
          "peer h-10 w-full rounded-lg border bg-background ps-3 pe-10 py-5 text-sm text-text-primary placeholder:text-transparent focus:outline-none focus:border-transparent focus:ring-2 focus:ring-primary/20",
          inputClassName,
        )}
      />

      <div className="pointer-events-none absolute inset-y-0 start-3 hidden items-center text-sm text-text-secondary peer-placeholder-shown:flex gap-1">
        <span>{prefixText}</span>
        <span className="font-semibold text-text-secondary">
          {highlightText}
        </span>
      </div>

      <span className="absolute inset-y-0 end-3 flex items-center">
        <Search className={cn("h-5 w-5 text-text-secondary", iconClassName)} />
      </span>
    </form>
  );
}
