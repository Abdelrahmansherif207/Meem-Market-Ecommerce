import { Suspense } from "react";
import MeemAnnouncementBar from "./MeemAnnouncementBar";
import MeemTopRow from "./MeemTopRow";
import MeemCategoryNav from "./MeemCategoryNav";

interface MeemHeaderProps {
  params: Promise<{ locale: string }>;
  settingsLogo?: string | null;
  /** Resolved `site_name` from `/general/settings`. */
  siteName?: string;
}

/**
 * Site header: deep-blue announcement strip + cool ivory header with search
 * and category nav rows. Flat frame, no shadow. The compact fixed header that
 * appears on scroll lives in MeemStickyHeader.
 */
export default function MeemHeader({
  params,
  settingsLogo,
  siteName,
}: MeemHeaderProps) {
  return (
    <>
      <MeemAnnouncementBar />
      <header className="meem-channel-surface relative z-40 border-b border-meem-border">
        <MeemTopRow settingsLogo={settingsLogo} siteName={siteName} />
        <Suspense fallback={null}>
          <MeemCategoryNav params={params} />
        </Suspense>
      </header>
    </>
  );
}
