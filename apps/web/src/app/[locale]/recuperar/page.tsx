import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  // No indexar páginas de cuenta: sin valor para buscadores.
  return { title: t('resetTitle'), robots: { index: false } };
}

export default async function PasswordResetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('auth');

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <header className="mb-10 text-center">
        <h1 className="font-serif text-3xl text-stone-800 dark:text-sand-100">
          {t('resetTitle')}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone-600 dark:text-sand-200">
          {t('resetLede')}
        </p>
      </header>
      {/* useSearchParams (el ?token=) exige Suspense en una página estática. */}
      <Suspense>
        <PasswordResetForm />
      </Suspense>
    </div>
  );
}
