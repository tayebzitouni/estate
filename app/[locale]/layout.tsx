import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";
import { locales } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(params.locale as (typeof locales)[number])) {
    notFound();
  }

  const dict = getDictionary(params.locale);

  return (
    <div dir={dict.dir} lang={dict.lang} className={params.locale === "ar" ? "font-arabic" : ""}>
      <SiteHeader locale={params.locale as (typeof locales)[number]} />
      <main>{children}</main>
      <ChatbotWidget />
      <SiteFooter />
    </div>
  );
}
