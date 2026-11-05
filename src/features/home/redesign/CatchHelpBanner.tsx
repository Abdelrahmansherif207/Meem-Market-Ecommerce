import { getTranslations } from "next-intl/server";
import { TriangleAlert, Mail, Phone, MessageCircle } from "lucide-react";
import { getCachedSettings } from "@/features/settings/services/settingsService";

/**
 * Screen "Do you need help?" banner — purple strip with 4 contact
 * options. Static content (no API): email/phone reuse site settings
 * when available; help center + WhatsApp are constants.
 */
export default async function CatchHelpBanner({ locale }: { locale: string }) {
  const t = await getTranslations("catchHome");

  let email = "cs@catchbeauty.com";
  let phone = "+974 9636 7199";
  try {
    const settings = await getCachedSettings(locale);
    email = settings.email_support || settings.site_email || email;
    phone = settings.phone || phone;
  } catch {
    // defaults
  }

  const options = [
    { icon: TriangleAlert, label: t("help.helpingCenter"), value: "help.catchbeauty.com", href: "#" },
    { icon: Mail, label: t("help.email"), value: email, href: `mailto:${email}` },
    { icon: MessageCircle, label: t("help.whatsapp"), value: t("help.chatWithUs"), href: "https://wa.me/97496367199" },
    { icon: Phone, label: t("help.callUs"), value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
  ];

  return (
    <section className="mx-3 mt-12 space-y-4 rounded-2xl bg-violet-banner p-4 text-white lg:mx-0 lg:rounded-none lg:p-8 lg:px-4 xl:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5">
          <h3 className="text-sm font-extrabold lg:text-base lg:font-bold">{t("help.title")}</h3>
          <p className="text-[10px] text-white/80 lg:text-xs">{t("help.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-4 lg:gap-6 lg:pt-2">
          {options.map((opt) => (
            <a key={opt.label} href={opt.href} className="flex items-center gap-3.5 transition-opacity hover:opacity-90">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <opt.icon className="h-5 w-5 text-white" />
              </span>
              <span>
                <span className="block text-xs text-white/80">{opt.label}</span>
                <span className="block text-xs font-semibold">{opt.value}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
