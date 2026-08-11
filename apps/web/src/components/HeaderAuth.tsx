'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { authClient } from '@/lib/auth-client';
import { UserMenu } from './UserMenu';

/**
 * Estado de sesión del header, resuelto en el cliente.
 *
 * Antes el SiteHeader leía la sesión con `headers()` en el servidor, lo que
 * forzaba a renderizar TODAS las páginas por petición (y cada visita o paso
 * de un bot quemaba CPU de funciones en Vercel). Con la sesión en el cliente
 * el HTML es idéntico para todos y las páginas pueden servirse desde la CDN;
 * los bots ni siquiera ejecutan JS, así que no invocan nada.
 */
export function HeaderAuth() {
  const t = useTranslations('header');
  const { data: session, isPending } = authClient.useSession();

  // Mientras se resuelve, un hueco del alto de los controles evita el salto
  // de layout; el avatar o el enlace aparecen en cuanto llega la respuesta.
  if (isPending) {
    return <span aria-hidden="true" className="inline-flex min-h-11 w-11" />;
  }

  return session ? (
    <UserMenu name={session.user.name ?? null} email={session.user.email} />
  ) : (
    <Link
      href="/entrar"
      className="inline-flex min-h-11 items-center rounded-md px-2 font-sans text-sm text-stone-700 transition-colors hover:bg-sand-200 dark:text-sand-100 dark:hover:bg-stone-700"
    >
      {t('signIn')}
    </Link>
  );
}
