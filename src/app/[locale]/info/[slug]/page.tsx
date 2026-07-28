import InfoPageRenderer from "@/features/info/components/InfoPageRenderer";

export default async function InfoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  return <InfoPageRenderer slug={slug} locale={locale} />;
}
