// Lectura en voz alta con la síntesis del navegador (Web Speech API).
// Decisión editorial: TTS sobre el texto de dominio público ya publicado —
// sin grabaciones de terceros, sin licencias, sin backend y gratis también
// para invitados. Las grabaciones humanas licenciadas quedan para el futuro.
//
// Este módulo es la parte pura (sin DOM): elegir voz e idioma. El componente
// ListenControls pone el resto.

export type SpeechVoiceLike = {
  lang: string;
  name: string;
  default?: boolean;
  localService?: boolean;
};

/** BCP-47 del TTS para el locale del lector. */
export function ttsLangFor(locale: string): string {
  return locale === 'en' ? 'en-US' : 'es-ES';
}

/** 'es_ES' (Android) y mayúsculas varias → 'es-es'. */
function normalizeLang(lang: string): string {
  return lang.toLowerCase().replace('_', '-');
}

/** Voces del idioma del lector, para el selector de la interfaz. */
export function voicesForLocale<T extends SpeechVoiceLike>(voices: T[], locale: string): T[] {
  const base = normalizeLang(ttsLangFor(locale)).slice(0, 2);
  return voices.filter((v) => normalizeLang(v.lang ?? '').startsWith(base));
}

/**
 * Mejor voz disponible para el idioma del lector, o `null` si no hay ninguna
 * (el navegador usará entonces su voz por defecto para `utterance.lang`).
 * Si el usuario eligió una voz (preferredName) y sigue instalada, manda ella.
 * Si no: variante regional exacta > voces modernas (Google/Natural/Neural,
 * bastante más agradables que las clásicas del sistema) > local > default.
 */
export function pickVoice<T extends SpeechVoiceLike>(
  voices: T[],
  locale: string,
  preferredName?: string | null,
): T | null {
  const wanted = normalizeLang(ttsLangFor(locale));
  const candidates = voicesForLocale(voices, locale);
  if (candidates.length === 0) return null;

  if (preferredName) {
    const chosen = candidates.find((v) => v.name === preferredName);
    if (chosen) return chosen;
  }

  const score = (v: T) =>
    (normalizeLang(v.lang) === wanted ? 8 : 0) +
    (/google|natural|neural|online/i.test(v.name) ? 4 : 0) +
    (v.localService ? 1 : 0) +
    (v.default ? 1 : 0);
  return candidates.reduce((best, v) => (score(v) > score(best) ? v : best));
}

/**
 * Al volver a la página, ¿hay que retomar la lectura por nuestra cuenta?
 *
 * Si el móvil se bloquea (o el usuario se va a otra app), el navegador puede
 * dejar la síntesis muerta sin avisar: nuestro estado sigue diciendo
 * «reproduciendo» pero no suena nada ni queda nada en cola. En ese caso hay
 * que relanzar desde el versículo activo.
 *
 * No se retoma si el usuario pausó a mano (`paused`), ni si el navegador
 * simplemente conserva la cola (`speaking`), donde basta con `resume()`.
 */
export function shouldRestartSpeech(opts: {
  status: 'idle' | 'playing' | 'paused';
  speaking: boolean;
  pending: boolean;
  paused: boolean;
}): boolean {
  return opts.status === 'playing' && !opts.speaking && !opts.pending && !opts.paused;
}

// --- Preferencias de lectura (voz y velocidad), persistentes ---------------

const VOICE_KEY = 'tabor.tts.voice';
const RATE_KEY = 'tabor.tts.rate';

export const TTS_RATES = [0.9, 1, 1.15, 1.3] as const;

export function getStoredVoiceName(): string | null {
  try {
    return localStorage.getItem(VOICE_KEY);
  } catch {
    return null;
  }
}

export function setStoredVoiceName(name: string | null): void {
  try {
    if (name === null) localStorage.removeItem(VOICE_KEY);
    else localStorage.setItem(VOICE_KEY, name);
  } catch {
    // Sin almacenamiento (modo privado estricto): la elección dura la sesión.
  }
}

export function getStoredRate(): number {
  try {
    const value = Number(localStorage.getItem(RATE_KEY));
    return (TTS_RATES as readonly number[]).includes(value) ? value : 1;
  } catch {
    return 1;
  }
}

export function setStoredRate(rate: number): void {
  try {
    localStorage.setItem(RATE_KEY, String(rate));
  } catch {
    // Ídem.
  }
}
