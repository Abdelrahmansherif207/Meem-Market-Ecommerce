import CategoryNav from "./CategoryNav";
import DeliveryModes from "./DeliveryModes";
import MainNav from "./MainNav";
import { VerificationBanner } from "@/features/auth/components/VerificationBanner";

export default async function Header({
  params,
  settingsLogo,
}: {
  params: Promise<{ locale: string }>;
  settingsLogo?: string | null;
}) {
  return (
    <header className="header-gradient header-shadow mb-5">
      <div className="container mx-auto px-4 flex flex-col gap-3 p-2.5 md:gap-4">
        <DeliveryModes />
        <MainNav settingsLogo={settingsLogo} />
        <CategoryNav params={params} />
      </div>
      <VerificationBanner />
    </header>
  );
}