import * as React from "react";
import { cn } from "@/shared/utils/cn";

export function AllCategoryIcon({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={cn("rounded-full stroke-2 transition-colors", className)}
      data-testid="un-selected-all-category-icon"
      height="111"
      stroke="currentColor"
      viewBox="0 0 96 103"
      width="113"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M37.8262 44.8697C41.7162 44.8697 44.8697 41.7162 44.8697 37.8262C44.8697 33.9362 41.7162 30.7827 37.8262 30.7827C33.9362 30.7827 30.7827 33.9362 30.7827 37.8262C30.7827 41.7162 33.9362 44.8697 37.8262 44.8697Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M58.1738 44.8697C62.0639 44.8697 65.2173 41.7162 65.2173 37.8262C65.2173 33.9362 62.0639 30.7827 58.1738 30.7827C54.2838 30.7827 51.1304 33.9362 51.1304 37.8262C51.1304 41.7162 54.2838 44.8697 58.1738 44.8697Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M37.8262 65.2173C41.7162 65.2173 44.8697 62.0639 44.8697 58.1738C44.8697 54.2838 41.7162 51.1304 37.8262 51.1304C33.9362 51.1304 30.7827 54.2838 30.7827 58.1738C30.7827 62.0639 33.9362 65.2173 37.8262 65.2173Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M58.1738 65.2173C62.0639 65.2173 65.2173 62.0639 65.2173 58.1738C65.2173 54.2838 62.0639 51.1304 58.1738 51.1304C54.2838 51.1304 51.1304 54.2838 51.1304 58.1738C51.1304 62.0639 54.2838 65.2173 58.1738 65.2173Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}
