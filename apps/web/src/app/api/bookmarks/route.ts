// POST /api/bookmarks — marca o desmarca un versículo del usuario con sesión.
// Body: { book: 'gen', chapter: 3, verse: 15 } → { bookmarked: boolean }

import { NextResponse, type NextRequest } from 'next/server';
import { toggleBookmark } from '@tabor/db';
import { auth } from '@/lib/auth';

type ToggleBody = {
  book: string;
  chapter: number;
  verse: number;
};

function parseBody(data: unknown): ToggleBody | null {
  if (typeof data !== 'object' || data === null) return null;
  const { book, chapter, verse } = data as Record<string, unknown>;
  if (typeof book !== 'string' || !/^[a-z0-9]{2,4}$/i.test(book)) return null;
  if (typeof chapter !== 'number' || !Number.isInteger(chapter) || chapter < 1) return null;
  if (typeof verse !== 'number' || !Number.isInteger(verse) || verse < 1) return null;
  return { book, chapter, verse };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = parseBody(await request.json().catch(() => null));
  if (!body) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const result = await toggleBookmark({
    userId: session.user.id,
    bookCanonicalId: body.book.toUpperCase(),
    chapterNumber: body.chapter,
    verseNumber: body.verse,
  });
  if (!result) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json(result);
}
