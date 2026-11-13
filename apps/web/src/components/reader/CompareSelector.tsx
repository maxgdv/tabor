'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { COMPARE_VERSIONS, resolveCompare } from '@/lib/compare';

type Props = {
  primaryVersionCode: string;
};

/**
 * Pastillas de lectura comparada. El modo sigue viajando en la URL (?vs=) —
 * se puede compartir y sobrevive a prev/next—, pero las pastillas son botones
 * y no enlaces.
 *
 * Como enlaces, cada capítulo ofrecía a los rastreadores dos URLs más
 * (`?vs=cpdv`, `?vs=vul`) con el mismo texto: Google llegó a mostrar esas
 * variantes en resultados pese a su canónica, Next las precargaba en cada
 * visita, y cada bot que las seguía disparaba /api/chapter-secondary (98
 * invocaciones en 12 h, nov-2026). Un botón no se rastrea ni se precarga.
 *
 * `history.pushState` en vez del router: Next sincroniza `useSearchParams`
 * con el historial nativo, así que el cambio de modo no pide nada al servidor
 * (la página es la misma; solo cambia la segunda columna, que ReaderClient
 * trae por su cuenta) y el botón Atrás deshace el cambio, como antes.
 *
 * Componente de cliente porque la página es estática y el estado activo sale
 * de `useSearchParams` al hidratar; el HTML estático (fallback del Suspense)
 * lleva las mismas pastillas con «solo lectura» activo.
 */
function CompareSelectorPills({
  primaryVersionCode,
  activeCode,
}: Props & { activeCode: string | null }) {
  const t = useTranslations('reader.compare');
  const options = COMPARE_VERSIONS.filter((v) => v.code !== primaryVersionCode);

  const select = (param: string | null) => {
    const { pathname, hash } = window.location;
    window.history.pushState(null, '', `${pathname}${param ? `?vs=${param}` : ''}${hash}`);
  };

  const pill = (active: boolean) =>
    // py-1.5: en móvil la pastilla de 22 px era un objetivo táctil escaso.
    `inline-flex items-center rounded-full border px-2.5 py-1.5 font-sans text-xs leading-none transition-colors ${
      active
        ? 'border-lapis-500 bg-lapis-500 text-white'
        : 'border-sand-200 text-stone-600 hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-200'
    }`;

  return (
    <div role="group" aria-label={t('label')} className="flex flex-wrap items-center gap-1.5">
      <span
        aria-hidden="true"
        className="font-sans text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400"
      >
        {t('label')}
      </span>
      <button
        type="button"
        onClick={() => select(null)}
        aria-pressed={activeCode === null}
        className={pill(activeCode === null)}
      >
        {t('none')}
      </button>
      {options.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => select(option.param)}
          aria-pressed={activeCode === option.code}
          className={pill(activeCode === option.code)}
        >
          {t(option.param)}
        </button>
      ))}
    </div>
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
