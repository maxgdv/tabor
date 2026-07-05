// Utilidades SEO compartidas entre páginas, sitemap y robots.
//
// El objetivo: que cada una de las ~2.800 URLs públicas (73 libros × sus
// capítulos × 2 idiomas) tenga título, descripción y canonical únicos, y que
// Google entienda la relación es↔en vía hreflang.

import { routing } from '@/i18n/routing';

/** URL pública canónica del sitio (sin barra final). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://proyectotabor.org').replace(
  /\/$/,
  '',
);

/**
 * Bloque `alternates` de Metadata para una página: canonical del locale
 * actual + hreflang de todos los locales. `path` va sin prefijo de locale y
 * sin barra inicial ('' para la home, 'leer/gen/12' para un capítulo).
 * x-default apunta al locale por defecto (es).
 */
export function localeAlternates(locale: string, path = '') {
  const suffix = path ? `/${path}` : '';
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}${suffix}`]),
  ) as Record<string, string>;
  languages['x-default'] = `${SITE_URL}/${routing.defaultLocale}${suffix}`;
  return {
    canonical: `${SITE_URL}/${locale}${suffix}`,
    languages,
  };
}

/** Bloque `openGraph` completo (el merge de Metadata es superficial: quien
 *  declara openGraph debe declararlo entero o pierde siteName y locale). */
export function openGraphFor(locale: string, title: string, description: string, path = '') {
  const suffix = path ? `/${path}` : '';
  return {
    type: 'website' as const,
    siteName: 'Tabor',
    locale: locale === 'es' ? 'es_ES' : 'en_US',
    url: `${SITE_URL}/${locale}${suffix}`,
    title,
    description,
  };
}

/**
 * Primeras palabras de un capítulo para la meta description: versículos
 * concatenados hasta ~`max` caracteres, cortados en límite de palabra.
 * Es el contenido más único de cada página — mejor snippet que una
 * plantilla genérica repetida 1.334 veces.
 */
export function verseSnippet(verses: { text: string }[], max = 140): string {
  let out = '';
  for (const v of verses) {
    out = out ? `${out} ${v.text}` : v.text;
    if (out.length >= max) break;
  }
  out = out.replace(/\s+/g, ' ').trim();
  if (out.length > max) {
    const cut = out.slice(0, max);
    out = `${cut.slice(0, cut.lastIndexOf(' '))}…`;
  }
  return out;
}
