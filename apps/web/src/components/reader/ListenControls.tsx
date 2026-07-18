'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useReaderStore } from '@/lib/reader-store';
import {
  TTS_RATES,
  getStoredRate,
  getStoredVoiceName,
  pickVoice,
  setStoredRate,
  setStoredVoiceName,
  ttsLangFor,
  voicesForLocale,
} from '@/lib/speech';

type Props = {
  /** Versículos del capítulo, en orden. */
  verses: Array<{ number: number; text: string }>;
};

type Status = 'idle' | 'playing' | 'paused';

// Snapshot estable de getVoices() para useSyncExternalStore (la API devuelve
// un array nuevo en cada llamada; sin cache, re-render infinito).
let voicesSnapshot: SpeechSynthesisVoice[] = [];
function subscribeVoices(onChange: () => void): () => void {
  const update = () => {
    voicesSnapshot = window.speechSynthesis.getVoices();
    onChange();
  };
  // Muchos navegadores cargan las voces en diferido ('voiceschanged');
  // sincronizar al suscribir cubre a los que ya las tienen listas.
  update();
  window.speechSynthesis.addEventListener('voiceschanged', update);
  return () => window.speechSynthesis.removeEventListener('voiceschanged', update);
}

/**
 * Lectura del capítulo en voz alta con el TTS del navegador, versículo a
 * versículo desde el versículo activo. El que suena se marca activo (y el
 * mapa lo sigue) y se lleva a la vista. Un enunciado por versículo: evita el
 * límite de ~15 s de Chrome y da la granularidad de la sincronización.
 * Ajustes de voz y velocidad persistentes; los cambios aplican en el
 * siguiente versículo. Si no hay speechSynthesis, no se renderiza nada.
 */
export function ListenControls({ verses }: Props) {
  const t = useTranslations('reader');
  const locale = useLocale();
  const setActiveVerse = useReaderStore((s) => s.setActiveVerse);
  const requestScrollTo = useReaderStore((s) => s.requestScrollTo);

  // El soporte solo se conoce en cliente; en SSR se renderiza vacío estable
  // y React re-renderiza tras hidratar (useSyncExternalStore es el patrón
  // para valores servidor≠cliente sin setState en efectos).
  const supported = useSyncExternalStore(
    () => () => {},
    () => 'speechSynthesis' in window,
    () => false,
  );
  const [status, setStatus] = useState<Status>('idle');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const voices = useSyncExternalStore(
    supported ? subscribeVoices : () => () => {},
    () => voicesSnapshot,
    () => [],
  );
  // Preferencias persistentes; los getters tienen try/catch y devuelven el
  // default en SSR, así el initializer es seguro en ambos lados.
  const [voiceName, setVoiceName] = useState<string | null>(() => getStoredVoiceName());
  const [rate, setRate] = useState(() => getStoredRate());
  // Los callbacks de enunciados viejos (tras parar o cambiar de arranque)
  // se ignoran comparando su sesión con la vigente. Voz y velocidad viajan
  // en refs para que la lectura en curso adopte cambios sin reiniciarse.
  const sessionRef = useRef(0);
  const voiceNameRef = useRef<string | null>(getStoredVoiceName());
  const rateRef = useRef(getStoredRate());

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
    utterance.rate = rateRef.current;
    const voice = pickVoice(window.speechSynthesis.getVoices(), locale, voiceNameRef.current);
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

  const chooseVoice = (name: string) => {
    const value = name === '' ? null : name;
    voiceNameRef.current = value;
    setVoiceName(value);
    setStoredVoiceName(value);
  };

  const chooseRate = (value: number) => {
    rateRef.current = value;
    setRate(value);
    setStoredRate(value);
  };

  if (!supported || verses.length === 0) return null;

  const localeVoices = voicesForLocale(voices, locale);
  const defaultVoice = pickVoice(voices, locale, voiceName);
  const mainLabel = t(status === 'playing' ? 'listenPause' : status === 'paused' ? 'listenResume' : 'listen');
  const buttonClass =
    'inline-flex items-center gap-1.5 rounded-md border border-sand-200 bg-sand-50/90 px-2.5 py-1.5 font-sans text-xs text-stone-600 backdrop-blur transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:bg-stone-900/80 dark:text-sand-200';

  return (
    <div className="relative">
      <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label={t('listenGroup')}>
        <button type="button" onClick={status === 'playing' ? pause : play} aria-label={mainLabel} title={mainLabel} className={buttonClass}>
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
        {localeVoices.length > 0 && (
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-expanded={settingsOpen}
            aria-label={t('listenSettings')}
            title={t('listenSettings')}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-sand-200 bg-sand-50/90 text-stone-600 backdrop-blur transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:bg-stone-900/80 dark:text-sand-200"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 4.06a1.72 1.72 0 013.32 0l.18.72a1.72 1.72 0 002.57 1.06l.64-.38a1.72 1.72 0 012.35 2.35l-.38.64a1.72 1.72 0 001.06 2.57l.72.18a1.72 1.72 0 010 3.32l-.72.18a1.72 1.72 0 00-1.06 2.57l.38.64a1.72 1.72 0 01-2.35 2.35l-.64-.38a1.72 1.72 0 00-2.57 1.06l-.18.72a1.72 1.72 0 01-3.32 0l-.18-.72a1.72 1.72 0 00-2.57-1.06l-.64.38a1.72 1.72 0 01-2.35-2.35l.38-.64a1.72 1.72 0 00-1.06-2.57l-.72-.18a1.72 1.72 0 010-3.32l.72-.18a1.72 1.72 0 001.06-2.57l-.38-.64a1.72 1.72 0 012.35-2.35l.64.38a1.72 1.72 0 002.57-1.06l.18-.72z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </div>

      {settingsOpen && (
        <div className="absolute right-0 top-full z-20 mt-1.5 w-64 space-y-3 rounded-lg border border-sand-200 bg-sand-50 p-3 shadow-xl dark:border-stone-700 dark:bg-stone-900">
          <label className="block">
            <span className="mb-1 block font-sans text-xs font-medium text-stone-600 dark:text-sand-200">
              {t('listenVoice')}
            </span>
            <select
              value={defaultVoice?.name ?? ''}
              onChange={(e) => chooseVoice(e.target.value)}
              className="w-full rounded-md border border-sand-200 bg-white/70 px-2 py-1.5 font-sans text-xs text-stone-800 focus:border-lapis-500 focus:outline-none focus:ring-1 focus:ring-lapis-500 dark:border-stone-600 dark:bg-stone-800/70 dark:text-sand-100"
            >
              {localeVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block font-sans text-xs font-medium text-stone-600 dark:text-sand-200">
              {t('listenRate')}
            </span>
            <select
              value={rate}
              onChange={(e) => chooseRate(Number(e.target.value))}
              className="w-full rounded-md border border-sand-200 bg-white/70 px-2 py-1.5 font-sans text-xs text-stone-800 focus:border-lapis-500 focus:outline-none focus:ring-1 focus:ring-lapis-500 dark:border-stone-600 dark:bg-stone-800/70 dark:text-sand-100"
            >
              {TTS_RATES.map((r) => (
                <option key={r} value={r}>
                  {t(`rate.${String(r).replace('.', '_')}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
