import { Suspense } from "react";
import CategoryNav from "./CategoryNav";
import DeliveryModes from "./DeliveryModes";
import MainNav from "./MainNav";
import { NavSkeleton } from "./NavSkeleton";
import { VerificationBanner } from "@/features/auth";

export default async function Header({
  params,
  settingsLogo,
  currencyEnabled = false,
}: {
  params: Promise<{ locale: string }>;
  settingsLogo?: string | null;
  currencyEnabled?: boolean;
}) {
  return (
    <header className="header-gradient header-shadow mb-5">
      <div className="container mx-auto px-4 flex flex-col gap-3 p-2.5 md:gap-4">
        <DeliveryModes />
        <MainNav settingsLogo={settingsLogo} currencyEnabled={currencyEnabled} />
        <Suspense fallback={<NavSkeleton />}>
          <CategoryNav params={params} />
        </Suspense>
      </div>
      <VerificationBanner />
    </header>
  );
}