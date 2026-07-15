// POST /api/highlights — resalta un rango contiguo de versículos con un color
// de la paleta y etiqueta opcional, o quita el resaltado (color: null).
// Body: { book, chapter, start, end, color, label? } — `verse` (v1) sigue
// aceptándose como alias de start = end.

import { NextResponse, type NextRequest } from 'next/server';
import { setHighlightRange } from '@tabor/db';
import { auth } from '@/lib/auth';
import { parseHighlightBody } from '@/lib/annotations';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = parseHighlightBody(await request.json().catch(() => null));
  if (!body) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const result = await setHighlightRange({
    userId: session.user.id,
    bookCanonicalId: body.book.toUpperCase(),
    chapterNumber: body.chapter,
    startVerse: body.start,
    endVerse: body.end,
    color: body.color,
    label: body.label,
  });
  if (!result) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json(result);
}
