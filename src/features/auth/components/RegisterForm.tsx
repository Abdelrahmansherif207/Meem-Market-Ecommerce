"use client";


import { Mail, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { PhoneInputWithCountry } from "./PhoneInputWithCountry";
import { PasswordInput } from "./PasswordInput";
import { ProfileImageUpload } from "./ProfileImageUpload";
import type { ActionState } from "../actions/types";

interface RegisterFormProps {
  action: (formData: FormData) => void;
  pending: boolean;
  state: ActionState | null;
  profilePreview: string | null;
  profileFileName?: string;
  onProfileImageChange: (file: File | null) => void;
  onToggleMode: () => void;
  onPasswordChange?: (password: string) => void;
}

function inputClass(error?: string) {
  return (
    "w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary " +
    (error ? "border-error" : "border-border")
  );
}

function ErrorMsg({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-error">{message}</p>;
}

export function RegisterForm({
  action,
  pending,
  state,
  profilePreview,
  profileFileName,
  onProfileImageChange,
  onToggleMode,
  onPasswordChange,
}: RegisterFormProps) {
  const t = useTranslations("auth");
  const fieldErrors = state?.fieldErrors ?? {};
  const p = state?.payload ?? {};

  return (
    <form className="mx-auto mt-4 max-w-md space-y-2.5" action={action}>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              name="firstName"
              placeholder={t("firstName")}
              defaultValue={p.firstName || ""}
              className={inputClass(fieldErrors.first_name)}
            />
          </div>
          <ErrorMsg message={fieldErrors.first_name} />
        </div>
        <div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              name="lastName"
              placeholder={t("lastName")}
              defaultValue={p.lastName || ""}
              className={inputClass(fieldErrors.last_name)}
            />
          </div>
          <ErrorMsg message={fieldErrors.last_name} />
        </div>
      </div>

      <div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
          <input
            type="email"
            name="email"
            placeholder={t("emailPlaceholder")}
            defaultValue={p.email || ""}
            className={inputClass(fieldErrors.email)}
          />
        </div>
        <ErrorMsg message={fieldErrors.email} />
      </div>

      <PhoneInputWithCountry
        name="phone"
        placeholder={t("phonePlaceholder")}
        error={fieldErrors.phone}
        defaultValue={p.phone || ""}
      />

      <PasswordInput
        name="password"
        placeholder={t("createPassword")}
        error={fieldErrors.password}
        defaultValue={p.password || ""}
        onChange={onPasswordChange ? (e) => onPasswordChange(e.target.value) : undefined}
      />

      <PasswordInput
        name="passwordConfirmation"
        placeholder={t("confirmPassword")}
        error={fieldErrors.password_confirmation}
        defaultValue={p.passwordConfirmation || ""}
      />

      <ProfileImageUpload
        name="avatar"
        preview={profilePreview}
        fileName={profileFileName}
        onChange={onProfileImageChange}
      />

      <label className="flex cursor-pointer items-start gap-2 text-xs text-text-secondary">
        <input
          type="checkbox"
          name="policy"
          defaultChecked={p.policy === "on"}
          className={"mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary" + (fieldErrors.policy ? " border-error" : "")}
        />
        <span>
          {t("agreeTo")}{" "}
          <a href="#" className="text-primary underline hover:text-primary-dark">
            {t("terms")}
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary underline hover:text-primary-dark">
            {t("privacy")}
          </a>
        </span>
      </label>
      <ErrorMsg message={fieldErrors.policy} />

      <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
        <span>{t("alreadyHaveAccount")}</span>
        <button
          type="button"
          onClick={onToggleMode}
          className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-text-primary transition hover:border-primary hover:text-primary"
        >
          {t("signIn")}
        </button>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? t("creatingAccount") : t("signUp")}
      </button>
    </form>
  );
}