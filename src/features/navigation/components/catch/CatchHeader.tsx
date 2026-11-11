import { Suspense } from "react";
import CatchAnnouncementBar from "./CatchAnnouncementBar";
import CatchTopRow from "./CatchTopRow";
import CatchCategoryNav from "./CatchCategoryNav";

interface CatchHeaderProps {
  params: Promise<{ locale: string }>;
  settingsLogo?: string | null;
  /** Resolved `site_name` from `/general/settings`. */
  siteName?: string;
}

/**
 * Site header: deep-green announcement strip + white header with search and
 * category nav rows. Warm paper frame, no shadow. The compact fixed
 * header that appears on scroll lives in CatchStickyHeader.
 */
export default function CatchHeader({
  params,
  settingsLogo,
  siteName,
}: CatchHeaderProps) {
  return (
    <>
      <CatchAnnouncementBar />
      <header className="relative z-40 border-b border-catch-border bg-catch-ivory">
        <CatchTopRow settingsLogo={settingsLogo} siteName={siteName} />
        <Suspense fallback={null}>
          <CatchCategoryNav params={params} />
        </Suspense>
      </header>
    </>
  );
}
