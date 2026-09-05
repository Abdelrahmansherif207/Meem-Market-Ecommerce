import { AuthPage } from "@/features/auth";
import { getTranslations } from "next-intl/server";
import { getSiteMeta } from "@/features/settings/lib/metadata";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  let logo: string | null = null;
  try {
    const meta = await getSiteMeta(locale);
    logo = meta.logo;
  } catch {
    // Use default
  }
  return <AuthPage logo={logo} />;
}