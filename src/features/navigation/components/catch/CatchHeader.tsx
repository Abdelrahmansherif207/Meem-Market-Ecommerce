import { Suspense } from "react";
import CatchAnnouncementBar from "./CatchAnnouncementBar";
import CatchTopRow from "./CatchTopRow";
import CatchCategoryNav from "./CatchCategoryNav";

interface CatchHeaderProps {
  params: Promise<{ locale: string }>;
  settingsLogo?: string | null;
  currencyEnabled?: boolean;
}

/**
 * Site header: berry announcement strip + ivory header with search and
 * category nav rows. Warm paper frame, no shadow. The compact fixed
 * header that appears on scroll lives in CatchStickyHeader.
 */
export default function CatchHeader({
  params,
  settingsLogo,
  currencyEnabled = false,
}: CatchHeaderProps) {
  return (
    <>
      <CatchAnnouncementBar />
      <header className="relative z-40 border-b border-catch-border bg-catch-ivory">
        <CatchTopRow settingsLogo={settingsLogo} />
        <Suspense fallback={null}>
          <CatchCategoryNav params={params} currencyEnabled={currencyEnabled} />
        </Suspense>
      </header>
    </>
  );
}
