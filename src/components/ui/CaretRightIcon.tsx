import type { SVGProps } from "react";

export function CaretRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      stroke="currentColor"
      viewBox="0 0 8 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0.5 0.75L6.75 7L0.5 13.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
