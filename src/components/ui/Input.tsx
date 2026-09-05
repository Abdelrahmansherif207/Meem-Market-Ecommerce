import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "@/shared/utils/cn";

const FIELD_BASE =
  "w-full rounded-lg border bg-white text-sm text-text-primary placeholder:text-text-muted transition-colors duration-200 focus:border-primary/50 focus:outline-none disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-60";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

export function FieldWrapper({ label, error, hint, htmlFor, children, className }: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-xs font-semibold text-text-primary">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <FieldWrapper label={label} error={error} hint={hint} htmlFor={inputId}>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(
          FIELD_BASE,
          "h-11 px-3.5",
          error ? "border-error focus:border-error" : "border-border",
          className,
        )}
        {...props}
      />
    </FieldWrapper>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const textareaId = id ?? autoId;

  return (
    <FieldWrapper label={label} error={error} hint={hint} htmlFor={textareaId}>
      <textarea
        ref={ref}
        id={textareaId}
        aria-invalid={error ? true : undefined}
        className={cn(
          FIELD_BASE,
          "min-h-24 px-3.5 py-2.5",
          error ? "border-error focus:border-error" : "border-border",
          className,
        )}
        {...props}
      />
    </FieldWrapper>
  );
});
