import { Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface StepperStep {
  id: string;
  label: string;
}

interface StepperProps {
  steps: StepperStep[];
  /** Index of the active step. */
  current: number;
  /** Number of steps the user may click (all steps with index < clickableCount). */
  clickableCount?: number;
  onStepClick?: (index: number) => void;
  /** Compact label pattern, e.g. "Step {current} of {total}". */
  stepOfLabel?: string;
  className?: string;
}

/**
 * Generic numbered progress stepper. Purely presentational and domain-free.
 * - Desktop (md+): full row of numbered circles, labels and connector lines.
 * - Mobile: compact "current of total" pill with a progress track.
 * RTL: rendered in document flow, so the row mirrors automatically under
 * `dir="rtl"`; connectors use logical borders only.
 */
export default function Stepper({
  steps,
  current,
  clickableCount = 0,
  onStepClick,
  stepOfLabel,
  className,
}: StepperProps) {
  const total = steps.length;
  const safeCurrent = Math.min(Math.max(current, 0), total - 1);
  const progress = total > 1 ? (safeCurrent / (total - 1)) * 100 : 100;

  return (
    <div className={cn("w-full", className)} aria-label={stepOfLabel}>
      {/* Desktop: full stepper */}
      <ol className="hidden md:flex md:items-start">
        {steps.map((step, index) => {
          const isDone = index < safeCurrent;
          const isCurrent = index === safeCurrent;
          const isClickable = onStepClick && index < clickableCount && !isCurrent;
          const isLast = index === total - 1;
          return (
            <li
              key={step.id}
              className={cn("relative flex flex-col items-center", !isLast && "flex-1")}
            >
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-4 start-[calc(50%+1.5rem)] end-[calc(-50%+1.5rem)] h-0.5 rounded-full transition-colors",
                    isDone || isCurrent ? "bg-primary" : "bg-border",
                  )}
                />
              )}
              <button
                type="button"
                disabled={!isClickable}
                onClick={isClickable ? () => onStepClick?.(index) : undefined}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                  isDone && "border-primary bg-primary text-white",
                  isCurrent && "border-primary bg-white text-primary",
                  !isDone && !isCurrent && "border-border bg-white text-text-secondary",
                  isClickable && "cursor-pointer hover:bg-primary/10",
                  !isClickable && "cursor-default",
                )}
              >
                {isDone ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </button>
              <span
                className={cn(
                  "mt-2 px-1 text-center text-xs font-semibold",
                  isCurrent ? "text-primary" : isDone ? "text-text-primary" : "text-text-secondary",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-secondary">
            {stepOfLabel}
          </span>
          <span className="text-xs font-bold text-primary">
            {steps[safeCurrent]?.label}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
