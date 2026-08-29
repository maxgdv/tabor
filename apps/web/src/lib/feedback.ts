// Buzón de comentarios y preguntas: validación del cuerpo de POST
// /api/feedback. Función pura (sin React ni BD) — la comparten route y tests.

export const FEEDBACK_MAX_LENGTH = 5000;
export const FEEDBACK_EMAIL_MAX = 254; // límite práctico de una dirección (RFC 5321)
export const FEEDBACK_PATH_MAX = 300;

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
