import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Aplica el middleware a todas las rutas excepto API, _next y archivos estáticos.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
