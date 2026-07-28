import Image from "next/image";
import { footerService } from "../../services/footerService";
import Logo from "@/components/ui/Logo";
import FooterColumn from "./FooterColumn";
import FooterBottomRow from "./FooterBottomRow";
import FooterContactCard from "./FooterContactCard";
import FooterAccordion from "./FooterAccordion";
import FooterAccordionItem from "./FooterAccordionItem";
import { getCachedSettings } from "@/features/settings/services/settingsService";

interface FooterProps {
  params: Promise<{ locale: string }>;
}

const socialIconUrls: Record<string, string> = {
  facebook:
    "https://cdnprod.mafretailproxy.com/assets/images/Facebook_0ddadaef3b_ea343675c7.svg",
  twitter:
    "https://cdnprod.mafretailproxy.com/assets/images/Twitter_44f3c5fb21_8a3f98290d.svg",
  instagram:
    "https://cdnprod.mafretailproxy.com/assets/images/Instagram_88847d8ba3_d534f2d78f.svg",
  youtube:
    "https://cdnprod.mafretailproxy.com/assets/images/Youtube_9cc9f992ab_ad97908e18.svg",
};

export default async function Footer({ params }: FooterProps) {
  const { locale } = await params;
  const data = await footerService.getFooter(locale);

  let logoSrc = "";
  let siteName = "";
  let copyright = "";
  let settingsSocial: { platform: string; url: string }[] = [];
  let fastShippingPublished = false;

  try {
    const settings = await getCachedSettings(locale);
    logoSrc = settings.footer_logo || settings.logo || "";
    siteName = settings.site_name || "";
    copyright = settings.site_copy_right || "";
    if (settings.fast_shipping_page_publish) fastShippingPublished = true;

    const platformMap: Record<string, string> = {
      facebook: settings.facebook,
      instagram: settings.instagram,
      linkedin: settings.linkedin,
      youtube: settings.youtube,
    };
    for (const [platform, url] of Object.entries(platformMap)) {
      if (url) settingsSocial.push({ platform, url });
    }
  } catch {
    // use defaults
  }

  if (fastShippingPublished) {
    const csColumn = data.columns.find((c) => c.title === "Customer Service" || c.title === "خدمة العملاء");
    if (csColumn) {
      csColumn.links.push({
        id: 99,
        label: locale === "ar" ? "الشحن السريع" : "Fast Shipping",
        slug: "/fast-shipping",
      });
    }
  }

  const mergedSocialLinks = settingsSocial.length > 0
    ? settingsSocial.map((s) => ({
        platform: s.platform as "facebook" | "twitter" | "instagram" | "youtube",
        url: s.url,
        label: s.platform.charAt(0).toUpperCase() + s.platform.slice(1),
      }))
    : data.socialLinks;


  return (
    <footer className="bg-black text-white mt-10">
      <div className="px-4 py-6 md:px-10">
        {/* ── Mobile Accordion ── */}
        <div className="lg:hidden">
          <div className="border-b border-white pb-4">
            <Logo src={logoSrc || ""} alt={siteName || "Logo"} textFallback={logoSrc ? undefined : (siteName || undefined)} />
            <p className="mt-4 text-xs leading-normal font-normal text-white">{data.contactInfo.stayInTouchText}</p>
            <div className="mt-2 flex">
              {mergedSocialLinks.map((s) => (
                <a
                  key={s.platform}
                  href={s.url || "#"}
                  aria-label={s.label}
                  className="pr-2 transition-opacity hover:opacity-80"
                >
                  <Image
                    alt={s.label}
                    width={24}
                    height={24}
                    src={socialIconUrls[s.platform] || socialIconUrls.facebook}
                    unoptimized
                  />
                </a>
              ))}
            </div>
          </div>

          <FooterAccordion columns={data.columns} />

          <FooterAccordionItem title={data.bottomRow.title}>
            <div>
              <FooterBottomRow data={data.bottomRow} />
            </div>
          </FooterAccordionItem>

          <div className="pt-4">
            <FooterContactCard contactInfo={data.contactInfo} />
          </div>
          {copyright && (
            <p className="text-xs text-white/60 text-center mt-4 pb-4">{copyright}</p>
          )}
        </div>

        {/* ── Desktop Grid ── */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-5 gap-4">
            <div>
              <Logo src={logoSrc || ""} alt={siteName || "Logo"} textFallback={logoSrc ? undefined : (siteName || undefined)} />
              <p className="mt-4 text-xs leading-normal font-normal text-white">{data.contactInfo.stayInTouchText}</p>
              <div className="mt-2 flex">
                {mergedSocialLinks.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url || "#"}
                    aria-label={s.label}
                    className="pr-2 transition-opacity hover:opacity-80"
                  >
                    <Image
                      alt={s.label}
                      width={24}
                      height={24}
                      src={socialIconUrls[s.platform] || socialIconUrls.facebook}
                      unoptimized
                    />
                  </a>
                ))}
              </div>
              <FooterContactCard contactInfo={data.contactInfo} />
            </div>

            {data.columns.slice(1).map((col, index) => (
              <FooterColumn
                key={col.id}
                column={col}
                cookieSettingsLabel={
                  index === 0 ? data.cookieSettingsLabel : undefined
                }
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            {copyright && (
              <p className="text-xs text-white/60">{copyright}</p>
            )}
            <FooterBottomRow data={data.bottomRow} />
          </div>
        </div>
      </div>
    </footer>
  );
}
