import { useTranslations } from 'next-intl';
import type { LiturgicalSeason } from '@/lib/routes';

/** Chip discreto con el tiempo litúrgico de un plan o una ruta. */
export function SeasonBadge({ season }: { season: LiturgicalSeason }) {
  const t = useTranslations('seasons');
  return (
    <span className="inline-block rounded-full border border-lapis-500/40 bg-lapis-500/10 px-2 py-0.5 font-sans text-[11px] font-medium uppercase tracking-wide text-lapis-700 dark:border-lapis-300/40 dark:bg-lapis-500/20 dark:text-lapis-300">
      {t(season)}
    </span>
  );
}
