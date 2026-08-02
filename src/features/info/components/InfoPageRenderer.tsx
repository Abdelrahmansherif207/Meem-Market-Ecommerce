import Image from "next/image";
import Breadcrumb from "@/components/ui/Breadcrumb";
import EmptyState from "@/components/ui/EmptyState";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { InfoPage } from "../types";
import { getInfoPageContent } from "../content/pageContent";

interface InfoPageRendererProps {
  slug: string;
  locale: string;
}

export default async function InfoPageRenderer({ slug, locale }: InfoPageRendererProps) {
  const isRtl = locale === "ar";
  const tf = await getTranslations({ locale, namespace: "notFound" });
  let page: InfoPage | null;
  try {
    page = getInfoPageContent(slug, locale);
  } catch {
    page = null;
  }

  if (!page) {
    return (
      <main className="flex flex-col items-center justify-center py-12">
        <EmptyState
          variant="notFound"
          title={tf("title")}
          description={tf("description")}
          actions={
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark hover:shadow-md"
            >
              {tf("goHome")}
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="header-gradient pb-12 pt-6">
        <div className="mx-auto max-w-4xl px-4" dir={isRtl ? "rtl" : "ltr"}>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: page.title },
            ]}
          />
          <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            {page.title}
          </h1>
          <div className="mt-3 h-1 w-16 rounded-full bg-primary" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10" dir={isRtl ? "rtl" : "ltr"}>
        <div className="space-y-8">
          {page.sections.map((section, index) => {
            switch (section.type) {
              case "text":
                return (
                  <section
                    key={index}
                    className="rounded-xl border border-border bg-background p-6 shadow-sm md:p-8"
                  >
                    {section.title && (
                      <>
                        <h2 className="font-heading text-xl font-semibold text-text-primary md:text-2xl">
                          {section.title}
                        </h2>
                        <div className="mt-2 h-0.5 w-10 rounded-full bg-primary/30" />
                      </>
                    )}
                    <div
                      className={`prose-sm max-w-none ${section.title ? "mt-5" : ""} text-text-secondary leading-relaxed`}
                      dangerouslySetInnerHTML={{ __html: section.content || "" }}
                    />
                  </section>
                );
              case "image":
                return (
                  <figure key={index} className="overflow-hidden rounded-xl border border-border shadow-sm">
                    <Image
                      src={section.src || ""}
                      alt={section.alt || ""}
                      width={800}
                      height={450}
                      className="w-full object-cover"
                      unoptimized
                    />
                    {section.caption && (
                      <figcaption className="border-t border-border bg-surface px-6 py-3 text-center text-sm text-text-secondary">
                        {section.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              case "video":
                return (
                  <figure key={index} className="overflow-hidden rounded-xl border border-border shadow-sm">
                    <div className="aspect-video">
                      <iframe
                        src={section.url || ""}
                        title={section.title || "Video"}
                        className="h-full w-full"
                        allowFullScreen
                      />
                    </div>
                    {section.caption && (
                      <figcaption className="border-t border-border bg-surface px-6 py-3 text-center text-sm text-text-secondary">
                        {section.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              default:
                return null;
            }
          })}
        </div>
      </div>
    </main>
  );
}
