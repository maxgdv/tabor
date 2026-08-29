// Configuración del servidor de Better-Auth. Los modelos user/session/
// account/verification se mapean sobre las tablas existentes de @tabor/db
// (app_user y compañía) — ver packages/db/src/schema/user.ts.
//
// Desviaciones de la spec documentadas en docs/SPEC.md: scrypt (default de
// Better-Auth) en lugar de Argon2id, y sin verificación de email (el reset
// de contraseña sí existe, vía Resend — ver sendResetPassword abajo).

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db, schema } from '@tabor/db';
import { sendEmail } from './email';
import { resetPasswordEmail } from './auth-emails';

// Fallback SOLO para que `next build` evalúe el módulo en CI (sin secretos).
// En producción BETTER_AUTH_SECRET es obligatorio (dashboard de Vercel).
const secret = process.env.BETTER_AUTH_SECRET ?? 'tabor-dev-secret-solo-local-y-ci';

// El check CSRF de Better-Auth compara el Origin contra esta URL: debe ser
// el dominio público real. Mismo criterio de fallback que SITE_URL en
// lib/seo.ts (Vercel no define NEXT_PUBLIC_SITE_URL hoy).
const baseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === 'production' ? 'https://proyectotabor.org' : 'http://localhost:3000');

export const auth = betterAuth({
  appName: 'Tabor',
  secret,
  baseURL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.appUser,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    // Verificación de email aún desactivada: exigirla dejaría fuera a las
    // cuentas creadas antes de tener email transaccional.
    requireEmailVerification: false,
    minPasswordLength: 8,
    autoSignIn: true,
    // Recuperación de contraseña vía Resend (lib/email.ts): el enlace lleva
    // a /reset-password/:token de Better-Auth, que redirige al callbackURL
    // (/recuperar) con ?token=. El idioma sale de user.locale.
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      const locale = (user as { locale?: string }).locale;
      const { subject, text } = resetPasswordEmail(locale, url);
      await sendEmail({ to: user.email, subject, text });
    },
  },
  user: {
    // RGPD RF-CUE-04: borrado de cuenta; la cascada de BD elimina sesiones,
    // credenciales y marcadores. donation queda con user_id NULL (correcto).
    deleteUser: { enabled: true },
    additionalFields: {
      locale: { type: 'string', required: false, defaultValue: 'es', input: true },
    },
  },
  session: {
    // Cachea la sesión en cookie firmada 5 min: el getSession del SiteHeader
    // no golpea la BD en cada request. Coste: revocación diferida ≤5 min.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  advanced: {
    // La BD genera los uuid (gen_random_uuid), como el resto del esquema —
    // así session.user_id y bookmark.user_id comparten tipo con app_user.id.
    database: { generateId: false },
  },
  // Debe ser el último plugin: propaga las cookies en Server Actions.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
