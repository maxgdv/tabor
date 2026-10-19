// POST /api/feedback — guarda un mensaje del buzón de comentarios y
// preguntas. No exige sesión: si la hay se asocia al usuario; si no, el
// email opcional del cuerpo sirve de contacto. Nada de esto es público.
//
// Con FEEDBACK_NOTIFY_EMAIL definido, avisa además por email al promotor.
// El envío va en after(): no retrasa la respuesta, y si Resend falla el
// mensaje ya está guardado — solo se pierde el aviso (queda en el log).
// Con más de FEEDBACK_NOTIFY_MAX_PER_HOUR mensajes en la última hora no se
// avisa: el exceso solo se ve en la tabla.

import { after, NextResponse, type NextRequest } from 'next/server';
import { countFeedbackSince, createFeedback } from '@tabor/db';
import { auth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import {
  FEEDBACK_NOTIFY_MAX_PER_HOUR,
  feedbackNotificationEmail,
  parseFeedbackBody,
} from '@/lib/feedback';
import { SITE_URL } from '@/lib/seo';

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

  const notifyTo = process.env.FEEDBACK_NOTIFY_EMAIL;
  if (notifyTo) {
    const contactEmail = session ? session.user.email : body.email;
    const { subject, text } = feedbackNotificationEmail({
      body: body.body,
      contactEmail,
      withAccount: session != null,
      fromPath: body.fromPath,
      siteUrl: SITE_URL,
    });
    after(async () => {
      try {
        // Incluye el mensaje recién guardado.
        const lastHour = await countFeedbackSince(new Date(Date.now() - 60 * 60 * 1000));
        if (lastHour > FEEDBACK_NOTIFY_MAX_PER_HOUR) {
          console.warn(`[feedback] ${lastHour} mensajes en la última hora: aviso por email omitido`);
          return;
        }
        await sendEmail({ to: notifyTo, subject, text, replyTo: contactEmail ?? undefined });
      } catch (err) {
        console.error('[feedback] no se pudo enviar el aviso por email', err);
      }
    });
  }

  return NextResponse.json({ ok: true });
}
