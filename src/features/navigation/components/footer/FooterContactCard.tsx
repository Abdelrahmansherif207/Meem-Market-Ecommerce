import type { ContactInfo } from "../../types";
import WhatsAppIcon from "@/components/ui/icons/WhatsAppIcon";
import PhoneIcon from "@/components/ui/icons/PhoneIcon";

interface Props {
  contactInfo: ContactInfo;
}

export default function FooterContactCard({ contactInfo }: Props) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-lg">
      <a
        href={contactInfo.whatsappUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm leading-normal font-normal text-white transition-colors hover:text-white/80"
      >
        <WhatsAppIcon className="size-6 shrink-0" />
        <span>{contactInfo.callUsText}</span>
      </a>

      <a
        href={`tel:${contactInfo.phoneNumber.replace(/\s+/g, "")}`}
        className="flex items-center gap-2 text-lg leading-none text-white transition-colors hover:text-white/80"
      >
        <PhoneIcon className="size-5 shrink-0" />
        <span className="whitespace-nowrap">{contactInfo.phoneNumber}</span>
      </a>
    </div>
  );
}
