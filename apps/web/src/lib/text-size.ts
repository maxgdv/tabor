// Tamaño de letra del lector, elegido por el usuario y guardado en este
// dispositivo.
//
// Es un factor sobre el tamaño base del texto bíblico (1 = 18 px), publicado
// como variable CSS `--reader-scale` en <html>. Dos piezas lo aplican:
//
//   · TEXT_SIZE_BOOT_SCRIPT, un script en línea al principio del <body>, que
//     lee la preferencia antes del primer pintado. El lector es HTML estático
//     servido desde la CDN: sin esto, quien eligió letra grande vería el
//     capítulo a tamaño normal y un salto al hidratar.
//   · setTextScale(), cuando el usuario lo cambia desde los ajustes.
//
// El zoom del navegador sigue funcionando por encima (WCAG 1.4.4): esto es
// una comodidad para quien no sabe o no quiere ampliar la página entera.

export const TEXT_SCALES = [0.9, 1, 1.15, 1.3, 1.5, 1.75] as const;
export type TextScale = (typeof TEXT_SCALES)[number];

export const DEFAULT_TEXT_SCALE: TextScale = 1;

const KEY = 'tabor.reader.textScale';
const EVENT = 'tabor-text-scale-change';
const CSS_VAR = '--reader-scale';

/** El factor guardado, o el de por defecto si no hay o no es uno de los pasos. */
export function parseTextScale(raw: string | null): TextScale {
  const value = Number(raw);
  return (TEXT_SCALES as readonly number[]).includes(value)
    ? (value as TextScale)
    : DEFAULT_TEXT_SCALE;
}

/** Paso siguiente (+1) o anterior (−1); en los extremos devuelve el mismo. */
export function stepTextScale(current: TextScale, direction: 1 | -1): TextScale {
  const index = TEXT_SCALES.indexOf(current);
  const next = Math.min(TEXT_SCALES.length - 1, Math.max(0, index + direction));
  return TEXT_SCALES[next] ?? current;
}

/** «115» para mostrar «115 %». */
export function textScalePercent(scale: TextScale): number {
  return Math.round(scale * 100);
}

/**
 * Script en línea que aplica la preferencia antes del primer pintado. La
 * lista de valores admitidos se genera de TEXT_SCALES para que no pueda
 * desincronizarse; cualquier otro contenido de localStorage se ignora, así
 * que nada de lo guardado llega a la hoja de estilos sin validar.
 */
export const TEXT_SIZE_BOOT_SCRIPT = `try{var s=localStorage.getItem(${JSON.stringify(
  KEY,
)});if(${JSON.stringify(TEXT_SCALES.map(String))}.indexOf(s)>-1&&s!=="1")document.documentElement.style.setProperty(${JSON.stringify(
  CSS_VAR,
)},s)}catch(e){}`;

// --- Almacenamiento (solo navegador) ----------------------------------------

export function getTextScale(): TextScale {
  try {
    return parseTextScale(localStorage.getItem(KEY));
  } catch {
    return DEFAULT_TEXT_SCALE;
  }
}

export function subscribeTextScale(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function setTextScale(scale: TextScale): void {
  const root = document.documentElement;
  if (scale === DEFAULT_TEXT_SCALE) root.style.removeProperty(CSS_VAR);
  else root.style.setProperty(CSS_VAR, String(scale));
  try {
    if (scale === DEFAULT_TEXT_SCALE) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, String(scale));
  } catch {
    // Sin almacenamiento (modo privado estricto): la elección dura la visita.
  }
  window.dispatchEvent(new Event(EVENT));
}
