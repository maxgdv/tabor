// Tipos compartidos entre /api/search y el SearchBox del header.
// (Un route handler de Next solo puede exportar los métodos HTTP, así que
// todo lo reutilizable vive aquí.)

// Marcadores de resaltado que Meilisearch inserta alrededor de los términos
// encontrados. Caracteres de control: imposibles en el texto bíblico, el
// cliente parte el snippet con ellos sin interpretar HTML.
export const HIGHLIGHT_PRE = '\u0001';
export const HIGHLIGHT_POST = '\u0002';

export type SearchReference = {
  urlSegment: string;
  bookName: string;
  /** Ausente si la consulta era solo el libro ("génesis") — enlaza al índice. */
  chapter?: number;
  verse?: number;
};

export type SearchPlace = {
  slug: string;
  name: string;
  modernName: string | null;
  bookUrlSegment: string;
  bookName: string;
  chapterNumber: number;
  mentionCount: number;
};

export type SearchVerse = {
  bookSegment: string;
  bookName: string;
  chapter: number;
  verse: number;
  /** Texto recortado con los términos entre HIGHLIGHT_PRE/POST. */
  snippet: string;
};

export type SearchResponse = {
  reference: SearchReference | null;
  places: SearchPlace[];
  verses: SearchVerse[];
};

// Un resultado plano del dropdown, sea cual sea su origen.
export type Item = {
  key: string;
  href: string;
  group: 'reference' | 'places' | 'verses';
  title: string;
  subtitle?: string;
  /** Solo los versículos llevan snippet con marcadores de resaltado. */
  snippet?: string;
};

/** Convierte la respuesta de /api/search en la lista plana del dropdown. */
export function toItems(data: SearchResponse): Item[] {
  const items: Item[] = [];

  if (data.reference) {
    const r = data.reference;
    const label =
      r.chapter === undefined
        ? r.bookName
        : `${r.bookName} ${r.chapter}${r.verse !== undefined ? `, ${r.verse}` : ''}`;
    const href =
      r.chapter === undefined
        ? `/leer/${r.urlSegment}`
        : `/leer/${r.urlSegment}/${r.chapter}${r.verse !== undefined ? `#v${r.verse}` : ''}`;
    items.push({ key: 'ref', href, group: 'reference', title: label });
  }

  for (const p of data.places) {
    items.push({
      key: `place:${p.slug}`,
      href: `/leer/${p.bookUrlSegment}/${p.chapterNumber}`,
      group: 'places',
      title: p.name,
      subtitle: `${p.bookName} ${p.chapterNumber}`,
    });
  }

  for (const v of data.verses) {
    items.push({
      key: `verse:${v.bookSegment}-${v.chapter}-${v.verse}`,
      href: `/leer/${v.bookSegment}/${v.chapter}#v${v.verse}`,
      group: 'verses',
      title: `${v.bookName} ${v.chapter}, ${v.verse}`,
      snippet: v.snippet,
    });
  }

  return items;
}
