'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { authClient } from '@/lib/auth-client';
import { PasswordInput } from './PasswordInput';

/**
 * Recuperación de contraseña en dos tiempos sobre la misma página:
 * sin ?token= pide el email y envía el enlace; con ?token= (a donde
 * redirige el /reset-password/:token de Better-Auth) pide la contraseña
 * nueva. La respuesta al envío es genérica a propósito: no revela si el
 * email tiene cuenta.
 */
export function PasswordResetForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const token = useSearchParams().get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  const requestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `/${locale}/recuperar`,
    });
    setStatus(error ? 'error' : 'done');
  };

  const saveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting' || !token) return;
    setStatus('submitting');
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setStatus(error ? 'error' : 'done');
  };

  const inputClass =
    'w-full rounded-md border border-sand-200 bg-white/70 px-3 py-2 font-sans text-sm text-stone-800 placeholder:text-stone-500 focus:border-lapis-500 focus:outline-none focus:ring-1 focus:ring-lapis-500 dark:border-stone-700 dark:bg-stone-800/70 dark:text-sand-100 dark:placeholder:text-stone-400';
  const cardClass =
    'mx-auto w-full max-w-sm space-y-4 rounded-lg border border-sand-200 bg-white/60 p-6 dark:border-stone-700 dark:bg-stone-800/60';
  const buttonClass =
    'w-full rounded-md bg-lapis-500 px-4 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-lapis-600 disabled:opacity-60';

  if (status === 'done') {
    return (
      <div className={cardClass}>
        <p className="font-sans text-sm text-stone-700 dark:text-sand-200">
          {t(token ? 'resetDone' : 'resetLinkSent')}
        </p>
        {token && (
          <Link
            href="/entrar"
            className="block text-center font-sans text-sm text-lapis-500 underline-offset-2 hover:underline"
          >
            {t('resetBackToSignIn')}
          </Link>
        )}
      </div>
    );
  }

  if (token) {
    return (
      <form onSubmit={saveNewPassword} className={cardClass}>
        <label className="block">
          <span className="mb-1 block font-sans text-xs font-medium text-stone-600 dark:text-sand-200">
            {t('resetNewPasswordLabel')}
          </span>
          <PasswordInput
            required
            minLength={8}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
          <span className="mt-1 block font-sans text-xs text-stone-500 dark:text-stone-400">
            {t('passwordHint')}
          </span>
        </label>
        {status === 'error' && (
          <p role="alert" className="font-sans text-sm text-red-700 dark:text-red-400">
            {t('resetTokenError')}
          </p>
        )}
        <button type="submit" disabled={status === 'submitting'} className={buttonClass}>
          {status === 'submitting' ? t('submitting') : t('resetSubmitNew')}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={requestLink} className={cardClass}>
      <label className="block">
        <span className="mb-1 block font-sans text-xs font-medium text-stone-600 dark:text-sand-200">
          {t('emailLabel')}
        </span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className={inputClass}
        />
      </label>
      {status === 'error' && (
        <p role="alert" className="font-sans text-sm text-red-700 dark:text-red-400">
          {t('errors.generic')}
        </p>
      )}
      <button type="submit" disabled={status === 'submitting'} className={buttonClass}>
        {status === 'submitting' ? t('submitting') : t('resetSubmitRequest')}
      </button>
    </form>
  );
}
