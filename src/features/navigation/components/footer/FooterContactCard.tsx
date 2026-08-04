import type { ContactInfo } from "../../types";
import WhatsAppIcon from "@/components/ui/icons/WhatsAppIcon";
import PhoneIcon from "@/components/ui/icons/PhoneIcon";
import { cn } from "@/shared/utils/cn";

interface Props {
  contactInfo: ContactInfo;
  vertical?: boolean;
}

export default function FooterContactCard({ contactInfo, vertical = false }: Props) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-lg p-2">
      <a
        href={contactInfo.whatsappUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm leading-normal font-normal text-white transition-colors hover:text-white/80 hover:underline no-underline"
      >
        <span>{contactInfo.assistanceText}</span>
      </a>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center",
            vertical
              ? "flex-col items-start gap-3"
              : "justify-center items-center gap-20",
          )}
        >
          <div className="flex items-center gap-2">
                    <WhatsAppIcon className="size-6 shrink-0" />

          <span className="text-sm leading-normal font-normal text-white">{contactInfo.callUsText}</span>
          </div>
          <div className="flex items-center gap-2">
           <PhoneIcon className="size-7 shrink-0" />

          <span className="text-xl leading-none text-white">{contactInfo.phoneNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
