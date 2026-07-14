import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getPlanProgress } from '@tabor/db';
import { Link } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { PLANS } from '@/lib/plans';
import { localeAlternates, openGraphFor } from '@/lib/seo';
import { PlanProgress } from '@/components/plans/PlanProgress';
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

export default async function PlansIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('plans');
  const lang = locale === 'en' ? 'en' : 'es';

  // Con sesión, el progreso viene de la cuenta; invitado → localStorage.
  const session = await auth.api.getSession({ headers: await headers() });
  const progress = session ? await getPlanProgress({ userId: session.user.id }) : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <header className="mb-12 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Tabor</p>
        <h1 className="mt-2 font-serif text-3xl text-stone-800 sm:text-4xl dark:text-sand-100">
          {t('title')}
        </h1>
        <p className="mt-4 text-stone-600 dark:text-sand-200">{t('lede')}</p>
      </header>

      <ul className="space-y-4">
        {PLANS.map((plan) => (
          <li key={plan.slug}>
            <Link
              href={`/planes/${plan.slug}`}
              className="group block rounded-lg border border-sand-200 bg-white/60 p-5 transition-colors hover:border-lapis-500 hover:bg-white dark:border-stone-700 dark:bg-stone-800/60 dark:hover:bg-stone-800"
            >
              <h2 className="font-serif text-xl text-stone-800 group-hover:text-lapis-600 dark:text-sand-100">
                {plan.name[lang]}
              </h2>
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
      {session && <PlanProgressSync />}
    </div>
  );
}
