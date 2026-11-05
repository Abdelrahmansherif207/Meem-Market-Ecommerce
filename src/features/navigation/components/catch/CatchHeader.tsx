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
 * Screen-matched site header: black announcement strip (scrolls away) +
 * sticky white header with search and category nav rows.
 */
export default function CatchHeader({
  params,
  settingsLogo,
  currencyEnabled = false,
}: CatchHeaderProps) {
  return (
    <>
      <CatchAnnouncementBar />
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white shadow-sm">
        <CatchTopRow settingsLogo={settingsLogo} currencyEnabled={currencyEnabled} />
        <Suspense fallback={null}>
          <CatchCategoryNav params={params} />
        </Suspense>
      </header>
    </>
  );
}
