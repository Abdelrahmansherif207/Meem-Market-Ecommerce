import ContactPageContent from "@/features/contact/components/ContactPageContent";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { withStaticLocale } from "@/i18n/staticLocale";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await withStaticLocale(params);
  const t = await getTranslations({ locale, namespace: "contact" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await withStaticLocale(params);
  return <ContactPageContent locale={locale} />;
}
