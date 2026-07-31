import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { routeReadingHref, routeReadingLabel } from '@/lib/routes';
import { REGION_PATH } from '@/lib/visit';
import type { VisitableSite } from '@/lib/visitable';

type Props = {
  site: VisitableSite;
  locale: string;
};

/**
 * «¿Se puede visitar hoy?» en la ficha de un lugar.
 *
 * Va alto en la página, justo debajo del mapa y antes de los pasajes: quien
 * llega buscando si esto se puede ver no debería tener que pasar ciento veinte
 * versículos para averiguarlo.
 *
 * El pasaje para leer allí es la pieza que no tiene nadie más —el proyecto del
 * revés: no «dónde ocurrió lo que leo» sino «qué leo ahora que estoy aquí»— y
 * por eso es lo único de la ficha con aspecto de botón. Esta página se abre de
 * pie en un yacimiento, con sol y con una mano: el destino tiene que ser
 * grande y estar donde cae el pulgar.
 */
export async function VisitableSiteBlock({ site, locale }: Props) {
  const t = await getTranslations('visit');
  const lang = locale === 'en' ? 'en' : 'es';
  const reference = routeReadingLabel(site.reading, lang);

  return (
    <section aria-labelledby="visitar" className="mt-10">
      <h2 id="visitar" className="font-serif text-2xl text-stone-800 dark:text-sand-100">
        {t('site.heading')}
      </h2>

      <div className="mt-4 rounded-lg border border-sand-300 bg-sand-100/70 p-5 sm:p-6 dark:border-stone-600 dark:bg-stone-800/70">
        <p className="text-lg leading-relaxed text-stone-800 dark:text-sand-100">
          {site.preserved[lang]}
        </p>

        <dl className="mt-4 text-sm leading-relaxed">
          <dt className="font-sans text-stone-600 dark:text-stone-300">{t('site.whereLabel')}</dt>
          <dd className="mt-0.5 text-stone-700 dark:text-sand-200">{site.whereItIs[lang]}</dd>
        </dl>

        {/* El pasaje, con el peso visual del bloque entero. */}
        <div className="mt-6 border-t border-sand-300 pt-5 dark:border-stone-600">
          <h3 className="font-serif text-xl text-stone-800 dark:text-sand-100">
            {t('site.readingHeading')}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-sand-200">
            {t('site.readingLede')}
          </p>
          <Link
            href={routeReadingHref(site.reading)}
            className="mt-4 flex min-h-14 w-full flex-col justify-center rounded-md bg-lapis-500 px-5 py-3 text-center text-white transition-colors hover:bg-lapis-600 sm:w-auto sm:min-w-64"
          >
            <span className="font-serif text-xl">{reference}</span>
            <span className="font-sans text-xs uppercase tracking-[0.14em] text-lapis-200">
              {t('site.readingCta')}
            </span>
          </Link>
        </div>

        <p className="mt-6">
          <Link
            href={`/${REGION_PATH[site.region]}`}
            className="inline-flex min-h-11 items-center font-sans text-sm text-lapis-600 underline-offset-2 hover:underline dark:text-lapis-300"
          >
            {t(`regions.${site.region}.guideLink`)}
          </Link>
        </p>
      </div>
    </section>
  );
}
