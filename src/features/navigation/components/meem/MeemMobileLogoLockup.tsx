import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { DEFAULT_LOGO } from "@/features/settings/constants";

interface MeemMobileLogoLockupProps {
  /** CMS/settings logo. When absent or the default stacked logo, the compact Meem lockup is used. */
  src?: string | null;
  siteName?: string;
}

/**
 * Compact horizontal brand lockup for the mobile header: the emblem at the
 * same anchor and size as the sticky header, with the stacked MEEM MARKET RIYADH
 * wordmark beside it. Keeping the emblem anchored makes the scroll handoff
 * to the sticky header feel continuous.
 */
export default function MeemMobileLogoLockup({
  src,
  siteName,
}: MeemMobileLogoLockupProps) {
  const brandName = siteName || "Meem Market Kuwait";
  // The settings default is the stacked logo, which is too tall for the
  // search row; use the compact horizontal Meem logo in that case.
  return (
    <Link
      href="/"
      aria-label={brandName}
      className="flex shrink-0 items-center gap-2"
    >
      {src && src !== DEFAULT_LOGO ? (
        <Image
          src={src}
          alt=""
          width={300}
          height={105}
          priority
          className="h-10 w-auto max-w-[140px] object-contain"
        />
      ) : (
        <Image
          src="/meem-logo.png"
          alt=""
          width={550}
          height={239}
          priority
          className="h-9 w-auto max-w-[130px] object-contain"
        />
      )}
    </Link>
  );
}
