import { getTranslations } from "next-intl/server";
import ContactForm from "./ContactForm";

interface ContactPageContentProps {
  locale: string;
}

export default async function ContactPageContent({ locale }: ContactPageContentProps) {
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <div className="w-full flex flex-col flex-1 p-4 md:p-6">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t("title")}</h1>
          <p className="text-text-secondary mt-2">{t("description")}</p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
