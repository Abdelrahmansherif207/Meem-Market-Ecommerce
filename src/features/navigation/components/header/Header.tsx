import CategoryNav from "./CategoryNav";
import MainNav from "./MainNav";
import { VerificationBanner } from "@/features/auth/components/VerificationBanner";

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
        <MainNav settingsLogo={settingsLogo} currencyEnabled={currencyEnabled} />
        <CategoryNav params={params} />
      </div>
      <VerificationBanner />
    </header>
  );
}