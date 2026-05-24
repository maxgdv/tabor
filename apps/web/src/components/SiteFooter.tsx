import { getTranslations } from 'next-intl/server';

export async function SiteFooter() {
  const t = await getTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-sand-200 bg-sand-50/80 dark:border-stone-700 dark:bg-stone-900/80">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-2 px-6 py-6 text-xs text-stone-500 sm:flex-row sm:items-center dark:text-stone-400">
        <p>{t('copy', { year })}</p>
        <a
          href="https://github.com/maxgdv/tabor"
          target="_blank"
          rel="noreferrer noopener"
          className="underline-offset-2 hover:text-stone-700 hover:underline dark:hover:text-sand-200"
        >
          {t('spec')}
        </a>
      </div>
    </footer>
  );
}
