"use client";

import { useEffect, useRef } from "react";
import { Mail } from "lucide-react";
import { AuthTabs } from "./AuthTabs";
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
  onOtpLogin: () => void;
}

function ErrorMsg({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

export function LoginForm({
  action,
  pending,
  state,
  method,
  onMethodChange,
  onToggleMode,
  onForgotPassword,
  onOtpLogin,
}: LoginFormProps) {
  const fieldErrors = state?.fieldErrors ?? {};
  const p = state?.payload ?? {};
  const formKey = useRef(0);
  useEffect(() => {
    if (state?.success) {
      formKey.current += 1;
    }
  }, [state]);

  return (
    <form key={formKey.current} className="mx-auto mt-4 max-w-md space-y-2.5" action={action}>
      <input type="hidden" name="method" value={method} />

      <AuthTabs method={method} onMethodChange={onMethodChange} isLogin={true} />

      {method === "email" ? (
        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              defaultValue={p.email || ""}
              className={
                "w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary " +
                (fieldErrors.email ? "border-red-500" : "border-border")
              }
            />
          </div>
          <ErrorMsg message={fieldErrors.email} />
        </div>
      ) : (
        <PhoneInputWithCountry
          name="phone"
          placeholder="Enter your phone number"
          error={fieldErrors.phone}
          defaultValue={p.phone || ""}
        />
      )}

      <PasswordInput
        name="password"
        placeholder="Enter your password"
        error={fieldErrors.password}
        defaultValue={p.password || ""}
      />

      <div className="mb-1">
        <button type="button" onClick={onOtpLogin} className="text-xs font-semibold text-primary transition hover:text-primary-dark">Log in with OTP</button>
      </div>

      <div className="flex items-center justify-between">
        <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-semibold text-amber-600 transition hover:text-amber-700"
          >
            Forgot password?
          </button>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span>Don&apos;t have an account?</span>
          <button
            type="button"
            onClick={onToggleMode}
            className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-text-primary whitespace-nowrap transition hover:border-primary hover:text-primary"
          >
            Sign up
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
