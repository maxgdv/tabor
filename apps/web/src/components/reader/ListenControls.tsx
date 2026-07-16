'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useReaderStore } from '@/lib/reader-store';
import { pickVoice, ttsLangFor } from '@/lib/speech';

type Props = {
  /** Versículos del capítulo, en orden. */
  verses: Array<{ number: number; text: string }>;
};

type Status = 'idle' | 'playing' | 'paused';

/**
 * Lectura del capítulo en voz alta con el TTS del navegador, versículo a
 * versículo desde el versículo activo. El que suena se marca activo (y el
 * mapa lo sigue) y se lleva a la vista. Un enunciado por versículo: evita el
 * límite de ~15 s de Chrome y da la granularidad de la sincronización.
 * Si el navegador no soporta speechSynthesis, no se renderiza nada.
 */
export function ListenControls({ verses }: Props) {
  const t = useTranslations('reader');
  const locale = useLocale();
  const setActiveVerse = useReaderStore((s) => s.setActiveVerse);
  const requestScrollTo = useReaderStore((s) => s.requestScrollTo);

  // El soporte solo se conoce en cliente; en SSR se renderiza vacío estable
  // y React re-renderiza tras hidratar con el valor real (useSyncExternalStore
  // es el patrón para valores servidor≠cliente sin setState en efectos).
  const supported = useSyncExternalStore(
    () => () => {},
    () => 'speechSynthesis' in window,
    () => false,
  );
  const [status, setStatus] = useState<Status>('idle');
  // Los callbacks de enunciados viejos (tras parar o cambiar de arranque)
  // se ignoran comparando su sesión con la vigente.
  const sessionRef = useRef(0);

  // Muchos navegadores cargan las voces en diferido: getVoices() vacío hasta
  // 'voiceschanged'. Pedirlas al montar dispara esa carga.
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.getVoices();
  }, []);

  // Al desmontar (incluido el remontaje por cambio de capítulo), silencio.
  useEffect(
    () => () => {
      sessionRef.current += 1;
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    },
    [],
  );

  const speakFrom = (index: number, session: number) => {
    if (session !== sessionRef.current) return;
    const verse = verses[index];
    if (!verse) {
      setStatus('idle');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(verse.text);
    utterance.lang = ttsLangFor(locale);
    const voice = pickVoice(window.speechSynthesis.getVoices(), locale);
    if (voice) utterance.voice = voice;
    utterance.onstart = () => {
      if (session !== sessionRef.current) return;
      setActiveVerse(verse.number);
      requestScrollTo(verse.number);
    };
    utterance.onend = () => speakFrom(index + 1, session);
    utterance.onerror = () => {
      if (session === sessionRef.current) setStatus('idle');
    };
    window.speechSynthesis.speak(utterance);
  };

  const play = () => {
    const synth = window.speechSynthesis;
    if (status === 'paused') {
      synth.resume();
      setStatus('playing');
      return;
    }
    synth.cancel();
    // Chrome puede dejar `paused` atascado tras cancelar en pausa y entonces
    // speak() encola sin sonar; resume() con la cola vacía es inocuo.
    synth.resume();
    const session = ++sessionRef.current;
    const active = useReaderStore.getState().activeVerseNumber;
    const fromActive = active != null ? verses.findIndex((v) => v.number === active) : -1;
    setStatus('playing');
    speakFrom(fromActive === -1 ? 0 : fromActive, session);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setStatus('paused');
  };

  const stop = () => {
    sessionRef.current += 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    setStatus('idle');
  };

  if (!supported || verses.length === 0) return null;

  const mainLabel = t(status === 'playing' ? 'listenPause' : status === 'paused' ? 'listenResume' : 'listen');

  return (
    <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label={t('listenGroup')}>
      <button
        type="button"
        onClick={status === 'playing' ? pause : play}
        aria-label={mainLabel}
        title={mainLabel}
        className="inline-flex items-center gap-1.5 rounded-md border border-sand-200 bg-sand-50/90 px-2.5 py-1.5 font-sans text-xs text-stone-600 backdrop-blur transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:bg-stone-900/80 dark:text-sand-200"
      >
        {status === 'playing' ? (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 4.5v15l13-7.5z" />
          </svg>
        )}
        {t(status === 'playing' ? 'listenPauseShort' : status === 'paused' ? 'listenResumeShort' : 'listenShort')}
      </button>
      {status !== 'idle' && (
        <button
          type="button"
          onClick={stop}
          aria-label={t('listenStop')}
          title={t('listenStop')}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-sand-200 bg-sand-50/90 text-stone-600 backdrop-blur transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:bg-stone-900/80 dark:text-sand-200"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>
      )}
    </div>
  );
}
