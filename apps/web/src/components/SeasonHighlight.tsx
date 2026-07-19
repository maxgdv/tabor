import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { PLANS } from '@/lib/plans';
import { ROUTES, type LiturgicalSeason } from '@/lib/routes';
import { SeasonBadge } from './SeasonBadge';

type Props = { season: LiturgicalSeason; locale: string };

/**
 * Destacado de temporada en la portada: cuando el calendario litúrgico está
 * en un tiempo fuerte, la home ofrece los planes y rutas de ese tiempo.
 * En Tiempo Ordinario no se renderiza (la portada queda como siempre).
 */
export function SeasonHighlight({ season, locale }: Props) {
  const t = useTranslations('home');
  const tSeasons = useTranslations('seasons');
  const lang = locale === 'en' ? 'en' : 'es';

  const plans = PLANS.filter((p) => p.season === season);
  const routes = ROUTES.filter((r) => r.season === season);
  if (plans.length === 0 && routes.length === 0) return null;

  return (
    <section
      aria-label={t('seasonNow', { season: tSeasons(season) })}
      className="mt-14 rounded-lg border border-lapis-500/30 bg-lapis-500/5 p-6 sm:p-8 dark:border-lapis-300/30 dark:bg-stone-800/60"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <SeasonBadge season={season} />
        <h2 className="font-serif text-xl text-stone-800 dark:text-sand-100">
          {t('seasonNow', { season: tSeasons(season) })}
        </h2>
      </div>
      <p className="mt-2 text-sm text-stone-600 dark:text-sand-200">{t('seasonLede')}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {plans.map((plan) => (
          <li key={plan.slug}>
            <Link
              href={`/planes/${plan.slug}`}
              className="inline-block rounded-md border border-sand-200 bg-white/70 px-3 py-1.5 font-sans text-sm text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:bg-stone-800/70 dark:text-sand-100"
            >
              {plan.name[lang]}
            </Link>
          </li>
        ))}
        {routes.map((route) => (
          <li key={route.slug}>
            <Link
              href={`/rutas/${route.slug}`}
              className="inline-block rounded-md border border-sand-200 bg-white/70 px-3 py-1.5 font-sans text-sm text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:bg-stone-800/70 dark:text-sand-100"
            >
              {route.name[lang]} 🗺
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
