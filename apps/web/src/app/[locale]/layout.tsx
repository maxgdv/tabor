import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { routing } from '@/i18n/routing';
import { SITE_URL, localeAlternates, openGraphFor } from '@/lib/seo';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// El SiteHeader hace `listBooks()` contra Postgres en cada render — para
// alimentar el BookSidebar. Forzar dinámico evita que el build intente
// prerender estático (que falla en CI donde no hay BD). Cuando convenga,
// se puede optimizar envolviendo `listBooks` en `unstable_cache`.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    metadataBase: new URL(SITE_URL),
    // Las páginas hijas declaran solo su parte ("Génesis 12") y la
    // plantilla añade la marca. La home usa el título completo por defecto.
    title: {
      default: t('title'),
      template: '%s · Tabor',
    },
    description: t('description'),
    // Canonical + hreflang de la home; cada página hija los sobreescribe
    // con su propio path.
    alternates: localeAlternates(locale),
    openGraph: openGraphFor(locale, t('title'), t('description')),
    twitter: { card: 'summary_large_image' },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const tHeader = await getTranslations('header');

  return (
    <html lang={locale}>
      <body className="min-h-dvh flex flex-col font-serif">
        <NextIntlClientProvider messages={messages}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-lapis-500 focus:px-3 focus:py-2 focus:text-white"
          >
            {tHeader('skipToContent')}
          </a>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
