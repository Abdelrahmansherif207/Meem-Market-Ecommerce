import type { ContactInfo } from "../../types";
import WhatsAppIcon from "@/components/ui/icons/WhatsAppIcon";
import PhoneIcon from "@/components/ui/icons/PhoneIcon";

interface Props {
  contactInfo: ContactInfo;
}

export default function FooterContactCard({ contactInfo }: Props) {
  return (
    <div className="mt-4 flex flex-col items-start gap-4 rounded-lg p-4">
      <a
        href={contactInfo.whatsappUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm leading-normal font-normal text-white transition-colors hover:text-white/80 hover:underline no-underline"
      >
        <WhatsAppIcon className="size-5 shrink-0" />
        <span>{contactInfo.assistanceText}</span>
      </a>
      <div className="flex items-center gap-2">
        <PhoneIcon className="size-5 shrink-0" />
        <div className="flex flex-col gap-1">
          <span className="text-sm leading-normal font-normal text-white">{contactInfo.callUsText}</span>
          <span className="text-sm font-bold leading-none text-white">{contactInfo.phoneNumber}</span>
        </div>
      </div>
    </div>
  );
}
