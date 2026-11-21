'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  getLastReadSnapshot,
  lastReadHref,
  lastReadLabel,
  parseLastRead,
  subscribeLastRead,
} from '@/lib/last-read';

const CLASS_NAME =
  'inline-flex items-center gap-2 rounded-md bg-lapis-500 px-5 py-3 font-sans text-sm font-medium text-white hover:bg-lapis-600';

/**
 * Botón principal de la portada. Para quien llega por primera vez es
 * «Comenzar a leer» y lleva al índice de libros; para quien ya leyó algo en
 * este dispositivo pasa a ser «Seguir leyendo · Mateo 4» y lleva al versículo
 * donde lo dejó.
 *
 * La portada es estática (la misma para todos, desde la CDN): el HTML lleva
 * siempre «Comenzar a leer» —que es también lo que ve un buscador— y el
 * cambio ocurre en el navegador tras hidratar. useSyncExternalStore lo hace
 * sin desajuste de hidratación ni setState en efectos.
 */
export function ReadCta() {
  const t = useTranslations('home');
  const locale = useLocale();
  const raw = useSyncExternalStore(subscribeLastRead, getLastReadSnapshot, () => null);
  const last = useMemo(() => parseLastRead(raw), [raw]);

  if (!last) {
    return (
      <Link href="/leer" className={CLASS_NAME}>
        {t('ctaRead')}
      </Link>
    );
  }

  return (
    <Link href={lastReadHref(last)} className={CLASS_NAME}>
      {t('ctaContinue')}
      <span className="text-xs opacity-80">· {lastReadLabel(last, locale)}</span>
    </Link>
  );
}
