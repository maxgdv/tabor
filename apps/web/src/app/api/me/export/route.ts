// GET /api/me/export?format=json|md&locale=es|en — descarga de todos los
// datos personales del usuario (RGPD §16.4: portabilidad).

import { NextResponse, type NextRequest } from 'next/server';
import { getPlanProgress, listBookmarks, listHighlights, listNotes } from '@tabor/db';
import { auth } from '@/lib/auth';
import { versionForLocale } from '@/lib/bible';
import { buildExportJson, buildExportMarkdown, exportFilename } from '@/lib/export';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const format = request.nextUrl.searchParams.get('format') ?? 'json';
  if (format !== 'json' && format !== 'md') {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const locale = request.nextUrl.searchParams.get('locale') === 'en' ? 'en' : 'es';
  const versionCode = versionForLocale(locale);
  const userId = session.user.id;

  const [bookmarks, highlights, notes, planProgress] = await Promise.all([
    listBookmarks({ userId, versionCode }),
    listHighlights({ userId, versionCode }),
    listNotes({ userId, versionCode }),
    getPlanProgress({ userId }),
  ]);

  const data = {
    exportedAt: new Date(),
    user: {
      email: session.user.email,
      name: session.user.name ?? null,
      createdAt: new Date(session.user.createdAt),
    },
    bookmarks,
    highlights,
    notes,
    planProgress,
  };

  const body = format === 'json' ? buildExportJson(data) : buildExportMarkdown(data);
  return new NextResponse(body, {
    headers: {
      'Content-Type':
        format === 'json' ? 'application/json; charset=utf-8' : 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${exportFilename(format, data.exportedAt)}"`,
    },
  });
}
