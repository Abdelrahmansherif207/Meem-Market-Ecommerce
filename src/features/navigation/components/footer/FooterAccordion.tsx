import type { FooterColumn } from "../../types";
import FooterAccordionItem from "./FooterAccordionItem";
import { Link } from "@/i18n/navigation";

interface Props {
  columns: FooterColumn[];
}

export default function FooterAccordion({ columns }: Props) {
  return (
    <div>
      {columns.slice(1).map((col) => (
        <FooterAccordionItem key={col.id} title={col.title ?? ""}>
          <ul>
            {col.links.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.slug || "#"}
                  className="block text-xs leading-normal font-normal text-white transition-colors hover:text-white hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </FooterAccordionItem>
      ))}
    </div>
  );
}
