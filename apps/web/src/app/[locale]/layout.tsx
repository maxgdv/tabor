import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import { routing } from '@/i18n/routing';
import { SITE_URL, localeAlternates, openGraphFor } from '@/lib/seo';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import '../globals.css';

// Sin `force-dynamic`: las páginas de solo lectura (capítulos, lugares,
// índices) se prerenderizan y se sirven desde la CDN — cada visita dejaba de
// quemar "Fluid Active CPU" en Vercel. Lo que varía por usuario (sesión del
// header, marcadores) se resuelve en el cliente; las páginas de cuenta y las
// que leen `headers()`/`searchParams` siguen siendo dinámicas por sí solas.
export function generateStaticParams() {
  // En CI no hay BD y el prerender fallaría: sin params, el build no genera
  // nada bajo [locale] y todo pasa a ISR bajo demanda. En Vercel (y en local
  // con BD) sí se prerenderizan los índices de ambos idiomas.
  if (!process.env.DATABASE_URL) return [];
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Viewport y color de la barra del sistema.
 *
 * Deliberadamente NO se declaran `maximumScale` ni `userScalable`: impedir el
 * zoom rompe el criterio 1.4.4 (Redimensionado del texto) de WCAG 2.2 AA, y en
 * una aplicación cuyo propósito es leer textos largos es justo lo último que
 * conviene bloquear.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Los dos tonos de fondo reales de la app (globals.css): sand-50 en claro y
  // stone-900 en oscuro. Así la barra de estado del móvil y la barra de título
  // de la app instalada continúan la página en vez de cortarla.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf7f0' },
    { media: '(prefers-color-scheme: dark)', color: '#171513' },
  ],
  // El tema se decide con `prefers-color-scheme`, así que se anuncian ambos:
  // los controles nativos (select de idioma, barras de scroll, campo de
  // búsqueda) se pintan acordes al esquema del usuario en lugar de quedarse
  // siempre en claro.
  colorScheme: 'light dark',
};

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
    // Los iconos viven en public/ (no como convención app/icon.*) porque los
    // comparten el manifiesto y el <head>. El SVG va primero para que quien lo
    // soporte use el vectorial; favicon.ico (16/32/48) cubre al resto y las
    // peticiones a pelo de /favicon.ico que hacen buscadores y agregadores.
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      ],
      apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
    },
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
