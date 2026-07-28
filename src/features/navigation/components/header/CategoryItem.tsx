import Link from "next/link";

export type CategoryItemProps = {
  href: string;
  name: string;
};

export default function CategoryItem({ href, name }: CategoryItemProps) {
  return (
    <li className="shrink-0">
      <Link
        href={href}
        className="rounded-md px-1.5 py-1 transition-colors font-bold leading-4"
      >
        {name}
      </Link>
    </li>
  );
}
