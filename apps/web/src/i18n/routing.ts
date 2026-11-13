import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['es', 'en'] as const,
  defaultLocale: 'es',
  localePrefix: 'always',
  // Sin la cabecera HTTP `Link` de alternativas que añade el middleware: su
  // x-default apunta a la URL sin prefijo de idioma (/lugares/sibmah), que
  // solo existe como redirección temporal a /es/… o /en/… según el idioma
  // del visitante. Google las descubría por ahí y Search Console acumulaba
  // 970 «páginas con redirección» (nov-2026). El hreflang correcto ya va en
  // el HTML de cada página, con x-default → /es/… (lib/seo.ts).
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
