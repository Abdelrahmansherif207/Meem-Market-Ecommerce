import { getTranslations } from "next-intl/server";
import { TriangleAlert, Mail, Phone, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { getCachedSettings } from "@/features/settings/services/settingsService";
import { buildWhatsAppUrl } from "@/features/settings/lib/normalize";

function HelpOptionLink({ href, children }: { href: string; children: ReactNode }) {
  const className =
    "flex items-center gap-3.5 rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

/**
 * Rawd Al-Aseel "Do you need help?" banner — deep green strip with the four
 * existing contact options. Email, phone and WhatsApp all come from the
 * normalized site settings (with Rawd Al-Aseel fallbacks).
 */
export default async function CatchHelpBanner({ locale }: { locale: string }) {
  const t = await getTranslations("catchHome");
  const settings = await getCachedSettings(locale);

  const email = settings.email_support || settings.site_email;
  const phone = settings.phone;
  const whatsappUrl = buildWhatsAppUrl(phone);

  const options = [
    {
      icon: TriangleAlert,
      label: t("help.helpingCenter"),
      value: t("help.helpCenterCta"),
      href: "/faq",
    },
    { icon: Mail, label: t("help.email"), value: email, href: `mailto:${email}` },
    {
      icon: MessageCircle,
      label: t("help.whatsapp"),
      value: t("help.chatWithUs"),
      href: whatsappUrl,
    },
    {
      icon: Phone,
      label: t("help.callUs"),
      value: phone,
      href: `tel:${phone.replace(/\s/g, "")}`,
    },
  ];

  return (
    <section className="mx-3 mt-12 sm:mx-4 lg:mx-8 lg:mt-16">
      <div className="mx-auto max-w-[1440px] rounded-2xl bg-catch-berry p-5 text-white shadow-elev-2 sm:p-6 lg:p-8">
        <div>
          <h3 className="text-sm font-extrabold tracking-tight lg:text-base">
            {t("help.title")}
          </h3>
          <p className="mt-1 text-[10px] text-white/75 lg:text-xs">
            {t("help.subtitle")}
          </p>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {options.map((opt) => (
            <HelpOptionLink key={opt.label} href={opt.href}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-catch-rose/20">
                <opt.icon className="h-5 w-5 text-catch-rose-soft" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] text-white/70 lg:text-xs">
                  {opt.label}
                </span>
                <span className="block truncate text-xs font-semibold">
                  {opt.value}
                </span>
              </span>
            </HelpOptionLink>
          ))}
        </div>
      </div>
    </section>
  );
}
