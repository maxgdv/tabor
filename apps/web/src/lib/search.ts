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
