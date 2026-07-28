import PageRenderer from "@/features/pages/components/PageRenderer";

export default async function StaticPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <PageRenderer slug="about" locale={locale} />;
}
