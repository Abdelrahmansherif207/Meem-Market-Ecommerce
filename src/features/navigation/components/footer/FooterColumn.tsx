import { Link } from "@/i18n/navigation";
import type { FooterColumn as FooterColumnType } from "../../types";

interface Props {
  column: FooterColumnType;
  cookieSettingsLabel?: string;
}

export default function FooterColumn({ column, cookieSettingsLabel }: Props) {
  if (!column.links.length) return null;

  return (
    <div>
      <h3 className="mb-3.5 text-sm leading-normal font-normal text-white">{column.title}</h3>
      <ul>
        {column.links.map((link) => (
          <li key={link.id}>
            <Link
              href={link.slug || "#"}
              className="text-xs leading-normal font-normal text-white transition-colors hover:text-white hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      {cookieSettingsLabel && (
        <button
          type="button"
          className="text-xs leading-normal font-normal text-white transition-colors hover:text-white hover:underline"
        >
          {cookieSettingsLabel}
        </button>
      )}
    </div>
  );
}
