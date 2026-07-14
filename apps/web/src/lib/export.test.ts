import { describe, expect, it } from 'vitest';
import type { DbBookmarkListItem, DbHighlightListItem, DbNoteListItem } from '@tabor/db';
import { buildExportJson, buildExportMarkdown, exportFilename, type ExportData } from './export';

const bookmark = (chapter: number, verse: number): DbBookmarkListItem => ({
  bookCanonicalId: 'GEN',
  bookUrlSegment: 'gen',
  bookName: 'Génesis',
  chapterNumber: chapter,
  verseNumber: verse,
  text: 'texto del versículo',
  createdAt: new Date('2026-07-01T00:00:00Z'),
});

const highlight: DbHighlightListItem = {
  bookCanonicalId: 'MAT',
  bookUrlSegment: 'mat',
  bookName: 'Mateo',
  chapterNumber: 5,
  verseNumber: 3,
  text: 'Bienaventurados los pobres de espíritu',
  color: 'olive',
  label: null,
};

const note: DbNoteListItem = {
  bookCanonicalId: 'JHN',
  bookUrlSegment: 'jhn',
  bookName: 'Juan',
  chapterNumber: 3,
  verseNumber: 16,
  text: 'Porque de tal manera amó Dios al mundo…',
  body: 'línea uno\nlínea dos',
  updatedAt: new Date('2026-07-10T00:00:00Z'),
};

const data: ExportData = {
  exportedAt: new Date('2026-07-14T12:00:00Z'),
  user: { email: 'x@y.z', name: 'X', createdAt: new Date('2026-07-01T00:00:00Z') },
  bookmarks: [bookmark(3, 15), bookmark(12, 1)],
  highlights: [highlight],
  notes: [note],
  planProgress: { 'hechos-14': [0, 1] },
};

const empty: ExportData = {
  exportedAt: new Date('2026-07-14T12:00:00Z'),
  user: { email: 'x@y.z', name: null, createdAt: new Date('2026-07-01T00:00:00Z') },
  bookmarks: [],
  highlights: [],
  notes: [],
  planProgress: {},
};

describe('buildExportJson', () => {
  it('round-trip con las claves de nivel superior y fechas ISO', () => {
    const parsed = JSON.parse(buildExportJson(data)) as Record<string, unknown>;
    expect(Object.keys(parsed).sort()).toEqual([
      'bookmarks',
      'exportedAt',
      'highlights',
      'notes',
      'planProgress',
      'user',
    ]);
    expect(parsed.exportedAt).toBe('2026-07-14T12:00:00.000Z');
    expect((parsed.bookmarks as unknown[]).length).toBe(2);
  });

  it('datos vacíos no rompen', () => {
    const parsed = JSON.parse(buildExportJson(empty)) as Record<string, unknown>;
    expect(parsed.bookmarks).toEqual([]);
    expect(parsed.planProgress).toEqual({});
  });
});

describe('buildExportMarkdown', () => {
  it('contiene las cuatro secciones y agrupa por libro', () => {
    const md = buildExportMarkdown(data);
    expect(md).toContain('## Marcadores');
    expect(md).toContain('## Resaltados');
    expect(md).toContain('## Notas');
    expect(md).toContain('## Progreso de planes de lectura');
    // Dos marcadores del mismo libro → un solo encabezado de Génesis.
    expect(md.match(/### Génesis/g)).toHaveLength(1);
    expect(md).toContain('(color: olive)');
    // Cuerpo multilínea verbatim.
    expect(md).toContain('línea uno\nlínea dos');
    // Días 1-based legibles.
    expect(md).toContain('hechos-14: 2 días completados (1, 2)');
  });

  it('es determinista y no rompe con datos vacíos', () => {
    expect(buildExportMarkdown(data)).toBe(buildExportMarkdown(data));
    const md = buildExportMarkdown(empty);
    expect(md).toContain('## Notas');
  });
});

describe('exportFilename', () => {
  it('formatea nombre con fecha', () => {
    expect(exportFilename('md', new Date('2026-07-14T15:30:00Z'))).toBe(
      'tabor-export-2026-07-14.md',
    );
    expect(exportFilename('json', new Date('2026-01-02T00:00:00Z'))).toBe(
      'tabor-export-2026-01-02.json',
    );
  });
});
