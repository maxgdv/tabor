// POST /api/highlights — resalta un versículo con un color de la paleta o
// quita el resaltado (color: null). Body: { book, chapter, verse, color }.

import { NextResponse, type NextRequest } from 'next/server';
import { setHighlight } from '@tabor/db';
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

  const result = await setHighlight({
    userId: session.user.id,
    bookCanonicalId: body.book.toUpperCase(),
    chapterNumber: body.chapter,
    verseNumber: body.verse,
    color: body.color,
  });
  if (!result) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json(result);
}
