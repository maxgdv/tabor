import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getPlan, readingHref, readingLabel } from '@/lib/plans';
import { localeAlternates, openGraphFor } from '@/lib/seo';
import { PlanProgress } from '@/components/plans/PlanProgress';
import { PlanDayList, type DayItem } from '@/components/plans/PlanDayList';

type Params = Promise<{ locale: string; plan: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, plan: slug } = await params;
  const plan = getPlan(slug);
  if (!plan) return {};
  const lang = locale === 'en' ? 'en' : 'es';
  const title = plan.name[lang];
  const description = plan.description[lang];
  const path = `planes/${plan.slug}`;
  return {
    title,
    description,
    alternates: localeAlternates(locale, path),
    openGraph: openGraphFor(locale, `${title} · Tabor`, description, path),
  };
}

export default async function PlanPage({ params }: { params: Params }) {
  const { locale, plan: slug } = await params;
  setRequestLocale(locale);

  const plan = getPlan(slug);
  if (!plan) notFound();

  const t = await getTranslations('plans');
  const lang = locale === 'en' ? 'en' : 'es';

  // Etiquetas y hrefs se calculan en el servidor (dependen del locale);
  // el cliente solo añade el estado de progreso de localStorage.
  const days: DayItem[] = plan.days.map((day) => ({
    readings: day.readings.map((reading) => ({
      label: readingLabel(reading, lang),
      href: readingHref(reading),
    })),
  }));

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <header className="mb-10">
        <nav aria-label={t('breadcrumb')} className="text-xs text-stone-500">
          <Link href="/planes" className="underline-offset-2 hover:underline">
            {t('title')}
          </Link>
        </nav>
        <h1 className="mt-2 font-serif text-3xl text-stone-800 sm:text-4xl dark:text-sand-100">
          {plan.name[lang]}
        </h1>
        <p className="mt-4 max-w-2xl text-stone-600 dark:text-sand-200">
          {plan.description[lang]}
        </p>
        <div className="mt-5 max-w-sm">
          <PlanProgress slug={plan.slug} totalDays={plan.days.length} />
        </div>
      </header>

      <PlanDayList slug={plan.slug} days={days} />
    </div>
  );
}
