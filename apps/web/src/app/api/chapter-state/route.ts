// GET /api/chapter-state?book=gen&chapter=3 — estado personal del capítulo
// (versículos marcados + resaltados y notas) del usuario con sesión.
//
// Existe para que la página del lector pueda ser estática/CDN: el HTML es el
// mismo para todos y lo personal llega por aquí tras hidratar. Solo la llama
// el cliente cuando ya sabe que hay sesión, así que un 401 es excepcional.

import { NextResponse, type NextRequest } from 'next/server';
import { getBookmarkedVerseNumbers, getChapterAnnotations } from '@tabor/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const book = request.nextUrl.searchParams.get('book') ?? '';
  const chapter = Number.parseInt(request.nextUrl.searchParams.get('chapter') ?? '', 10);
  if (!/^[a-z0-9]{2,4}$/i.test(book) || !Number.isInteger(chapter) || chapter < 1) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const [bookmarks, annotations] = await Promise.all([
    getBookmarkedVerseNumbers({
      userId: session.user.id,
      bookCanonicalId: book.toUpperCase(),
      chapterNumber: chapter,
    }),
    getChapterAnnotations({
      userId: session.user.id,
      bookCanonicalId: book.toUpperCase(),
      chapterNumber: chapter,
    }),
  ]);

  // Datos personales: nunca en caché compartida.
  return NextResponse.json(
    { bookmarks, annotations },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
