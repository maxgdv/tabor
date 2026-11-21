import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TEXT_SCALE,
  TEXT_SCALES,
  TEXT_SIZE_BOOT_SCRIPT,
  parseTextScale,
  stepTextScale,
  textScalePercent,
} from './text-size';

describe('parseTextScale', () => {
  it('acepta cada uno de los pasos', () => {
    for (const scale of TEXT_SCALES) {
      expect(parseTextScale(String(scale))).toBe(scale);
    }
  });

  it('cae al tamaño por defecto con cualquier otra cosa', () => {
    expect(parseTextScale(null)).toBe(DEFAULT_TEXT_SCALE);
    expect(parseTextScale('')).toBe(DEFAULT_TEXT_SCALE);
    expect(parseTextScale('2')).toBe(DEFAULT_TEXT_SCALE);
    expect(parseTextScale('1.2')).toBe(DEFAULT_TEXT_SCALE);
    expect(parseTextScale('grande')).toBe(DEFAULT_TEXT_SCALE);
    expect(parseTextScale('1;color:red')).toBe(DEFAULT_TEXT_SCALE);
  });
});

describe('stepTextScale', () => {
  it('sube y baja de paso en paso', () => {
    expect(stepTextScale(1, 1)).toBe(1.15);
    expect(stepTextScale(1.15, -1)).toBe(1);
    expect(stepTextScale(1, -1)).toBe(0.9);
  });

  it('no se sale de los extremos', () => {
    const smallest = TEXT_SCALES[0];
    const largest = TEXT_SCALES[TEXT_SCALES.length - 1]!;
    expect(stepTextScale(smallest, -1)).toBe(smallest);
    expect(stepTextScale(largest, 1)).toBe(largest);
  });
});

describe('textScalePercent', () => {
  it('redondea sin decimales raros', () => {
    expect(textScalePercent(1.15)).toBe(115);
    expect(textScalePercent(0.9)).toBe(90);
  });
});

describe('TEXT_SIZE_BOOT_SCRIPT', () => {
  /** Ejecuta el script con un localStorage y un <html> de mentira. */
  function run(stored: string | null): Record<string, string> {
    const applied: Record<string, string> = {};
    const fakeDocument = {
      documentElement: {
        style: {
          setProperty: (name: string, value: string) => {
            applied[name] = value;
          },
        },
      },
    };
    const fakeStorage = { getItem: () => stored };
    new Function('localStorage', 'document', TEXT_SIZE_BOOT_SCRIPT)(fakeStorage, fakeDocument);
    return applied;
  }

  it('aplica un tamaño guardado válido', () => {
    expect(run('1.3')).toEqual({ '--reader-scale': '1.3' });
    expect(run('0.9')).toEqual({ '--reader-scale': '0.9' });
  });

  it('no toca nada sin preferencia o con el tamaño por defecto', () => {
    expect(run(null)).toEqual({});
    expect(run('1')).toEqual({});
  });

  it('ignora valores que no son uno de los pasos', () => {
    expect(run('3')).toEqual({});
    expect(run('1.3;background:url(x)')).toEqual({});
  });

  it('no revienta si localStorage lanza', () => {
    const throwing = {
      getItem: () => {
        throw new Error('SecurityError');
      },
    };
    expect(() =>
      new Function('localStorage', 'document', TEXT_SIZE_BOOT_SCRIPT)(throwing, {}),
    ).not.toThrow();
  });

  it('no contiene nada que pueda cerrar la etiqueta <script>', () => {
    expect(TEXT_SIZE_BOOT_SCRIPT).not.toContain('<');
  });
});
