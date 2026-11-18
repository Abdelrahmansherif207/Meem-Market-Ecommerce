import { getTranslations } from "next-intl/server";
import { Mail } from "lucide-react";
import ContactForm from "./ContactForm";

interface ContactPageContentProps {
  locale: string;
}

export default async function ContactPageContent({ locale }: ContactPageContentProps) {
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <div className="flex w-full flex-1 flex-col px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="h-7 w-7" aria-hidden />
          </span>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
              {t("title")}
            </h1>
            <p className="text-sm text-text-secondary md:text-base">
              {t("description")}
            </p>
          </div>
        </header>
        <ContactForm />
      </div>
    </div>
  );
}
