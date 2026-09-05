"use client";
import { useState } from "react";
import Image from "next/image";

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
      <Image src={qrCode} alt="QR Code" width={192} height={192} className="size-48" />
    </div>
  );
}
