import { useTranslations } from 'next-intl';
import { PERIODS, periodIndex, type PeriodId } from '@/lib/periods';

type Props = { period: PeriodId };

/**
 * Sitúa el capítulo en su época: nombre, fechas aproximadas y una línea de
 * puntos con las diez épocas (la activa, resaltada). Pastilla fija sobre el
 * mapa, abajo a la izquierda. Server component, sin interacción en v1.
 */
export function PeriodTimeline({ period }: Props) {
  const t = useTranslations('periods');
  const active = periodIndex(period);
  const data = PERIODS[active];
  if (!data) return null;

  // «c. 2000-1700 a. C.» / «c. 6 a. C. - 30 d. C.» / «30-100 d. C.»
  const { from, to } = data;
  const range =
    from === null
      ? t('beforeAbout', { year: Math.abs(to) })
      : to < 0
        ? `c. ${Math.abs(from)}-${Math.abs(to)} ${t('bc')}`
        : from < 0
          ? `c. ${Math.abs(from)} ${t('bc')} - ${to} ${t('ad')}`
          : `${from}-${to} ${t('ad')}`;

  return (
    <div className="pointer-events-none absolute bottom-2 left-2 z-10 rounded-md bg-white/90 px-3 py-2 font-sans shadow-md backdrop-blur-sm dark:bg-stone-900/85">
      <p className="text-xs font-semibold leading-tight text-stone-800 dark:text-sand-100">
        {t(`name.${period}`)}
        <span className="ml-2 font-normal text-stone-500 dark:text-stone-400">{range}</span>
      </p>
      <div className="mt-1.5 flex items-center gap-1" aria-hidden="true">
        {PERIODS.map((p, i) => (
          <span
            key={p.id}
            className={
              i === active
                ? 'h-1.5 w-5 rounded-full bg-lapis-500'
                : 'h-1.5 w-1.5 rounded-full bg-stone-300 dark:bg-stone-600'
            }
          />
        ))}
      </div>
    </div>
  );
}
