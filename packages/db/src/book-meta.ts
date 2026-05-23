// Metadatos de los 73 libros del canon católico.
// Fuente de verdad para:
//  - mapear el nombre de libro de las fuentes scrollmapper -> canonicalId interno
//  - poblar book_translation con nombres y abreviaturas localizados
//
// El orden de este array NO importa: el importador casa por `source` (nombre
// exacto del libro tal como aparece en los JSON de scrollmapper). Los libros
// fuera del canon católico (Oración de Manasés, 1-2 Esdras apócrifos, Salmo 151,
// Laodicenses) simplemente no figuran aquí y el importador los descarta.

export type BookMeta = {
  canonicalId: string; // 'GEN', '1SA', 'REV', ... (coincide con book.canonical_id)
  source: string; // nombre del libro en los JSON de scrollmapper (SpaPlatense / CPDV)
  es: { name: string; short: string };
  en: { name: string; short: string };
};

export const BOOK_META: BookMeta[] = [
  // --- Pentateuco ---
  { canonicalId: 'GEN', source: 'Genesis', es: { name: 'Génesis', short: 'Gn' }, en: { name: 'Genesis', short: 'Gen' } },
  { canonicalId: 'EXO', source: 'Exodus', es: { name: 'Éxodo', short: 'Ex' }, en: { name: 'Exodus', short: 'Exod' } },
  { canonicalId: 'LEV', source: 'Leviticus', es: { name: 'Levítico', short: 'Lv' }, en: { name: 'Leviticus', short: 'Lev' } },
  { canonicalId: 'NUM', source: 'Numbers', es: { name: 'Números', short: 'Nm' }, en: { name: 'Numbers', short: 'Num' } },
  { canonicalId: 'DEU', source: 'Deuteronomy', es: { name: 'Deuteronomio', short: 'Dt' }, en: { name: 'Deuteronomy', short: 'Deut' } },
  // --- Históricos ---
  { canonicalId: 'JOS', source: 'Joshua', es: { name: 'Josué', short: 'Jos' }, en: { name: 'Joshua', short: 'Josh' } },
  { canonicalId: 'JDG', source: 'Judges', es: { name: 'Jueces', short: 'Jue' }, en: { name: 'Judges', short: 'Judg' } },
  { canonicalId: 'RUT', source: 'Ruth', es: { name: 'Rut', short: 'Rt' }, en: { name: 'Ruth', short: 'Ruth' } },
  { canonicalId: '1SA', source: 'I Samuel', es: { name: '1 Samuel', short: '1 S' }, en: { name: '1 Samuel', short: '1 Sam' } },
  { canonicalId: '2SA', source: 'II Samuel', es: { name: '2 Samuel', short: '2 S' }, en: { name: '2 Samuel', short: '2 Sam' } },
  { canonicalId: '1KI', source: 'I Kings', es: { name: '1 Reyes', short: '1 R' }, en: { name: '1 Kings', short: '1 Kgs' } },
  { canonicalId: '2KI', source: 'II Kings', es: { name: '2 Reyes', short: '2 R' }, en: { name: '2 Kings', short: '2 Kgs' } },
  { canonicalId: '1CH', source: 'I Chronicles', es: { name: '1 Crónicas', short: '1 Cr' }, en: { name: '1 Chronicles', short: '1 Chr' } },
  { canonicalId: '2CH', source: 'II Chronicles', es: { name: '2 Crónicas', short: '2 Cr' }, en: { name: '2 Chronicles', short: '2 Chr' } },
  { canonicalId: 'EZR', source: 'Ezra', es: { name: 'Esdras', short: 'Esd' }, en: { name: 'Ezra', short: 'Ezra' } },
  { canonicalId: 'NEH', source: 'Nehemiah', es: { name: 'Nehemías', short: 'Neh' }, en: { name: 'Nehemiah', short: 'Neh' } },
  { canonicalId: 'TOB', source: 'Tobit', es: { name: 'Tobías', short: 'Tb' }, en: { name: 'Tobit', short: 'Tob' } },
  { canonicalId: 'JDT', source: 'Judith', es: { name: 'Judit', short: 'Jdt' }, en: { name: 'Judith', short: 'Jdt' } },
  { canonicalId: 'EST', source: 'Esther', es: { name: 'Ester', short: 'Est' }, en: { name: 'Esther', short: 'Esth' } },
  { canonicalId: '1MA', source: 'I Maccabees', es: { name: '1 Macabeos', short: '1 M' }, en: { name: '1 Maccabees', short: '1 Macc' } },
  { canonicalId: '2MA', source: 'II Maccabees', es: { name: '2 Macabeos', short: '2 M' }, en: { name: '2 Maccabees', short: '2 Macc' } },
  // --- Sapienciales ---
  { canonicalId: 'JOB', source: 'Job', es: { name: 'Job', short: 'Jb' }, en: { name: 'Job', short: 'Job' } },
  { canonicalId: 'PSA', source: 'Psalms', es: { name: 'Salmos', short: 'Sal' }, en: { name: 'Psalms', short: 'Ps' } },
  { canonicalId: 'PRO', source: 'Proverbs', es: { name: 'Proverbios', short: 'Pr' }, en: { name: 'Proverbs', short: 'Prov' } },
  { canonicalId: 'ECC', source: 'Ecclesiastes', es: { name: 'Eclesiastés', short: 'Qo' }, en: { name: 'Ecclesiastes', short: 'Eccl' } },
  { canonicalId: 'SNG', source: 'Song of Solomon', es: { name: 'Cantar de los Cantares', short: 'Ct' }, en: { name: 'Song of Songs', short: 'Song' } },
  { canonicalId: 'WIS', source: 'Wisdom', es: { name: 'Sabiduría', short: 'Sab' }, en: { name: 'Wisdom', short: 'Wis' } },
  { canonicalId: 'SIR', source: 'Sirach', es: { name: 'Eclesiástico', short: 'Eclo' }, en: { name: 'Sirach', short: 'Sir' } },
  // --- Proféticos ---
  { canonicalId: 'ISA', source: 'Isaiah', es: { name: 'Isaías', short: 'Is' }, en: { name: 'Isaiah', short: 'Isa' } },
  { canonicalId: 'JER', source: 'Jeremiah', es: { name: 'Jeremías', short: 'Jr' }, en: { name: 'Jeremiah', short: 'Jer' } },
  { canonicalId: 'LAM', source: 'Lamentations', es: { name: 'Lamentaciones', short: 'Lm' }, en: { name: 'Lamentations', short: 'Lam' } },
  { canonicalId: 'BAR', source: 'Baruch', es: { name: 'Baruc', short: 'Ba' }, en: { name: 'Baruch', short: 'Bar' } },
  { canonicalId: 'EZK', source: 'Ezekiel', es: { name: 'Ezequiel', short: 'Ez' }, en: { name: 'Ezekiel', short: 'Ezek' } },
  { canonicalId: 'DAN', source: 'Daniel', es: { name: 'Daniel', short: 'Dn' }, en: { name: 'Daniel', short: 'Dan' } },
  { canonicalId: 'HOS', source: 'Hosea', es: { name: 'Oseas', short: 'Os' }, en: { name: 'Hosea', short: 'Hos' } },
  { canonicalId: 'JOL', source: 'Joel', es: { name: 'Joel', short: 'Jl' }, en: { name: 'Joel', short: 'Joel' } },
  { canonicalId: 'AMO', source: 'Amos', es: { name: 'Amós', short: 'Am' }, en: { name: 'Amos', short: 'Amos' } },
  { canonicalId: 'OBA', source: 'Obadiah', es: { name: 'Abdías', short: 'Ab' }, en: { name: 'Obadiah', short: 'Obad' } },
  { canonicalId: 'JON', source: 'Jonah', es: { name: 'Jonás', short: 'Jon' }, en: { name: 'Jonah', short: 'Jonah' } },
  { canonicalId: 'MIC', source: 'Micah', es: { name: 'Miqueas', short: 'Mi' }, en: { name: 'Micah', short: 'Mic' } },
  { canonicalId: 'NAM', source: 'Nahum', es: { name: 'Nahúm', short: 'Na' }, en: { name: 'Nahum', short: 'Nah' } },
  { canonicalId: 'HAB', source: 'Habakkuk', es: { name: 'Habacuc', short: 'Ha' }, en: { name: 'Habakkuk', short: 'Hab' } },
  { canonicalId: 'ZEP', source: 'Zephaniah', es: { name: 'Sofonías', short: 'So' }, en: { name: 'Zephaniah', short: 'Zeph' } },
  { canonicalId: 'HAG', source: 'Haggai', es: { name: 'Ageo', short: 'Ag' }, en: { name: 'Haggai', short: 'Hag' } },
  { canonicalId: 'ZEC', source: 'Zechariah', es: { name: 'Zacarías', short: 'Za' }, en: { name: 'Zechariah', short: 'Zech' } },
  { canonicalId: 'MAL', source: 'Malachi', es: { name: 'Malaquías', short: 'Ml' }, en: { name: 'Malachi', short: 'Mal' } },
  // --- Evangelios y Hechos ---
  { canonicalId: 'MAT', source: 'Matthew', es: { name: 'Mateo', short: 'Mt' }, en: { name: 'Matthew', short: 'Matt' } },
  { canonicalId: 'MRK', source: 'Mark', es: { name: 'Marcos', short: 'Mc' }, en: { name: 'Mark', short: 'Mark' } },
  { canonicalId: 'LUK', source: 'Luke', es: { name: 'Lucas', short: 'Lc' }, en: { name: 'Luke', short: 'Luke' } },
  { canonicalId: 'JHN', source: 'John', es: { name: 'Juan', short: 'Jn' }, en: { name: 'John', short: 'John' } },
  { canonicalId: 'ACT', source: 'Acts', es: { name: 'Hechos de los Apóstoles', short: 'Hch' }, en: { name: 'Acts', short: 'Acts' } },
  // --- Cartas paulinas ---
  { canonicalId: 'ROM', source: 'Romans', es: { name: 'Romanos', short: 'Rm' }, en: { name: 'Romans', short: 'Rom' } },
  { canonicalId: '1CO', source: 'I Corinthians', es: { name: '1 Corintios', short: '1 Co' }, en: { name: '1 Corinthians', short: '1 Cor' } },
  { canonicalId: '2CO', source: 'II Corinthians', es: { name: '2 Corintios', short: '2 Co' }, en: { name: '2 Corinthians', short: '2 Cor' } },
  { canonicalId: 'GAL', source: 'Galatians', es: { name: 'Gálatas', short: 'Ga' }, en: { name: 'Galatians', short: 'Gal' } },
  { canonicalId: 'EPH', source: 'Ephesians', es: { name: 'Efesios', short: 'Ef' }, en: { name: 'Ephesians', short: 'Eph' } },
  { canonicalId: 'PHP', source: 'Philippians', es: { name: 'Filipenses', short: 'Flp' }, en: { name: 'Philippians', short: 'Phil' } },
  { canonicalId: 'COL', source: 'Colossians', es: { name: 'Colosenses', short: 'Col' }, en: { name: 'Colossians', short: 'Col' } },
  { canonicalId: '1TH', source: 'I Thessalonians', es: { name: '1 Tesalonicenses', short: '1 Ts' }, en: { name: '1 Thessalonians', short: '1 Thess' } },
  { canonicalId: '2TH', source: 'II Thessalonians', es: { name: '2 Tesalonicenses', short: '2 Ts' }, en: { name: '2 Thessalonians', short: '2 Thess' } },
  { canonicalId: '1TI', source: 'I Timothy', es: { name: '1 Timoteo', short: '1 Tm' }, en: { name: '1 Timothy', short: '1 Tim' } },
  { canonicalId: '2TI', source: 'II Timothy', es: { name: '2 Timoteo', short: '2 Tm' }, en: { name: '2 Timothy', short: '2 Tim' } },
  { canonicalId: 'TIT', source: 'Titus', es: { name: 'Tito', short: 'Tt' }, en: { name: 'Titus', short: 'Titus' } },
  { canonicalId: 'PHM', source: 'Philemon', es: { name: 'Filemón', short: 'Flm' }, en: { name: 'Philemon', short: 'Phlm' } },
  { canonicalId: 'HEB', source: 'Hebrews', es: { name: 'Hebreos', short: 'Hb' }, en: { name: 'Hebrews', short: 'Heb' } },
  // --- Cartas católicas y Apocalipsis ---
  { canonicalId: 'JAS', source: 'James', es: { name: 'Santiago', short: 'St' }, en: { name: 'James', short: 'Jas' } },
  { canonicalId: '1PE', source: 'I Peter', es: { name: '1 Pedro', short: '1 P' }, en: { name: '1 Peter', short: '1 Pet' } },
  { canonicalId: '2PE', source: 'II Peter', es: { name: '2 Pedro', short: '2 P' }, en: { name: '2 Peter', short: '2 Pet' } },
  { canonicalId: '1JN', source: 'I John', es: { name: '1 Juan', short: '1 Jn' }, en: { name: '1 John', short: '1 John' } },
  { canonicalId: '2JN', source: 'II John', es: { name: '2 Juan', short: '2 Jn' }, en: { name: '2 John', short: '2 John' } },
  { canonicalId: '3JN', source: 'III John', es: { name: '3 Juan', short: '3 Jn' }, en: { name: '3 John', short: '3 John' } },
  { canonicalId: 'JUD', source: 'Jude', es: { name: 'Judas', short: 'Jds' }, en: { name: 'Jude', short: 'Jude' } },
  { canonicalId: 'REV', source: 'Revelation of John', es: { name: 'Apocalipsis', short: 'Ap' }, en: { name: 'Revelation', short: 'Rev' } },
];

// Índice nombre-de-fuente -> metadatos, para casar libros durante la importación.
export const BOOK_META_BY_SOURCE: ReadonlyMap<string, BookMeta> = new Map(
  BOOK_META.map((m) => [m.source, m]),
);
