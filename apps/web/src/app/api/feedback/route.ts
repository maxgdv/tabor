// POST /api/feedback — guarda un mensaje del buzón de comentarios y
// preguntas. No exige sesión: si la hay se asocia al usuario; si no, el
// email opcional del cuerpo sirve de contacto. Nada de esto es público.

import { NextResponse, type NextRequest } from 'next/server';
import { createFeedback } from '@tabor/db';
import { auth } from '@/lib/auth';
import { parseFeedbackBody } from '@/lib/feedback';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = parseFeedbackBody(await request.json().catch(() => null));
  if (!body) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: request.headers });

  await createFeedback({
    userId: session?.user.id ?? null,
    // Con sesión, el contacto ya es el email de la cuenta.
    email: session ? null : body.email,
    fromPath: body.fromPath,
    body: body.body,
  });
  return NextResponse.json({ ok: true });
}
