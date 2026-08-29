// Envío de email transaccional vía Resend (https://resend.com). Sin SDK:
// la API es un POST y así no arrastramos dependencia. Sin RESEND_API_KEY
// (local, CI) el email se vuelca a consola — el flujo de recuperación se
// puede probar copiando el enlace del log.

const FROM = process.env.EMAIL_FROM ?? 'Proyecto Tabor <no-reply@proyectotabor.org>';

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email] (sin RESEND_API_KEY) Para: ${opts.to}\nAsunto: ${opts.subject}\n${opts.text}`);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, text: opts.text }),
  });
  if (!res.ok) {
    // El cuerpo de error de Resend no lleva secretos; al log para diagnóstico.
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}
