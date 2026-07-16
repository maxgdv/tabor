import { describe, expect, it } from 'vitest';
import { pickVoice, ttsLangFor, type SpeechVoiceLike } from './speech';

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

  it('entre iguales, prefiere voz local y luego default', () => {
    const voices = [
      voice('es-ES', 'Remota'),
      voice('es-ES', 'Local', { localService: true }),
      voice('es-ES', 'Default', { default: true }),
    ];
    expect(pickVoice(voices, 'es')?.name).toBe('Local');
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
