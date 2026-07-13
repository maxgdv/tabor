'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { authClient } from '@/lib/auth-client';
import { authErrorKey } from '@/lib/auth-errors';

/** Cerrar sesión + zona de peligro (borrado RGPD con confirmación doble). */
export function AccountActions() {
  const t = useTranslations('auth');
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    await authClient.signOut();
    router.push('/');
    router.refresh();
  };

  const deleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErrorKey(null);
    try {
      const { error } = await authClient.deleteUser({ password });
      if (error) {
        setErrorKey(authErrorKey(error.code));
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setErrorKey('errors.generic');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-10">
      <button
        type="button"
        onClick={signOut}
        className="rounded-md border border-stone-300 px-4 py-2 font-sans text-sm text-stone-700 transition-colors hover:border-lapis-500 hover:text-lapis-600 dark:border-stone-600 dark:text-sand-100"
      >
        {t('signOut')}
      </button>

      <section className="rounded-lg border border-red-200 bg-red-50/50 p-5 dark:border-red-900/50 dark:bg-red-950/20">
        <h2 className="font-sans text-sm font-semibold text-red-800 dark:text-red-300">
          {t('dangerTitle')}
        </h2>
        <p className="mt-2 text-sm text-stone-600 dark:text-sand-200">{t('deleteWarning')}</p>

        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-4 rounded-md border border-red-300 px-4 py-2 font-sans text-sm text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            {t('deleteButton')}
          </button>
        ) : (
          <form onSubmit={deleteAccount} className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1 block font-sans text-xs font-medium text-stone-600 dark:text-sand-200">
                {t('deletePasswordLabel')}
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full max-w-xs rounded-md border border-sand-200 bg-white px-3 py-2 font-sans text-sm text-stone-800 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-stone-700 dark:bg-stone-800 dark:text-sand-100"
              />
            </label>
            {errorKey && (
              <p role="alert" className="font-sans text-sm text-red-700 dark:text-red-400">
                {t(errorKey)}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-md bg-red-600 px-4 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {busy ? t('submitting') : t('deleteConfirm')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setPassword('');
                  setErrorKey(null);
                }}
                className="rounded-md px-4 py-2 font-sans text-sm text-stone-600 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-stone-800"
              >
                {t('deleteCancel')}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
