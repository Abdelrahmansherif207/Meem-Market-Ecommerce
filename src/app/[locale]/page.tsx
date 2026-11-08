import { HomePage } from "@/features/home/HomePage";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <HomePage locale={locale} />;
}
