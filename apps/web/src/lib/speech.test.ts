import { describe, expect, it } from 'vitest';
import { TTS_RATES, pickVoice, ttsLangFor, voicesForLocale, type SpeechVoiceLike } from './speech';

const voice = (lang: string, name: string, extra: Partial<SpeechVoiceLike> = {}): SpeechVoiceLike => ({
  lang,
  name,
  ...extra,
});

describe('ttsLangFor', () => {
  it('mapea locales del lector a BCP-47', () => {
    expect(ttsLangFor('es')).toBe('es-ES');
    expect(ttsLangFor('en')).toBe('en-US');
  });
});

describe('pickVoice', () => {
  it('prefiere la variante regional exacta', () => {
    const voices = [voice('es-MX', 'Sabina'), voice('es-ES', 'Mónica'), voice('en-US', 'Samantha')];
    expect(pickVoice(voices, 'es')?.name).toBe('Mónica');
  });

  it('cae a cualquier variante del idioma si no hay exacta', () => {
    const voices = [voice('en-GB', 'Daniel'), voice('es-MX', 'Sabina')];
    expect(pickVoice(voices, 'es')?.name).toBe('Sabina');
    expect(pickVoice(voices, 'en')?.name).toBe('Daniel');
  });

  it('prefiere las voces modernas (Google/Natural) sobre las clásicas del sistema', () => {
    const voices = [
      voice('es-ES', 'Microsoft Helena - Spanish (Spain)', { localService: true }),
      voice('es-ES', 'Google español'),
    ];
    expect(pickVoice(voices, 'es')?.name).toBe('Google español');
  });

  it('entre iguales, prefiere voz local y luego default', () => {
    const voices = [
      voice('es-ES', 'Remota'),
      voice('es-ES', 'Local', { localService: true }),
      voice('es-ES', 'Standard', { default: true }),
    ];
    expect(pickVoice(voices, 'es')?.name).toBe('Local');
  });

  it('la voz elegida por el usuario manda si sigue instalada; si no, heurística', () => {
    const voices = [
      voice('es-ES', 'Google español'),
      voice('es-ES', 'Microsoft Pablo - Spanish (Spain)', { localService: true }),
    ];
    expect(pickVoice(voices, 'es', 'Microsoft Pablo - Spanish (Spain)')?.name).toBe(
      'Microsoft Pablo - Spanish (Spain)',
    );
    expect(pickVoice(voices, 'es', 'Voz Desinstalada')?.name).toBe('Google español');
  });

  it('voicesForLocale filtra por idioma base', () => {
    const voices = [voice('es-ES', 'A'), voice('es-MX', 'B'), voice('en-US', 'C')];
    expect(voicesForLocale(voices, 'es').map((v) => v.name)).toEqual(['A', 'B']);
  });

  it('TTS_RATES incluye la velocidad normal', () => {
    expect(TTS_RATES).toContain(1);
  });

  it('normaliza es_ES con guion bajo (Android)', () => {
    const voices = [voice('es_ES', 'Android'), voice('es-MX', 'Sabina')];
    expect(pickVoice(voices, 'es')?.name).toBe('Android');
  });

  it('sin voces del idioma → null (el navegador decide)', () => {
    expect(pickVoice([voice('fr-FR', 'Thomas')], 'es')).toBeNull();
    expect(pickVoice([], 'es')).toBeNull();
  });
});
