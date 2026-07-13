import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { AuthForm } from '@/components/auth/AuthForm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  // No indexar páginas de cuenta: sin valor para buscadores.
  return { title: t('title'), robots: { index: false } };
}

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect({ href: '/cuenta', locale });

  const t = await getTranslations('auth');

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <header className="mb-10 text-center">
        <h1 className="font-serif text-3xl text-stone-800 dark:text-sand-100">{t('title')}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone-600 dark:text-sand-200">
          {t('lede')}
        </p>
      </header>
      <AuthForm />
    </div>
  );
}
