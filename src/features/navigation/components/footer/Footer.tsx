import Image from "next/image";
import { assembleFooterContent } from "../../services/footerService";
import { SOCIAL_ICON_URLS } from "../../constants";
import Logo from "@/components/ui/Logo";
import FooterColumn from "./FooterColumn";
import FooterBottomRow from "./FooterBottomRow";
import FooterContactCard from "./FooterContactCard";
import FooterMobileContent from "./FooterMobileContent";

interface FooterProps {
  params: Promise<{ locale: string }>;
}

export default async function Footer({ params }: FooterProps) {
  const { locale } = await params;
  const { data, logoSrc, siteName, copyright, mergedSocialLinks } =
    await assembleFooterContent(locale);

  return (
    <footer className="bg-black text-white mt-10">
      <div className="px-4 py-6 md:px-10">
        {/* ── Mobile Accordion ── */}
        <div className="lg:hidden">
          <FooterMobileContent
            data={data}
            logoSrc={logoSrc}
            siteName={siteName}
            copyright={copyright}
            mergedSocialLinks={mergedSocialLinks}
          />
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
                      src={SOCIAL_ICON_URLS[s.platform] || SOCIAL_ICON_URLS.facebook}
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
