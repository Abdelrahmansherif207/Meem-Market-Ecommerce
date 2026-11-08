import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { DEFAULT_LOGO } from "@/features/settings/constants";

interface CatchMobileLogoLockupProps {
  /** CMS/settings logo. When absent or the default stacked logo, the compact Catch lockup is used. */
  src?: string | null;
  siteName?: string;
}

/**
 * Compact horizontal brand lockup for the mobile header: the emblem at the
 * same anchor and size as the sticky header, with the stacked CATCH BEAUTY
 * wordmark beside it. Keeping the emblem anchored makes the scroll handoff
 * to the sticky header feel continuous.
 */
export default function CatchMobileLogoLockup({
  src,
  siteName,
}: CatchMobileLogoLockupProps) {
  const brandName = siteName || "Catch Beauty";
  // The settings default is the stacked logo, which is too tall for the
  // search row; keep the emblem + wordmark lockup in that case.
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
        <>
          <span className="relative block h-8 w-[29px] overflow-hidden">
            <Image
              src="/catch-sticky-logo.jpg"
              alt=""
              width={976}
              height={1084}
              priority
              sizes="80px"
              className="absolute -left-[20px] -top-[7px] h-[77px] w-auto max-w-none object-contain mix-blend-multiply"
            />
          </span>
          <Image
            src="/catch-wordmark.png"
            alt=""
            width={293}
            height={112}
            priority
            className="h-[30px] w-auto"
          />
        </>
      )}
    </Link>
  );
}
