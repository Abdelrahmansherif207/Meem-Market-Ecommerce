"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { X, Mail } from "lucide-react";
import { PatternTiles } from "./PatternTiles";
import { PhoneInputWithCountry } from "./PhoneInputWithCountry";
import { PasswordInput } from "./PasswordInput";
import { AuthTabs } from "./AuthTabs";
import { AuthFeedback } from "./AuthFeedback";
import { GoogleLoginButton } from "./GoogleLoginButton";
import Logo from "@/components/ui/Logo";
import { useAuthModalStore } from "../store/useAuthModalStore";
import { useAuthStore } from "../store/useAuthStore";
import { loginAction } from "../actions";
import { useRouter } from "@/i18n/navigation";
type ContactMethod = "email" | "phone";

export function AuthModal() {
  const { isOpen, close } = useAuthModalStore();

  if (!isOpen) return null;

  return <AuthModalContent close={close} />;
}

function AuthModalContent({ close }: { close: () => void }) {
  const [method, setMethod] = useState<ContactMethod>("email");
  const [state, formAction, pending] = useActionState(loginAction, null);
  const setAuthData = useAuthStore((s) => s.setAuthData);
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(timer);
  }, []);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  /* Prevent body scroll while open */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* Handle login success */
  useEffect(() => {
    if (state?.success && state.data) {
      setAuthData(state.data);
      close();
    }
  }, [state, setAuthData, close]);

function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) close();
  }

  const fieldErrors = state?.fieldErrors ?? {};
  const payload = state?.payload ?? {};

  return (
    /* ?? Overlay ?? */
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-label="Authentication"
    >
      {/* ?? Modal card ?? */}
      <div className="relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-background shadow-2xl">

        {/* ?? Top: animated pattern banner ?? */}
        <div className="relative h-52 overflow-hidden bg-surface">
          <PatternTiles />

          {/* Close button */}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-text-primary shadow backdrop-blur-sm transition hover:bg-white hover:shadow-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ?? Bottom: form area ?? */}
        <div className="px-6 pb-7 pt-5">
          {/* Heading */}
          <div className="mb-4 flex justify-center">
            <Logo src="/meem-logo.png" alt="Meem Market" />
          </div>
          <h2 className="mb-4 text-center text-xl font-bold text-text-primary">
            Hala! Let&apos;s get started
          </h2>

          {/* Email / Phone method tabs */}
          <AuthTabs method={method} onMethodChange={setMethod} isLogin={true} />

          {/* Login form */}
          <form
            action={formAction}
            className="mt-5 space-y-3"
          >
            <input type="hidden" name="method" value={method} />

            {method === "email" ? (
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
                  <input
                    ref={inputRef}
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    defaultValue={payload.email || ""}
                    className={
                      "w-full rounded-xl border bg-background pl-10 pr-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-secondary/70 focus:border-primary focus:ring-2 focus:ring-primary/10 " +
                      (fieldErrors.email ? "border-red-500" : "border-border")
                    }
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                )}
              </div>
            ) : (
              <PhoneInputWithCountry
                name="phone"
                placeholder="Enter your phone number"
                error={fieldErrors.phone}
                defaultValue={payload.phone || ""}
              />
            )}

            <PasswordInput
              name="password"
              placeholder="Enter your password"
              error={fieldErrors.password}
              defaultValue={payload.password || ""}
            />

            {state && !state.success && state.message && (
              <AuthFeedback error={state.message} />
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {pending ? "Signing in..." : "Sign in"}
            </button>

            <GoogleLoginButton />
          </form>

          <p className="mt-2 text-center text-xs">
            <button
              type="button"
              onClick={() => {
                close();
                router.push("/auth");
              }}
              className="font-medium text-amber-600 hover:text-amber-700 hover:underline"
            >
              Forgot password?
            </button>
          </p>

          <p className="mt-4 text-center text-xs text-text-secondary">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => {
                close();
                router.push("/auth");
              }}
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </button>
          </p>

          {/* Terms & Privacy */}
          <p className="mt-4 text-center text-xs text-text-secondary">
            By continuing, you agree to our{" "}
            <span className="cursor-pointer font-medium text-primary hover:underline">
              Terms of Use
            </span>{" "}
            &amp;{" "}
            <span className="cursor-pointer font-medium text-primary hover:underline">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
