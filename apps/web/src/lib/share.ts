// Compartir o copiar versículos: el texto que sale del lector hacia
// WhatsApp, un correo o el portapapeles. Funciones puras.
//
// El mensaje lleva la cita, la referencia con la versión y el enlace al
// versículo exacto (`#v12`, el mismo ancla que usan la búsqueda y los
// planes). El enlace va dentro del texto y no en un campo aparte: es la
// forma que WhatsApp y el portapapeles conservan entera.

import { contiguousRanges, formatRanges } from './annotations';

export type ShareInput = {
  /** Versículos seleccionados, en cualquier orden. */
  verses: Array<{ number: number; text: string }>;
  bookName: string;
  chapter: number;
  /** Nombre completo de la versión («Biblia Platense (Straubinger)»). */
  versionName: string;
  locale: string;
  /** Segmento del libro en la URL: 'mat', '1sa'. */
  bookSegment: string;
  /** Origen público del sitio, sin barra final. */
  siteUrl: string;
};

/** «Mateo 4, 3-5» en español; «Matthew 4:3-5» en inglés. */
export function shareReference(
  bookName: string,
  chapter: number,
  verseNumbers: number[],
  locale: string,
): string {
  const refs = formatRanges(contiguousRanges(verseNumbers));
  return locale === 'en' ? `${bookName} ${chapter}:${refs}` : `${bookName} ${chapter}, ${refs}`;
}

/** Enlace público al capítulo, anclado al primer versículo de la selección. */
export function shareUrl(
  input: Pick<ShareInput, 'siteUrl' | 'locale' | 'bookSegment' | 'chapter'>,
  firstVerse: number,
): string {
  return `${input.siteUrl}/${input.locale}/leer/${input.bookSegment}/${input.chapter}#v${firstVerse}`;
}

/**
 * Texto completo para compartir. Los versículos contiguos se unen en un solo
 * párrafo; entre tramos salteados va «[…]», para no presentar como seguido
 * un texto al que se le ha quitado algo. `null` si no hay nada seleccionado.
 */
export function buildShareText(input: ShareInput): string | null {
  const sorted = [...input.verses].sort((a, b) => a.number - b.number);
  const first = sorted[0];
  if (!first) return null;

  const byNumber = new Map(sorted.map((v) => [v.number, v.text.replace(/\s+/g, ' ').trim()]));
  const numbers = sorted.map((v) => v.number);
  const quote = contiguousRanges(numbers)
    .map((range) => {
      const parts: string[] = [];
      for (let n = range.start; n <= range.end; n += 1) {
        const text = byNumber.get(n);
        if (text) parts.push(text);
      }
      return parts.join(' ');
    })
    .join(' […] ');

  const [open, close] = input.locale === 'en' ? ['“', '”'] : ['«', '»'];
  const reference = shareReference(input.bookName, input.chapter, numbers, input.locale);

  return `${open}${quote}${close}\n— ${reference} · ${input.versionName}\n${shareUrl(input, first.number)}`;
}
