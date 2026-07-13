'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { authClient } from '@/lib/auth-client';
import { authErrorKey } from '@/lib/auth-errors';

type Mode = 'signin' | 'signup';

/**
 * Entrar / Crear cuenta en una sola tarjeta con pestañas. Primer formulario
 * del proyecto: hecho a mano, sin librería — estados simples y errores
 * localizados vía authErrorKey.
 */
export function AuthForm() {
  const t = useTranslations('auth');
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setErrorKey(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrorKey(null);
    try {
      const { error } =
        mode === 'signup'
          ? await authClient.signUp.email({
              // Better-Auth exige `name`; si el usuario no lo da, usamos la
              // parte local del email como nombre visible inicial.
              name: name.trim() || email.split('@')[0] || email,
              email,
              password,
            })
          : await authClient.signIn.email({ email, password });

      if (error) {
        setErrorKey(authErrorKey(error.code));
        return;
      }
      // Los server components re-leen la sesión (header, lector…).
      router.push('/');
      router.refresh();
    } catch {
      setErrorKey('errors.generic');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-md border border-sand-200 bg-white/70 px-3 py-2 font-sans text-sm text-stone-800 placeholder:text-stone-400 focus:border-lapis-500 focus:outline-none focus:ring-1 focus:ring-lapis-500 dark:border-stone-700 dark:bg-stone-800/70 dark:text-sand-100';

  return (
    <div className="mx-auto w-full max-w-sm rounded-lg border border-sand-200 bg-white/60 p-6 dark:border-stone-700 dark:bg-stone-800/60">
      <div role="tablist" aria-label={t('title')} className="mb-6 flex rounded-md bg-sand-100 p-1 dark:bg-stone-800">
        {(['signin', 'signup'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={`flex-1 rounded px-3 py-1.5 font-sans text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-white text-stone-800 shadow-sm dark:bg-stone-700 dark:text-sand-100'
                : 'text-stone-500 hover:text-stone-700 dark:hover:text-sand-200'
            }`}
          >
            {t(m === 'signin' ? 'signInTab' : 'signUpTab')}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === 'signup' && (
          <label className="block">
            <span className="mb-1 block font-sans text-xs font-medium text-stone-600 dark:text-sand-200">
              {t('nameLabel')}
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className={inputClass}
            />
          </label>
        )}

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

        <label className="block">
          <span className="mb-1 block font-sans text-xs font-medium text-stone-600 dark:text-sand-200">
            {t('passwordLabel')}
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className={inputClass}
          />
          {mode === 'signup' && (
            <span className="mt-1 block font-sans text-xs text-stone-500">
              {t('passwordHint')}
            </span>
          )}
        </label>

        {errorKey && (
          <p role="alert" className="font-sans text-sm text-red-700 dark:text-red-400">
            {t(errorKey)}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-lapis-500 px-4 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-lapis-600 disabled:opacity-60"
        >
          {submitting
            ? t('submitting')
            : t(mode === 'signin' ? 'submitSignIn' : 'submitSignUp')}
        </button>
      </form>
    </div>
  );
}
