// Todas las rutas de Better-Auth (/api/auth/*). El middleware de i18n
// (src/proxy.ts) ya excluye /api, así que no interfiere.
import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth';

export const { GET, POST } = toNextJsHandler(auth);
