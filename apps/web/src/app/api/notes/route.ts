// POST /api/notes — guarda la nota de un versículo (upsert) o la borra
// (body: null). Body: { book, chapter, verse, body }.

import { NextResponse, type NextRequest } from 'next/server';
import { setNote } from '@tabor/db';
import { auth } from '@/lib/auth';
import { parseNoteBody } from '@/lib/annotations';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = parseNoteBody(await request.json().catch(() => null));
  if (!body) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const result = await setNote({
    userId: session.user.id,
    bookCanonicalId: body.book.toUpperCase(),
    chapterNumber: body.chapter,
    verseNumber: body.verse,
    body: body.body,
  });
  if (!result) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json(result);
}
