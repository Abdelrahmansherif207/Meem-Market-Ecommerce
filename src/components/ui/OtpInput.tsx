"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/shared/utils/cn";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
}

const DEFAULT_LENGTH = 6;

export default function OtpInput({
  value,
  onChange,
  onComplete,
  length = DEFAULT_LENGTH,
  disabled = false,
  error,
  autoFocus = false,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const focusInput = useCallback((index: number) => {
    inputsRef.current[index]?.focus();
  }, []);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    }
  }, [autoFocus]);

  function updateValue(input: string, index: number) {
    const cleaned = input.replace(/D/g, "");
    if (!cleaned && input !== "") return;
    if (!cleaned) {
      const next = value.split("");
      next[index] = "";
      onChange(next.join(""));
      return;
    }
    const digitsArr = value.split("").slice(0, length);
    let cursor = index;
    for (const char of cleaned) {
      if (cursor >= length) break;
      digitsArr[cursor] = char;
      cursor += 1;
    }
    const nextValue = digitsArr.join("");
    onChange(nextValue);
    if (cursor < length) {
      focusInput(cursor);
    }
    if (nextValue.length === length && onComplete) {
      onComplete(nextValue);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === "Backspace") {
      if (value[index]) return;
      if (index > 0) {
        event.preventDefault();
        const next = value.split("");
        next[index - 1] = "";
        onChange(next.join(""));
        focusInput(index - 1);
      }
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }
    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const clipboard = event.clipboardData.getData("text").replace(/D/g, "").slice(0, length);
    if (!clipboard) return;
    event.preventDefault();
    const digitsArr = value.split("").slice(0, length);
    let cursor = 0;
    for (const char of clipboard) {
      if (cursor >= length) break;
      digitsArr[cursor] = char;
      cursor += 1;
    }
    const nextValue = digitsArr.join("");
    onChange(nextValue);
    focusInput(Math.min(cursor, length - 1));
    if (nextValue.length === length && onComplete) {
      onComplete(nextValue);
    }
  }

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => updateValue(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            ref={(el) => { inputsRef.current[index] = el; }}
            className={cn(
              "h-14 w-12 rounded-3xl border bg-background text-center text-2xl font-semibold text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 sm:w-14",
              disabled && "cursor-not-allowed opacity-50",
              error ? "border-red-500" : "border-border"
            )}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}
    </div>
  );
}
