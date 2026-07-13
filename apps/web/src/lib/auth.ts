// Configuración del servidor de Better-Auth. Los modelos user/session/
// account/verification se mapean sobre las tablas existentes de @tabor/db
// (app_user y compañía) — ver packages/db/src/schema/user.ts.
//
// Desviaciones de la spec documentadas en docs/SPEC.md: scrypt (default de
// Better-Auth) en lugar de Argon2id, sin verificación de email ni reset de
// contraseña hasta que haya proveedor de email transaccional.

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db, schema } from '@tabor/db';

// Fallback SOLO para que `next build` evalúe el módulo en CI (sin secretos).
// En producción BETTER_AUTH_SECRET es obligatorio (dashboard de Vercel).
const secret = process.env.BETTER_AUTH_SECRET ?? 'tabor-dev-secret-solo-local-y-ci';

export const auth = betterAuth({
  appName: 'Tabor',
  secret,
  baseURL:
    process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
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
    // Sin email transaccional en v1; gancho preparado para cuando exista:
    // requireEmailVerification + sendResetPassword.
    requireEmailVerification: false,
    minPasswordLength: 8,
    autoSignIn: true,
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
