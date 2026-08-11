'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { resolveCompare } from '@/lib/compare';
import type { Chapter } from '@/lib/bible';
import { ChapterReader, type ChapterAnnotations, type SecondaryText } from './ChapterReader';
import { ActiveVerseMarker } from './ActiveVerseMarker';
import { CompareSelector } from './CompareSelector';

type PersonalState = {
  bookmarks: number[];
  annotations: ChapterAnnotations;
};

/**
 * Observa ?vs= y lo reporta hacia arriba. Es una hoja invisible bajo Suspense
 * porque `useSearchParams` en un componente que envolviera el texto sacaría
 * el capítulo entero del HTML estático (y con él, el SEO del proyecto).
 */
function VsWatcher({ onChange }: { onChange: (vs: string | null) => void }) {
  const vs = useSearchParams().get('vs');
  useEffect(() => {
    onChange(vs);
  }, [vs, onChange]);
  return null;
}

/**
 * Capa de cliente del lector. La página del capítulo es estática (el mismo
 * HTML para todos, servido desde la CDN, sin quemar CPU de funciones por
 * visita); aquí se resuelve, ya en el navegador, todo lo que varía:
 *
 * - Sesión → /api/chapter-state: marcadores, resaltados y notas del usuario.
 *   ChapterReader se hidrata como invitado y sincroniza cuando llegan.
 * - ?vs= → /api/chapter-secondary: la segunda columna de lectura comparada
 *   (cacheable en CDN: texto público).
 *
 * La página remonta este componente por key al cambiar de capítulo, así que
 * el estado nunca sobrevive de un capítulo a otro.
 */
export function ReaderClient({
  chapter,
  basePath,
  primaryVersionCode,
  locale,
}: {
  chapter: Chapter;
  basePath: string;
  primaryVersionCode: string;
  locale: string;
}) {
  const { data: session } = authClient.useSession();
  // El estado guarda de quién/de qué es cada dato y el valor efectivo se
  // deriva comparando con la sesión o la query actuales: así no hace falta
  // limpiar con setState síncrono en efectos, y un cambio de usuario o de
  // ?vs= nunca muestra datos de otro contexto ni un instante.
  const [personal, setPersonal] = useState<{ userId: string; state: PersonalState } | null>(null);
  const [vs, setVs] = useState<string | null>(null);
  const [secondary, setSecondary] = useState<{ param: string; data: SecondaryText } | null>(null);

  const book = chapter.bookCanonicalId.toLowerCase();
  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetch(`/api/chapter-state?book=${book}&chapter=${chapter.number}`)
      .then((res) => (res.ok ? (res.json() as Promise<PersonalState>) : null))
      .then((data) => {
        if (!cancelled && data) setPersonal({ userId, state: data });
      })
      .catch(() => {
        // Sin red no hay UI personal: el lector queda en modo invitado.
      });
    return () => {
      cancelled = true;
    };
  }, [userId, book, chapter.number]);
  const personalState = userId && personal?.userId === userId ? personal.state : null;

  const compareParam = resolveCompare(vs ?? undefined, primaryVersionCode)?.param ?? null;
  useEffect(() => {
    if (!compareParam) return;
    let cancelled = false;
    fetch(
      `/api/chapter-secondary?book=${book}&chapter=${chapter.number}&vs=${compareParam}&locale=${locale}`,
    )
      .then((res) => (res.ok ? (res.json() as Promise<SecondaryText>) : null))
      .then((data) => {
        if (!cancelled && data) setSecondary({ param: compareParam, data });
      })
      .catch(() => {
        // Si la petición falla, la lectura sigue a una columna.
      });
    return () => {
      cancelled = true;
    };
  }, [compareParam, book, chapter.number, locale]);
  const secondaryText =
    compareParam && secondary?.param === compareParam ? secondary.data : null;

  return (
    <>
      <Suspense fallback={null}>
        <VsWatcher onChange={setVs} />
      </Suspense>
      <ChapterReader
        chapter={chapter}
        initialBookmarks={personalState?.bookmarks ?? null}
        initialAnnotations={personalState?.annotations ?? null}
        secondary={secondaryText}
        headerExtra={
          <CompareSelector basePath={basePath} primaryVersionCode={primaryVersionCode} />
        }
      />
      <ActiveVerseMarker />
    </>
  );
}
