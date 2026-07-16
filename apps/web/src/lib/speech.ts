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

/**
 * Mejor voz disponible para el idioma del lector, o `null` si no hay ninguna
 * (el navegador usará entonces su voz por defecto para `utterance.lang`).
 * Preferencias: variante regional exacta > voz local (sin red) > voz default.
 */
export function pickVoice<T extends SpeechVoiceLike>(voices: T[], locale: string): T | null {
  const wanted = normalizeLang(ttsLangFor(locale));
  const base = wanted.slice(0, 2);
  const candidates = voices.filter((v) => normalizeLang(v.lang ?? '').startsWith(base));
  if (candidates.length === 0) return null;

  const score = (v: T) =>
    (normalizeLang(v.lang) === wanted ? 4 : 0) + (v.localService ? 2 : 0) + (v.default ? 1 : 0);
  return candidates.reduce((best, v) => (score(v) > score(best) ? v : best));
}
