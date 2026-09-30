export const inputClass =
  "w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/50 focus:border-primary";
export const errorClass =
  "w-full rounded-xl border-2 border-red-300 bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/50 focus:border-red-400";
export const labelClass = "text-sm font-semibold text-text-primary";
export const radioClass = "h-4 w-4 accent-primary";

export function FieldErrorText({ message }: { message: string | undefined }) {
  if (!message) return null;
  return <p className="text-xs text-error">{message}</p>;
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-6 rounded-full bg-primary" />
      <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">{title}</h2>
    </div>
  );
}

/** Error text styling for selects/inputs driven by the FieldError contract. */
export function fieldClasses(hasError: boolean): string {
  return hasError ? errorClass : inputClass;
}
