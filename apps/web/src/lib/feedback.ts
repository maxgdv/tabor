// Buzón de comentarios y preguntas: validación del cuerpo de POST
// /api/feedback y texto del aviso por email al promotor. Funciones puras
// (sin React ni BD) — las comparten route y tests.

export const FEEDBACK_MAX_LENGTH = 5000;
export const FEEDBACK_EMAIL_MAX = 254; // límite práctico de una dirección (RFC 5321)
export const FEEDBACK_PATH_MAX = 300;
// Tope de avisos por email en una hora. La API no limita envíos: sin él, un
// bot inundaría el correo y agotaría la cuota de Resend, que comparte la
// recuperación de contraseña. Pasado el tope los mensajes se guardan igual.
export const FEEDBACK_NOTIFY_MAX_PER_HOUR = 20;

export type FeedbackBody = {
  body: string;
  /** Contacto opcional del remitente; `null` si no lo dio. */
  email: string | null;
  /** Ruta interna desde la que llegó al formulario; `null` si no se conoce. */
  fromPath: string | null;
};

// Suficiente para descartar basura evidente; la dirección no se verifica.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * `null` si el cuerpo no es válido. El campo `website` es un honeypot: no
 * existe en el formulario visible, así que cualquier valor delata a un bot
 * y el envío se rechaza.
 */
export function parseFeedbackBody(data: unknown): FeedbackBody | null {
  if (typeof data !== 'object' || data === null) return null;
  const { body, email, fromPath, website } = data as Record<string, unknown>;

  if (typeof website === 'string' && website.length > 0) return null;

  if (typeof body !== 'string') return null;
  const trimmedBody = body.trim();
  if (trimmedBody.length === 0 || trimmedBody.length > FEEDBACK_MAX_LENGTH) return null;

  let parsedEmail: string | null = null;
  if (email != null) {
    if (typeof email !== 'string') return null;
    const trimmed = email.trim();
    if (trimmed.length > 0) {
      if (trimmed.length > FEEDBACK_EMAIL_MAX || !EMAIL_SHAPE.test(trimmed)) return null;
      parsedEmail = trimmed;
    }
  }

  // Solo rutas internas ('/es/leer/...'); cualquier otra cosa se descarta en
  // silencio — es contexto auxiliar, no motivo para rechazar el mensaje.
  let parsedPath: string | null = null;
  if (
    typeof fromPath === 'string' &&
    fromPath.startsWith('/') &&
    !fromPath.startsWith('//') &&
    fromPath.length <= FEEDBACK_PATH_MAX
  ) {
    parsedPath = fromPath;
  }

  return { body: trimmedBody, email: parsedEmail, fromPath: parsedPath };
}

const SUBJECT_SNIPPET_MAX = 60;

/**
 * Aviso al promotor de que ha llegado un mensaje. Solo en español: es para
 * uso interno, no para el lector. `contactEmail` es el email de la cuenta o
 * el que dejó el remitente; si lo hay, la route lo pone como Reply-To para
 * contestar desde el propio cliente de correo.
 */
export function feedbackNotificationEmail(opts: {
  body: string;
  contactEmail: string | null;
  withAccount: boolean;
  fromPath: string | null;
  siteUrl: string;
}): { subject: string; text: string } {
  const oneLine = opts.body.replace(/\s+/g, ' ');
  let snippet = oneLine;
  if (oneLine.length > SUBJECT_SNIPPET_MAX) {
    // Corta en el último espacio para no partir palabras (si lo hay).
    const cut = oneLine.slice(0, SUBJECT_SNIPPET_MAX);
    const lastSpace = cut.lastIndexOf(' ');
    snippet = `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
  }

  const from = opts.contactEmail
    ? `${opts.contactEmail}${opts.withAccount ? ' (con cuenta)' : ''}`
    : 'anónimo, sin email de contacto';
  const page = opts.fromPath ? `${opts.siteUrl}${opts.fromPath}` : 'desconocida';
  const reply = opts.contactEmail
    ? 'Responde a este correo para contestar al remitente.'
    : 'No se puede responder: el remitente no dejó email.';

  return {
    subject: `Buzón de Proyecto Tabor: «${snippet}»`,
    text: `Nuevo mensaje en el buzón de Proyecto Tabor.\n\nDe: ${from}\nDesde: ${page}\n\n---\n${opts.body}\n---\n\n${reply}`,
  };
}
