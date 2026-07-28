"use client";

import Logo from "@/components/ui/Logo";

interface AuthHeaderProps {
  isLogin: boolean;
  isOtp?: boolean;
  onToggleMode?: () => void;
}

export function AuthHeader({ isLogin, isOtp }: AuthHeaderProps) {
  if (isOtp) {
    return (
      <>
        <h2 className="text-center text-2xl font-semibold text-text-primary sm:text-3xl">
          Verify your email
        </h2>
        <p className="mt-1 text-center text-sm text-text-secondary">
          Enter the verification code sent to your email.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-center">
        <Logo src="/meem-logo.png" alt="Meem Market" />
      </div>
      {!isLogin && (
        <h2 className="text-center text-2xl font-semibold text-text-primary sm:text-3xl">
          Create your account
        </h2>
      )}
      <p className="mt-1 text-center text-sm text-text-secondary">
        {isLogin
          ? "Please enter your login details below to continue."
          : "Use your details below to create a new account."}
      </p>
    </>
  );
}
