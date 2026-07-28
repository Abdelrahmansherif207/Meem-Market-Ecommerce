interface Props {
  className?: string;
}

export default function ChevronIcon({ className }: Props) {
  return (
    <svg
      className={className}
      stroke="currentColor"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
