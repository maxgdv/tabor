// Constructores del export de datos personales (RGPD §16.4, portabilidad).
// Funciones puras: reciben datos ya consultados y la fecha inyectada, y
// producen strings deterministas — testeables sin BD ni reloj.

import type {
  DbBookmarkListItem,
  DbHighlightListItem,
  DbNoteListItem,
} from '@tabor/db';
import { groupByBook } from './bookmarks';

export type ExportData = {
  exportedAt: Date;
  user: { email: string; name: string | null; createdAt: Date };
  bookmarks: DbBookmarkListItem[];
  highlights: DbHighlightListItem[];
  notes: DbNoteListItem[];
  planProgress: Record<string, number[]>;
};

export function buildExportJson(data: ExportData): string {
  return JSON.stringify(
    {
      exportedAt: data.exportedAt.toISOString(),
      user: {
        email: data.user.email,
        name: data.user.name,
        createdAt: data.user.createdAt.toISOString(),
      },
      bookmarks: data.bookmarks,
      highlights: data.highlights,
      notes: data.notes,
      planProgress: data.planProgress,
    },
    null,
    2,
  );
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildExportMarkdown(data: ExportData): string {
  const lines: string[] = [];
  lines.push('# Tabor — Exportación de datos personales');
  lines.push('');
  lines.push(`- Cuenta: ${data.user.email}`);
  lines.push(`- Exportado: ${isoDate(data.exportedAt)}`);
  lines.push('');

  lines.push('## Marcadores');
  lines.push('');
  for (const group of groupByBook(data.bookmarks)) {
    lines.push(`### ${group.bookName}`);
    lines.push('');
    for (const item of group.items) {
      lines.push(`- **${item.bookName} ${item.chapterNumber}, ${item.verseNumber}**`);
      lines.push(`  > ${item.text}`);
    }
    lines.push('');
  }

  lines.push('## Resaltados');
  lines.push('');
  for (const group of groupByBook(data.highlights)) {
    lines.push(`### ${group.bookName}`);
    lines.push('');
    for (const item of group.items) {
      const ref =
        item.endVerseNumber > item.verseNumber
          ? `${item.verseNumber}-${item.endVerseNumber}`
          : `${item.verseNumber}`;
      const meta = [`color: ${item.color}`, ...(item.label ? [`etiqueta: ${item.label}`] : [])];
      lines.push(`- **${item.bookName} ${item.chapterNumber}, ${ref}** (${meta.join(', ')})`);
      lines.push(`  > ${item.text}${item.endVerseNumber > item.verseNumber ? ' […]' : ''}`);
    }
    lines.push('');
  }

  lines.push('## Notas');
  lines.push('');
  for (const group of groupByBook(data.notes)) {
    lines.push(`### ${group.bookName}`);
    lines.push('');
    for (const item of group.items) {
      lines.push(
        `- **${item.bookName} ${item.chapterNumber}, ${item.verseNumber}** (${isoDate(item.updatedAt)})`,
      );
      lines.push(`  > ${item.text}`);
      lines.push('');
      lines.push(item.body);
      lines.push('');
    }
  }

  lines.push('## Progreso de planes de lectura');
  lines.push('');
  for (const [slug, days] of Object.entries(data.planProgress)) {
    lines.push(`- ${slug}: ${days.length} días completados (${days.map((d) => d + 1).join(', ')})`);
  }
  lines.push('');

  return lines.join('\n');
}

export function exportFilename(format: 'json' | 'md', date: Date): string {
  return `tabor-export-${isoDate(date)}.${format}`;
}
