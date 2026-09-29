"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import type {
  FlowOption,
  FlowOptionSource,
  FlowValue,
  FlowValues,
  LocalizedText,
  OrderFlowInput,
} from "../types";
import { localizedText } from "../types";
import { flowOptionService } from "../services/flowOptionService";

interface FieldError {
  field: string;
  message: string;
}

interface FlowInputsSectionProps {
  inputs: OrderFlowInput[];
  values: FlowValues;
  errors: FieldError[];
  onChange: (key: string, value: FlowValue) => void;
  onBlurField?: (key: string) => void;
}

/** Only checkout-phase requirements are enforced client-side. */
export function isCheckoutRequired(input: OrderFlowInput): boolean {
  return input.required === true && input.required_at === "checkout";
}

/** Admin-side transition requirements are skipped entirely in the storefront. */
export function isTransitionInput(input: OrderFlowInput): boolean {
  return typeof input.required_at === "string" && input.required_at.startsWith("transition:");
}

export function FlowInputsSection({ inputs, values, errors, onChange, onBlurField }: FlowInputsSectionProps) {
  const t = useTranslations("checkout.flowInputs");
  const locale = useLocale();
  const lang = locale === "ar" ? "ar" : "en";
  const [optionMap, setOptionMap] = useState<Partial<Record<FlowOptionSource, FlowOption[] | null>>>({});

  const optionSources = Array.from(
    new Set(
      inputs
        .filter((i) => i.type === "select" || i.type === "multi_select")
        .map((i) => i.source)
        .filter((s): s is FlowOptionSource => !!s),
    ),
  );

  useEffect(() => {
    if (optionSources.length === 0) return;
    let cancelled = false;
    optionSources.forEach((source) => {
      if (optionMapHas(optionMap, source)) return;
      setOptionMap((prev) => ({ ...prev, [source]: null }));
      flowOptionService
        .load(source, locale, lang)
        .then((options) => {
          if (!cancelled) setOptionMap((prev) => ({ ...prev, [source]: options }));
        })
        .catch(() => {
          if (!cancelled) setOptionMap((prev) => ({ ...prev, [source]: [] }));
        });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionSources.join(","), locale]);

  const visible = inputs
    .filter((i) => !isTransitionInput(i))
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (visible.length === 0) return null;

  const errorFor = (key: string) => errors.find((e) => e.field === key)?.message;

  return (
    <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-1 rounded-full bg-primary w-6" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
          {t("title")}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visible.map((input) => (
          <FlowField
            key={input.key}
            input={input}
            locale={locale}
            value={values[input.key]}
            options={input.source ? optionMapGet(optionMap, input.source) : undefined}
            error={errorFor(input.key)}
            onChange={(value) => onChange(input.key, value)}
            onBlur={() => onBlurField?.(input.key)}
          />
        ))}
      </div>
    </div>
  );
}

function optionMapHas(
  map: Partial<Record<FlowOptionSource, FlowOption[] | null>>,
  source: FlowOptionSource,
) {
  return Object.prototype.hasOwnProperty.call(map, source);
}

function optionMapGet(
  map: Partial<Record<FlowOptionSource, FlowOption[] | null>>,
  source: FlowOptionSource,
): FlowOption[] | undefined {
  return map[source] ?? undefined;
}

interface FlowFieldProps {
  input: OrderFlowInput;
  locale: string;
  value: FlowValue | undefined;
  options?: FlowOption[];
  error?: string;
  onChange: (value: FlowValue) => void;
  onBlur: () => void;
}

function FlowField({ input, locale, value, options, error, onChange, onBlur }: FlowFieldProps) {
  const t = useTranslations("checkout.flowInputs");
  const label = localizedText(input.label as LocalizedText, locale);
  const placeholder = localizedText(input.placeholder, locale) || undefined;
  const helpText = localizedText(input.help_text, locale) || undefined;
  const fieldClass = `w-full rounded-xl border-2 bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/50 focus:border-primary ${
    error ? "border-red-300 focus:border-red-400" : "border-border"
  }`;
  const feedback = (
    <>
      {error && <p className="text-xs text-error">{error}</p>}
      {helpText && !error && <p className="text-xs text-text-secondary">{helpText}</p>}
    </>
  );

  switch (input.type) {
    case "boolean":
      return (
        <div className="space-y-1.5 sm:col-span-2" data-flow-key={input.key}>
          <label className="flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors border-border hover:border-primary/50">
            <input
              type="checkbox"
              name={`flow_${input.key}`}
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
              onBlur={onBlur}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm font-medium text-text-primary">
              {label}
              {isCheckoutRequired(input) && <span className="text-error"> *</span>}
            </span>
          </label>
          {feedback}
        </div>
      );
    case "date":
      return (
        <div className="space-y-1.5" data-flow-key={input.key}>
          <label className="text-sm font-semibold text-text-primary">
            {label}
            {isCheckoutRequired(input) && <span className="text-error"> *</span>}
          </label>
          <input
            type="date"
            name={`flow_${input.key}`}
            className={fieldClass}
            value={value != null && !Array.isArray(value) ? String(value) : ""}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          />
          {feedback}
        </div>
      );
    case "number":
      return (
        <div className="space-y-1.5" data-flow-key={input.key}>
          <label className="text-sm font-semibold text-text-primary">
            {label}
            {isCheckoutRequired(input) && <span className="text-error"> *</span>}
          </label>
          <input
            type="number"
            name={`flow_${input.key}`}
            className={fieldClass}
            placeholder={placeholder}
            value={value == null || Array.isArray(value) ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            onBlur={onBlur}
          />
          {feedback}
        </div>
      );
    case "select": {
      return (
        <div className="space-y-1.5" data-flow-key={input.key}>
          <label className="text-sm font-semibold text-text-primary">
            {label}
            {isCheckoutRequired(input) && <span className="text-error"> *</span>}
          </label>
          {options === null || options === undefined ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-border px-4 py-3 text-sm text-text-secondary">
              <Loader2 className="size-4 animate-spin" />
              {t("optionLoading")}
            </div>
          ) : (
            <select
              name={`flow_${input.key}`}
              className={fieldClass}
              value={value == null || Array.isArray(value) ? "" : String(value)}
              onChange={(e) => {
                onChange(e.target.value);
                onBlur();
              }}
            >
              <option value="">{placeholder ?? label}</option>
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          )}
          {feedback}
        </div>
      );
    }
    case "multi_select": {
      const selectedValues = Array.isArray(value) ? value.map(String) : [];
      return (
        <div className="space-y-1.5" data-flow-key={input.key}>
          <label className="text-sm font-semibold text-text-primary">
            {label}
            {isCheckoutRequired(input) && <span className="text-error"> *</span>}
          </label>
          {options === null || options === undefined ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-border px-4 py-3 text-sm text-text-secondary">
              <Loader2 className="size-4 animate-spin" />
              {t("optionLoading")}
            </div>
          ) : (
            <div
              className={`max-h-48 space-y-1 overflow-y-auto rounded-xl border-2 p-3 ${
                error ? "border-red-300" : "border-border"
              }`}
            >
              {options.length === 0 && (
                <p className="px-2 py-1 text-xs text-text-secondary">{t("noOptions")}</p>
              )}
              {options.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text-primary hover:bg-surface"
                >
                  <input
                    type="checkbox"
                    name={`flow_${input.key}`}
                    checked={selectedValues.includes(opt.id)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selectedValues, opt.id]
                        : selectedValues.filter((v) => v !== opt.id);
                      onChange(next);
                    }}
                    onBlur={onBlur}
                    className="h-4 w-4 accent-primary"
                  />
                  {opt.name}
                </label>
              ))}
            </div>
          )}
          {feedback}
        </div>
      );
    }
    // "text" and any unknown widget fall back to a plain text input.
    default:
      return (
        <div className="space-y-1.5" data-flow-key={input.key}>
          <label className="text-sm font-semibold text-text-primary">
            {label}
            {isCheckoutRequired(input) && <span className="text-error"> *</span>}
          </label>
          <input
            type="text"
            name={`flow_${input.key}`}
            className={fieldClass}
            placeholder={placeholder}
            value={value == null || Array.isArray(value) || typeof value === "boolean" ? "" : String(value)}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          />
          {feedback}
        </div>
      );
  }
}
