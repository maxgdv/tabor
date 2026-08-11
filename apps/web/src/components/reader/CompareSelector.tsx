'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { COMPARE_VERSIONS, resolveCompare } from '@/lib/compare';

type Props = {
  /** /leer/gen/12 — ruta del capítulo sin query. */
  basePath: string;
  primaryVersionCode: string;
};

/**
 * Pastillas de lectura comparada: enlaces ?vs= — el modo viaja en la URL y
 * sobrevive a prev/next. Componente de cliente porque la página es estática
 * y el estado activo sale de `useSearchParams` al hidratar; el HTML estático
 * (fallback del Suspense) lleva las mismas pastillas con "solo texto" activo.
 */
function CompareSelectorPills({
  basePath,
  primaryVersionCode,
  activeCode,
}: Props & { activeCode: string | null }) {
  const t = useTranslations('reader.compare');
  const options = COMPARE_VERSIONS.filter((v) => v.code !== primaryVersionCode);

  const pill = (active: boolean) =>
    // py-1.5: en móvil la pastilla de 22 px era un objetivo táctil escaso.
    `inline-flex items-center rounded-full border px-2.5 py-1.5 font-sans text-xs leading-none transition-colors ${
      active
        ? 'border-lapis-500 bg-lapis-500 text-white'
        : 'border-sand-200 text-stone-600 hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-200'
    }`;

  return (
    <nav aria-label={t('label')} className="flex flex-wrap items-center gap-1.5">
      <span className="font-sans text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
        {t('label')}
      </span>
      <Link
        href={basePath}
        className={pill(activeCode === null)}
        aria-current={activeCode === null ? 'true' : undefined}
      >
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

function CompareSelectorWithQuery(props: Props) {
  const vs = useSearchParams().get('vs');
  const activeCode = resolveCompare(vs ?? undefined, props.primaryVersionCode)?.code ?? null;
  return <CompareSelectorPills {...props} activeCode={activeCode} />;
}

export function CompareSelector(props: Props) {
  return (
    <Suspense fallback={<CompareSelectorPills {...props} activeCode={null} />}>
      <CompareSelectorWithQuery {...props} />
    </Suspense>
  );
}
