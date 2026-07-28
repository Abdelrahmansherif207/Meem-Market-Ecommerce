"use client";

import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { VerifyEmailModal } from "./VerifyEmailModal";

export function VerificationBanner() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const emailVerified = useAuthStore((s) => s.emailVerified);
  const email = useAuthStore((s) => s.email);
  const [showModal, setShowModal] = useState(false);

  if (!isAuthenticated || emailVerified) return null;

  return (
    <>
      <div className="bg-red-500 px-4 py-2 text-center text-sm text-white">
        <span>
          Your email is not yet verified.
          {email ? <span className="ml-1 font-medium">({email})</span> : null}
        </span>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="ml-2 underline font-semibold hover:no-underline"
        >
          Verify now
        </button>
      </div>

      {showModal && (
        <VerifyEmailModal
          email={email || ""}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}