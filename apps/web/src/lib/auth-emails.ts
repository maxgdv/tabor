// Textos de los emails de autenticación. Fuera de next-intl a propósito:
// sendResetPassword corre en la config de Better-Auth, sin contexto de
// request, así que el idioma sale de user.locale y no de la URL.

type ResetEmail = { subject: string; text: (url: string) => string };

const RESET_PASSWORD: Record<'es' | 'en', ResetEmail> = {
  es: {
    subject: 'Restablece tu contraseña de Proyecto Tabor',
    text: (url) =>
      `Hola:\n\nAlguien (esperamos que tú) ha pedido restablecer la contraseña de tu cuenta en Proyecto Tabor.\n\nAbre este enlace para elegir una nueva (caduca en 1 hora):\n${url}\n\nSi no lo pediste tú, ignora este mensaje: tu contraseña sigue siendo la misma.\n\n— Proyecto Tabor · proyectotabor.org`,
  },
  en: {
    subject: 'Reset your Tabor Project password',
    text: (url) =>
      `Hello,\n\nSomeone (hopefully you) asked to reset the password of your Tabor Project account.\n\nOpen this link to choose a new one (it expires in 1 hour):\n${url}\n\nIf you didn't request this, just ignore this message — your password is unchanged.\n\n— Tabor Project · proyectotabor.org`,
  },
};

export function resetPasswordEmail(locale: string | undefined, url: string) {
  const t = RESET_PASSWORD[locale === 'en' ? 'en' : 'es'];
  return { subject: t.subject, text: t.text(url) };
}
