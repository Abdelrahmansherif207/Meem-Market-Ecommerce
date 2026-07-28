import PageRenderer from "@/features/pages/components/PageRenderer";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  return <PageRenderer slug={slug} locale={locale} />;
}
