"use client";


import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { AuthTabs } from "./AuthTabs";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { PhoneInputWithCountry } from "./PhoneInputWithCountry";
import { PasswordInput } from "./PasswordInput";
import type { ActionState } from "../actions/types";

type ContactMethod = "email" | "phone";

interface LoginFormProps {
  action: (formData: FormData) => void;
  pending: boolean;
  state: ActionState | null;
  method: ContactMethod;
  onMethodChange: (method: ContactMethod) => void;
  onToggleMode: () => void;
  onForgotPassword: () => void;
}

function ErrorMsg({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-error">{message}</p>;
}

export function LoginForm({
  action,
  pending,
  state,
  method,
  onMethodChange,
  onToggleMode,
  onForgotPassword,
}: LoginFormProps) {
  const t = useTranslations("auth");
  const fieldErrors = state?.fieldErrors ?? {};
  const p = state?.payload ?? {};

  return (
    <form className="mx-auto mt-4 max-w-md space-y-2.5" action={action}>
      <input type="hidden" name="method" value={method} />

      <AuthTabs method={method} onMethodChange={onMethodChange} isLogin={true} />

      {method === "email" ? (
        <div>
          <div className="relative">
            <Mail className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
            <input
              type="email"
              name="email"
              placeholder={t("emailPlaceholder")}
              defaultValue={p.email || ""}
              className={
                "w-full rounded-xl border bg-background ps-10 pe-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary " +
                (fieldErrors.email ? "border-error" : "border-border")
              }
            />
          </div>
          <ErrorMsg message={fieldErrors.email} />
        </div>
      ) : (
        <PhoneInputWithCountry
          name="phone"
          placeholder={t("phonePlaceholder")}
          error={fieldErrors.phone}
          defaultValue={p.phone || ""}
        />
      )}

      <PasswordInput
        name="password"
        placeholder={t("passwordPlaceholder")}
        error={fieldErrors.password}
        defaultValue={p.password || ""}
      />

      <div className="flex items-center justify-between">
        <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-semibold text-amber-600 transition hover:text-amber-700"
          >
            {t("forgotPassword")}
          </button>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span>{t("dontHaveAccount")}</span>
          <button
            type="button"
            onClick={onToggleMode}
            className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-text-primary whitespace-nowrap transition hover:border-primary hover:text-primary"
          >
            {t("signUp")}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? t("signingIn") : t("signIn")}
      </button>

      <GoogleLoginButton />
    </form>
  );
}
