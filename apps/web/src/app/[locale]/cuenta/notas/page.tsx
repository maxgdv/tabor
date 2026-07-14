import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listNotes } from '@tabor/db';
import { Link, redirect } from '@/i18n/routing';
import { auth } from '@/lib/auth';
import { versionForLocale } from '@/lib/bible';
import { groupByBook } from '@/lib/bookmarks';
import { RemoveNoteButton } from '@/components/auth/RemoveNoteButton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('notesTitle'), robots: { index: false } };
}

export default async function NotesPage({
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
  const items = await listNotes({
    userId: session.user.id,
    versionCode: versionForLocale(locale),
  });
  const groups = groupByBook(items);
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-16">
      <header className="mb-10">
        <h1 className="font-serif text-3xl text-stone-800 dark:text-sand-100">
          {t('notesTitle')}
        </h1>
        <p className="mt-3 text-stone-600 dark:text-sand-200">{t('notesLede')}</p>
      </header>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-sand-200 bg-white/60 p-8 text-center dark:border-stone-700 dark:bg-stone-800/60">
          <p className="text-stone-600 dark:text-sand-200">{t('notesEmpty')}</p>
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
            <ul className="space-y-3">
              {group.items.map((item) => (
                <li
                  key={`${item.chapterNumber}-${item.verseNumber}`}
                  className="flex items-start gap-3 rounded-md border border-sand-200 bg-white/60 px-4 py-3 dark:border-stone-700 dark:bg-stone-800/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <Link
                        href={`/leer/${item.bookUrlSegment}/${item.chapterNumber}#v${item.verseNumber}`}
                        className="font-sans text-xs font-semibold uppercase tracking-wide text-lapis-600 underline-offset-2 hover:underline dark:text-lapis-300"
                      >
                        {item.bookName} {item.chapterNumber}, {item.verseNumber}
                      </Link>
                      <span className="font-sans text-xs text-stone-400">
                        {dateFormat.format(item.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-1 font-serif text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                      {item.text}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap border-l-2 border-sand-300 pl-3 font-sans text-sm leading-relaxed text-stone-700 dark:border-stone-600 dark:text-sand-100">
                      {item.body}
                    </p>
                  </div>
                  <RemoveNoteButton
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
