// Arte sacro de dominio público por capítulo, para capítulos sin geografía:
// donde el mapa no aporta, una obra clásica que representa el pasaje.
//
// BORRADOR editorial: la selección la propuso el asistente verificando cada
// fichero contra la API de Wikimedia Commons; pendiente de revisión del
// maintainer (criterio de la spec §5: curaduría editorial antes que código).
//
// Cada entrada: clave `BOOK/chapter` (canonical_id en mayúsculas), obra en
// dominio público con URL directa de upload.wikimedia.org y enlace a su
// página de Commons para la atribución.

export type ChapterArtwork = {
  title: string;
  artist: string;
  /** Año o rango aproximado; '' si no se conoce. */
  year: string;
  imageUrl: string;
  sourceUrl: string;
};

export const CHAPTER_ART: Record<string, ChapterArtwork> = {
  'GEN/1': {
    title: 'La creación de Adán',
    artist: 'Miguel Ángel',
    year: '1511',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Michelangelo_-_Creation_of_Adam_(cropped).jpg',
  },
  'GEN/7': {
    title: 'El Diluvio',
    artist: 'Gustave Doré',
    year: '1866',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/56/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Gustave_Doré_-_The_Holy_Bible_-_Plate_I,_The_Deluge.jpg',
  },
  'GEN/9': {
    title: 'La ofrenda de Noé',
    artist: 'Joseph Anton Koch',
    year: 'c. 1803',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Joseph_Anton_Koch_006.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Joseph_Anton_Koch_006.jpg',
  },
  'TOB/6': {
    title: 'Tobías y el ángel',
    artist: 'Taller de Andrea del Verrocchio',
    year: '1470-1475',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/1/15/Workshop_of_Andrea_del_Verrocchio._Tobias_and_the_Angel._33x26cm._1470-75._NG_London.jpg',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Workshop_of_Andrea_del_Verrocchio._Tobias_and_the_Angel._33x26cm._1470-75._NG_London.jpg',
  },
  'JDT/13': {
    title: 'El regreso de Judit a Betulia',
    artist: 'Sandro Botticelli',
    year: 'c. 1472',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/5b/Sandro_Botticelli%2C_Ritorno_di_Giuditta_dal_campo_nemico_-_R%C3%BCckkehr_der_Judith_nach_Bethulia_-_The_Return_of_Judith_to_Bethulia.jpg',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Sandro_Botticelli,_Ritorno_di_Giuditta_dal_campo_nemico_-_Rückkehr_der_Judith_nach_Bethulia_-_The_Return_of_Judith_to_Bethulia.jpg',
  },
  'JOB/38': {
    title: 'Cuando las estrellas del alba cantaban a coro',
    artist: 'William Blake',
    year: '1826',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/de/William_Blake_-_The_Book_of_Job_-_When_the_Morning_Stars_Sang_Together_-_WGA02228.jpg',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:William_Blake_-_The_Book_of_Job_-_When_the_Morning_Stars_Sang_Together_-_WGA02228.jpg',
  },
  'PSA/22': {
    title: 'Cristo crucificado',
    artist: 'Diego Velázquez',
    year: 'c. 1632',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Cristo_crucificado.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Cristo_crucificado.jpg',
  },
  'PSA/23': {
    title: 'El Buen Pastor',
    artist: 'Bernhard Plockhorst',
    year: 's. XIX',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/a7/Bernhard_Plockhorst_-_Good_Shephard.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bernhard_Plockhorst_-_Good_Shephard.jpg',
  },
  'PSA/91': {
    title: 'El ángel de la guarda',
    artist: 'Bernhard Plockhorst',
    year: 's. XIX',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/1/1e/Bernhard_Plockhorst_-_Schutzengel.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bernhard_Plockhorst_-_Schutzengel.jpg',
  },
  'MAT/6': {
    title: 'El Sermón del Monte',
    artist: 'Carl Bloch',
    year: '1877',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Bloch-SermonOnTheMount.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bloch-SermonOnTheMount.jpg',
  },
  'MRK/4': {
    title: 'Cristo en la tormenta del mar de Galilea',
    artist: 'Rembrandt',
    year: '1633',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/f/f3/Rembrandt_Christ_in_the_Storm_on_the_Lake_of_Galilee.jpg',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Rembrandt_Christ_in_the_Storm_on_the_Lake_of_Galilee.jpg',
  },
  'LUK/12': {
    title: 'La parábola del rico insensato',
    artist: 'Rembrandt',
    year: '1627',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/a1/Rembrandt_-_The_Parable_of_the_Rich_Fool.jpg',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Rembrandt_-_The_Parable_of_the_Rich_Fool.jpg',
  },
  'LUK/15': {
    title: 'El regreso del hijo pródigo',
    artist: 'Rembrandt',
    year: 'c. 1668',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/93/Rembrandt_Harmensz_van_Rijn_-_Return_of_the_Prodigal_Son_-_Google_Art_Project.jpg',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Rembrandt_Harmensz_van_Rijn_-_Return_of_the_Prodigal_Son_-_Google_Art_Project.jpg',
  },
  'JHN/13': {
    title: 'Jesús lavando los pies de Pedro',
    artist: 'Ford Madox Brown',
    year: '1852-1856',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Madox-Brown-Christ-washing-Peter%27s-feet.jpg',
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Madox-Brown-Christ-washing-Peter's-feet.jpg",
  },
  'JHN/20': {
    title: 'La incredulidad de Santo Tomás',
    artist: 'Caravaggio',
    year: '1601-1602',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/e/e5/The_Incredulity_of_Saint_Thomas-Caravaggio_%281601-2%29.jpg',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:The_Incredulity_of_Saint_Thomas-Caravaggio_(1601-2).jpg',
  },
  '1CO/13': {
    title: 'La Caridad',
    artist: 'William-Adolphe Bouguereau',
    year: '1878',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/1/10/William-Adolphe_Bouguereau_%281825-1905%29_-_Charity_%281878%29.jpg',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:William-Adolphe_Bouguereau_(1825-1905)_-_Charity_(1878).jpg',
  },
  'REV/5': {
    title: 'La Adoración del Cordero Místico',
    artist: 'Jan van Eyck',
    year: '1432',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/0e/Retable_de_l%27Agneau_mystique_%287%29.jpg',
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Retable_de_l'Agneau_mystique_(7).jpg",
  },
  'REV/6': {
    title: 'Los cuatro jinetes del Apocalipsis',
    artist: 'Alberto Durero',
    year: '1498',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/2/29/Durer_Revelation_Four_Riders.jpg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Durer_Revelation_Four_Riders.jpg',
  },
};

export function getChapterArt(
  bookCanonicalId: string,
  chapterNumber: number,
): ChapterArtwork | null {
  return CHAPTER_ART[`${bookCanonicalId.toUpperCase()}/${chapterNumber}`] ?? null;
}

/**
 * URL del thumbnail de Commons a un ancho dado. Los originales pueden pesar
 * decenas de MB; el patrón /thumb/<hash>/<file>/<w>px-<file> sirve derivados
 * ligeros y es estable (lo usa la propia Wikipedia).
 */
export function artThumbUrl(imageUrl: string, width: number): string {
  const prefix = 'https://upload.wikimedia.org/wikipedia/commons/';
  if (!imageUrl.startsWith(prefix)) return imageUrl;
  const rest = imageUrl.slice(prefix.length); // "5/5b/Fichero.jpg"
  const fileName = rest.slice(rest.lastIndexOf('/') + 1);
  return `${prefix}thumb/${rest}/${width}px-${fileName}`;
}
