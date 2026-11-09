"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

import { PatternTiles } from "./PatternTiles";
import { AuthHeader } from "./AuthHeader";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { AuthFeedback } from "./AuthFeedback";
import {
  loginAction,
  registerAction,
  forgotPasswordAction,
} from "../actions";
import { useAuthStore } from "../store/useAuthStore";
import { useSocialLoginError } from "../hooks/useSocialLoginError";

type AuthMode = "login" | "register" | "forgot-password";

interface AuthGatewayProps {
  logo?: string | null;
  siteName?: string;
}

export default function AuthGateway({ logo, siteName }: AuthGatewayProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  /** Honor deep links like /auth?mode=register (e.g. the auth modal's "Sign up"). */
  const modeParam = searchParams.get("mode");
  const [mode, setMode] = useState<AuthMode>(
    modeParam === "register" || modeParam === "forgot-password" ? modeParam : "login",
  );

  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("phone");
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileFileName, setProfileFileName] = useState<string | undefined>();
  /** Success message from a fresh registration, shown once on the login screen. */
  const [registerNotice, setRegisterNotice] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);
  const socialError = useSocialLoginError();

  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, null);
  const [registerState, registerFormAction, registerPending] = useActionState(registerAction, null);
  const [forgotPasswordState, forgotPasswordFormAction, forgotPasswordPending] = useActionState(forgotPasswordAction, null);

  const isLogin = mode === "login";
  const registerHandledRef = useRef(false);

  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  useEffect(() => {
    if (mode === "register") {
      registerHandledRef.current = false;
    }
  }, [mode]);

  /**
   * Registration no longer requires email verification: after a successful
   * signup the user is sent straight to the login screen with a notice.
   */
  useEffect(() => {
    if (!registerState) return;
    const noFieldErrors = !registerState.fieldErrors || Object.keys(registerState.fieldErrors).length === 0;
    if (
      registerState.success &&
      noFieldErrors &&
      registerState.payload?.email &&
      !registerHandledRef.current
    ) {
      registerHandledRef.current = true;
      setRegisterNotice(registerState.message ?? null);
      setMode("login");
    }
  }, [registerState]);

  useEffect(() => {
    if (
      loginState?.success &&
      loginState.data &&
      setSession(loginState.data)
    ) {
      router.push(redirectTo);
    }
  }, [loginState, setSession, router, redirectTo]);

  function onProfileImageChange(file: File | null) {
    setProfileFileName(file?.name);
    setProfilePreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function renderForm() {
    switch (mode) {
      case "login":
        return (
          <LoginForm
            action={loginFormAction}
            pending={loginPending}
            state={loginState}
            method={loginMethod}
            onMethodChange={setLoginMethod}
            onToggleMode={() => setMode("register")}
            onForgotPassword={() => setMode("forgot-password")}
          />
        );
      case "register":
        return (
          <RegisterForm
            action={registerFormAction}
            pending={registerPending}
            state={registerState}
            profilePreview={profilePreview}
            profileFileName={profileFileName}
            onProfileImageChange={onProfileImageChange}
            onToggleMode={() => setMode("login")}
          />
        );
      case "forgot-password":
        return (
          <ForgotPasswordForm
            action={forgotPasswordFormAction}
            pending={forgotPasswordPending}
            state={forgotPasswordState}
            onBack={() => setMode("login")}
            onDone={() => setMode("login")}
          />
        );
    }
  }

  function getFeedbackMessage() {
    if (mode === "forgot-password") {
      return {
        error: forgotPasswordState && !forgotPasswordState.success ? forgotPasswordState.message : null,
        success: forgotPasswordState?.success && !forgotPasswordState.payload?.token_verified ? forgotPasswordState.message : null,
      };
    }
    if (isLogin) {
      return {
        error: loginState && !loginState.success ? loginState.message : null,
        success: loginState?.success ? loginState.message : registerNotice,
      };
    }
    return {
      error: registerState && !registerState.success ? registerState.message : null,
      success: registerState?.success ? registerState.message : null,
    };
  }

  const { error: feedbackError, success: feedbackSuccess } = getFeedbackMessage();

  return (
    <section
      dir={isRtl ? "rtl" : "ltr"}
      className="relative isolate min-h-190 overflow-hidden rounded-3xl"
    >
      <PatternTiles />

      <div className="relative z-10 flex min-h-190 items-center justify-center p-2">
        <div className="w-full max-w-120 rounded-xl border border-border/80 bg-white/92 p-4 shadow-[0_16px_38px_rgba(0,74,151,0.15)] backdrop-blur-md sm:p-6">
          <AuthHeader isLogin={mode === "login"} logo={logo} siteName={siteName} />

          {socialError ? (
            <p className="mx-auto mt-4 max-w-md rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {socialError}
            </p>
          ) : null}

          {renderForm()}

          <AuthFeedback error={feedbackError} success={feedbackSuccess} />
        </div>
      </div>
    </section>
  );
}
