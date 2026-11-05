import type { SVGProps } from "react";

/** Celebration ribbon icon (Material "celebration" glyph equivalent). */
export default function RibbonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M4.9 19.1 1 20.5 2.4 16.6 6 13.3 8.2 15.7z" fill="currentColor" stroke="none" />
      <path d="M19 6.4 17.6 5 7.7 14.9 9.1 16.3z" fill="currentColor" stroke="none" />
      <path d="m15.5 18.9-5-5 1.4-1.4 5 5z" fill="currentColor" stroke="none" />
      <path d="M13.5 10.5 16 8l1.6 1.6L15 12.1z" fill="currentColor" stroke="none" />
      <path d="m15 7 2-2" />
      <path d="M17.5 10.5 20 8" />
      <path d="M19 12.5l1.5-1.5" />
      <path d="M9 5.5 7.5 4" />
      <path d="M6.5 8.5 8 7" />
      <path d="M11.5 7.5 10 6" />
    </svg>
  );
}
