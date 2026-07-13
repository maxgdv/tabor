import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link, redirect } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { AccountActions } from '@/components/auth/AccountActions';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('accountTitle'), robots: { index: false } };
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect({ href: '/entrar', locale });
    return null; // redirect lanza; el return solo estrecha el tipo para TS
  }

  const t = await getTranslations('auth');
  const memberSince = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(
    new Date(session.user.createdAt),
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <header className="mb-10">
        <h1 className="font-serif text-3xl text-stone-800 dark:text-sand-100">
          {t('accountTitle')}
        </h1>
        <p className="mt-3 text-stone-600 dark:text-sand-200">
          {session.user.name ? `${session.user.name} · ` : ''}
          {session.user.email}
        </p>
        <p className="mt-1 font-sans text-sm text-stone-500">
          {t('memberSince', { date: memberSince })}
        </p>
        <p className="mt-4">
          <Link
            href="/cuenta/marcadores"
            className="font-sans text-sm text-lapis-600 underline-offset-2 hover:underline dark:text-lapis-300"
          >
            {t('bookmarksTitle')} →
          </Link>
        </p>
      </header>

      <AccountActions />
    </div>
  );
}
