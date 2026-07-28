"use client";

import { useState } from "react";
import { Phone, ChevronDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/shared/utils/cn";

const COUNTRIES = [
  { code: "EG", name: "Egypt", dialCode: "+20" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971" },
  { code: "KW", name: "Kuwait", dialCode: "+965" },
  { code: "QA", name: "Qatar", dialCode: "+974" },
  { code: "BH", name: "Bahrain", dialCode: "+973" },
  { code: "OM", name: "Oman", dialCode: "+968" },
  { code: "JO", name: "Jordan", dialCode: "+962" },
  { code: "LB", name: "Lebanon", dialCode: "+961" },
  { code: "SY", name: "Syria", dialCode: "+963" },
  { code: "IQ", name: "Iraq", dialCode: "+964" },
  { code: "PS", name: "Palestine", dialCode: "+970" },
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "DE", name: "Germany", dialCode: "+49" },
];

interface PhoneInputWithCountryProps {
  placeholder?: string;
  error?: string;
  name?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function PhoneInputWithCountry({
  placeholder = "Enter your phone number",
  error,
  name,
  defaultValue,
  onChange,
}: PhoneInputWithCountryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneValue, setPhoneValue] = useState(defaultValue || "");

  const handleCountrySelect = (country: (typeof COUNTRIES)[0]) => {
    setSelectedCountry(country);
    setIsOpen(false);
  };

  const getFlagUrl = (code: string) => {
    return "https://flagcdn.com/w40/" + code.toLowerCase() + ".webp";
  };

  return (
    <div>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
        <div className="flex">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={
                "flex items-center gap-2 rounded-l-xl border border-r-0 bg-background px-3 py-2.5 text-sm font-semibold transition hover:bg-surface " +
                (error ? "border-red-500" : "border-border")
              }
            >
              <Image
                src={getFlagUrl(selectedCountry.code)}
                alt={selectedCountry.code}
                width={24}
                height={16}
                className="h-4 w-6 rounded object-cover"
              />
              <span className="text-text-secondary">{selectedCountry.dialCode}</span>
              <ChevronDown className="h-4 w-4 text-text-secondary" />
            </button>

            {isOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-64 overflow-y-auto rounded-lg border border-border bg-white shadow-lg">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-surface",
                      selectedCountry.code === country.code && "bg-primary/10",
                    )}
                  >
                    <Image
                      src={getFlagUrl(country.code)}
                      alt={country.code}
                      width={24}
                      height={16}
                      className="h-4 w-6 rounded object-cover"
                    />
                    <span className="flex-1 text-left">{country.name}</span>
                    <span className="text-text-secondary">{country.dialCode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            type="tel"
            placeholder={placeholder}
            defaultValue={defaultValue}
            onChange={(e) => { setPhoneValue(e.target.value); onChange?.(e.target.value); }}
            className={
              "flex-1 rounded-r-xl border bg-background px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary " +
              (error ? "border-red-500" : "border-border")
            }
          />
        </div>
      </div>
      {name && (
        <input type="hidden" name={name} value={`${selectedCountry.dialCode}${phoneValue}`} />
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
