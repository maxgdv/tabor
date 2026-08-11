// GET /api/chapter-secondary?book=gen&chapter=12&vs=vul&locale=es — texto del
// capítulo en la versión comparada, alineado por versículo.
//
// La página del lector es estática y no puede leer ?vs= en el servidor; el
// cliente pide aquí la segunda columna. Es texto público e inmutable, así que
// la CDN puede cachearlo y las visitas repetidas no invocan la función.

import { NextResponse, type NextRequest } from 'next/server';
import { getSecondaryChapter, versionForLocale } from '@/lib/bible';
import { resolveCompare } from '@/lib/compare';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const book = params.get('book') ?? '';
  const chapter = Number.parseInt(params.get('chapter') ?? '', 10);
  const locale = params.get('locale') === 'en' ? 'en' : 'es';
  const vs = params.get('vs') ?? undefined;

  if (!/^[a-z0-9]{2,4}$/i.test(book) || !Number.isInteger(chapter) || chapter < 1) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  const option = resolveCompare(vs, versionForLocale(locale));
  if (!option) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const secondary = await getSecondaryChapter(book.toUpperCase(), chapter, option);
  if (!secondary) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  // Dominio público y sin variar por usuario: una semana en la CDN.
  return NextResponse.json(secondary, {
    headers: { 'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400' },
  });
}
