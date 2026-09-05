import { Check } from "lucide-react";

interface FilterCheckboxProps {
  value: string;
  checked: boolean;
  onChange: () => void;
}

export default function FilterCheckbox({
  value,
  checked,
  onChange,
}: FilterCheckboxProps) {
  return (
    <label
      className={`group relative flex min-h-10 cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors duration-200 ${
        checked
          ? "bg-primary/[0.07] font-medium text-text-primary"
          : "text-text-secondary hover:bg-surface hover:text-text-primary"
      }`}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
      />
      <span className="flex size-4.5 shrink-0 items-center justify-center rounded-[5px] border border-border bg-background text-transparent transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary/25 peer-focus-visible:ring-offset-2 group-hover:border-primary/60">
        <Check className="size-3" strokeWidth={3} aria-hidden="true" />
      </span>
      <span className="min-w-0 wrap-break-word leading-5">{value}</span>
    </label>
  );
}
