"use client";
import { useState } from "react";

function readQr(): string | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem("checkout_qr");
  if (stored) sessionStorage.removeItem("checkout_qr");
  return stored;
}

export function QRDisplay() {
  const [qrCode] = useState(readQr);

  if (!qrCode) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <img src={qrCode} alt="QR Code" className="size-48" />
    </div>
  );
}
