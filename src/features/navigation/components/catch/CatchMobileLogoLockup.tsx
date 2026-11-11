import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { DEFAULT_LOGO } from "@/features/settings/constants";

interface CatchMobileLogoLockupProps {
  /** CMS/settings logo. Falls back to the Rawd Al-Aseel mark. */
  src?: string | null;
  siteName?: string;
}

/**
 * Compact brand lockup for the mobile header: the logo is anchored at the
 * same position as the sticky header so the scroll handoff feels continuous.
 */
export default function CatchMobileLogoLockup({
  src,
  siteName,
}: CatchMobileLogoLockupProps) {
  const brandName = siteName || "Rawd Al-Aseel";

  return (
    <Link
      href="/"
      aria-label={brandName}
      className="flex shrink-0 items-center"
    >
      <Image
        src={src || DEFAULT_LOGO}
        alt=""
        width={596}
        height={590}
        priority
        sizes="48px"
        className="h-10 w-auto max-w-[44px] object-contain"
      />
    </Link>
  );
}
