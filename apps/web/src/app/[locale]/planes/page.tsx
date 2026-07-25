import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getPlanProgress } from '@tabor/db';
import { Link } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { plansOfKind, type ReadingPlan } from '@/lib/plans';
import { localeAlternates, openGraphFor } from '@/lib/seo';
import { PlanProgress } from '@/components/plans/PlanProgress';
import { SeasonBadge } from '@/components/SeasonBadge';
import { PastoralNote } from '@/components/plans/PastoralNote';
import { PlanProgressSync } from '@/components/plans/PlanProgressSync';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'plans' });
  const title = t('title');
  const description = t('lede');
  return {
    title,
    description,
    alternates: localeAlternates(locale, 'planes'),
    openGraph: openGraphFor(locale, `${title} · Tabor`, description, 'planes'),
  };
}

type Progress = Awaited<ReturnType<typeof getPlanProgress>> | null;

/**
 * Las tarjetas de una sección. El nombre del plan es h3: la página gasta el
 * h1 en su título y un h2 en el encabezado de cada sección.
 */
function PlanList({
  plans,
  lang,
  progress,
}: {
  plans: ReadingPlan[];
  lang: 'es' | 'en';
  progress: Progress;
}) {
  return (
    <ul className="mt-6 space-y-4">
      {plans.map((plan) => (
        <li key={plan.slug}>
          <Link
            href={`/planes/${plan.slug}`}
            className="group block rounded-lg border border-sand-200 bg-white/60 p-5 transition-colors hover:border-lapis-500 hover:bg-white dark:border-stone-700 dark:bg-stone-800/60 dark:hover:bg-stone-800"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-serif text-xl text-stone-800 group-hover:text-lapis-600 dark:text-sand-100">
                {plan.name[lang]}
              </h3>
              {plan.season && <SeasonBadge season={plan.season} />}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600 dark:text-sand-200">
              {plan.description[lang]}
            </p>
            <div className="mt-3">
              <PlanProgress
                slug={plan.slug}
                totalDays={plan.days.length}
                serverDays={progress ? (progress[plan.slug] ?? []) : null}
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function PlansIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('plans');
  const lang = locale === 'en' ? 'en' : 'es';

  // Con sesión, el progreso viene de la cuenta; invitado → localStorage.
  const session = await auth.api.getSession({ headers: await headers() });
  const progress = session ? await getPlanProgress({ userId: session.user.id }) : null;

  // Dos maneras distintas de acercarse al texto, no un ranking: el itinerario
  // se elige con calma; el plan de situación lo trae el día que uno tiene.
  const itineraries = plansOfKind('itinerario');
  const situations = plansOfKind('situacion');

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <header className="mb-12 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Tabor</p>
        <h1 className="mt-2 font-serif text-3xl text-stone-800 sm:text-4xl dark:text-sand-100">
          {t('title')}
        </h1>
        <p className="mt-4 text-stone-600 dark:text-sand-200">{t('lede')}</p>
      </header>

      <section aria-labelledby="planes-itinerarios">
        <h2
          id="planes-itinerarios"
          className="font-serif text-2xl text-stone-800 dark:text-sand-100"
        >
          {t('sections.itineraries.title')}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-sand-200">
          {t('sections.itineraries.lede')}
        </p>
        <PlanList plans={itineraries} lang={lang} progress={progress} />
      </section>

      {situations.length > 0 && (
        <section aria-labelledby="planes-situaciones" className="mt-16">
          <h2
            id="planes-situaciones"
            className="font-serif text-2xl text-stone-800 dark:text-sand-100"
          >
            {t('sections.situations.title')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600 dark:text-sand-200">
            {t('sections.situations.lede')}
          </p>
          <PastoralNote variant="index" />
          <PlanList plans={situations} lang={lang} progress={progress} />
        </section>
      )}

      {session && <PlanProgressSync />}
    </div>
  );
}
