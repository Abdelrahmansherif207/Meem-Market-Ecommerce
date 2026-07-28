import ContactPageContent from "@/features/contact/components/ContactPageContent";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ContactPageContent locale={locale} />;
}
