import { getTranslations } from "next-intl/server";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { ProfileTabs } from "./ProfileTabs";

interface ProfilePageProps {
  locale: string;
}

export async function ProfilePage({ locale }: ProfilePageProps) {
  const t = await getTranslations({ locale, namespace: "profile" });
  const tb = await getTranslations({ locale, namespace: "header.breadcrumb" });

  return (
    <div className="py-6 min-h-screen">
      <Breadcrumb
        items={[
          { label: tb("home"), href: "/" },
          { label: t("breadcrumb") },
        ]}
      />

      <div className="mt-6">
        <ProfileTabs />
      </div>
    </div>
  );
}
