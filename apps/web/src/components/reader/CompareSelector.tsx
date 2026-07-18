import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { COMPARE_VERSIONS } from '@/lib/bible';

type Props = {
  /** /leer/gen/12 — ruta del capítulo sin query. */
  basePath: string;
  primaryVersionCode: string;
  /** Código de la versión comparada activa, o null. */
  activeCode: string | null;
};

/**
 * Pastillas de lectura comparada: enlaces server-rendered (?vs=) — sin estado
 * de cliente, el modo viaja en la URL y sobrevive a prev/next. La versión
 * primaria no se ofrece contra sí misma.
 */
export function CompareSelector({ basePath, primaryVersionCode, activeCode }: Props) {
  const t = useTranslations('reader.compare');
  const options = COMPARE_VERSIONS.filter((v) => v.code !== primaryVersionCode);

  const pill = (active: boolean) =>
    `rounded-full border px-2.5 py-0.5 font-sans text-xs transition-colors ${
      active
        ? 'border-lapis-500 bg-lapis-500 text-white'
        : 'border-sand-200 text-stone-600 hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-200'
    }`;

  return (
    <nav aria-label={t('label')} className="flex flex-wrap items-center gap-1.5">
      <span className="font-sans text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
        {t('label')}
      </span>
      <Link href={basePath} className={pill(activeCode === null)} aria-current={activeCode === null ? 'true' : undefined}>
        {t('none')}
      </Link>
      {options.map((option) => (
        <Link
          key={option.code}
          href={`${basePath}?vs=${option.param}`}
          className={pill(activeCode === option.code)}
          aria-current={activeCode === option.code ? 'true' : undefined}
        >
          {t(option.param)}
        </Link>
      ))}
    </nav>
  );
}
