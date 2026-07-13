import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listBookmarks } from '@tabor/db';
import { Link, redirect } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { versionForLocale } from '@/lib/bible';
import { groupBookmarksByBook } from '@/lib/bookmarks';
import { RemoveBookmarkButton } from '@/components/auth/RemoveBookmarkButton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('bookmarksTitle'), robots: { index: false } };
}

export default async function BookmarksPage({
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
  const items = await listBookmarks({
    userId: session.user.id,
    versionCode: versionForLocale(locale),
  });
  const groups = groupBookmarksByBook(items);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <header className="mb-10">
        <h1 className="font-serif text-3xl text-stone-800 dark:text-sand-100">
          {t('bookmarksTitle')}
        </h1>
        <p className="mt-3 text-stone-600 dark:text-sand-200">{t('bookmarksLede')}</p>
      </header>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-sand-200 bg-white/60 p-8 text-center dark:border-stone-700 dark:bg-stone-800/60">
          <p className="text-stone-600 dark:text-sand-200">{t('bookmarksEmpty')}</p>
          <Link
            href="/leer"
            className="mt-4 inline-block rounded-md bg-lapis-500 px-4 py-2 font-sans text-sm font-medium text-white hover:bg-lapis-600"
          >
            {t('bookmarksCta')}
          </Link>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.bookCanonicalId} className="mb-10">
            <h2 className="mb-3 font-serif text-xl text-stone-800 dark:text-sand-100">
              {group.bookName}
            </h2>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li
                  key={`${item.chapterNumber}-${item.verseNumber}`}
                  className="flex items-start gap-3 rounded-md border border-sand-200 bg-white/60 px-4 py-3 dark:border-stone-700 dark:bg-stone-800/60"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/leer/${item.bookUrlSegment}/${item.chapterNumber}#v${item.verseNumber}`}
                      className="font-sans text-xs font-semibold uppercase tracking-wide text-lapis-600 underline-offset-2 hover:underline dark:text-lapis-300"
                    >
                      {item.bookName} {item.chapterNumber}, {item.verseNumber}
                    </Link>
                    <p className="mt-1 font-serif text-sm leading-relaxed text-stone-700 dark:text-sand-200">
                      {item.text}
                    </p>
                  </div>
                  <RemoveBookmarkButton
                    bookUrlSegment={item.bookUrlSegment}
                    chapterNumber={item.chapterNumber}
                    verseNumber={item.verseNumber}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
