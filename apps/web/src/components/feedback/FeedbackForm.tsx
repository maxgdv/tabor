'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import { FEEDBACK_MAX_LENGTH } from '@/lib/feedback';

/**
 * Formulario del buzón de comentarios y preguntas. No exige sesión: con ella
 * el mensaje queda asociado a la cuenta; sin ella se ofrece un email opcional
 * por si el remitente quiere respuesta. `website` es un honeypot invisible.
 */
export function FeedbackForm() {
  const t = useTranslations('feedback');
  const { data: session } = authClient.useSession();

  const [body, setBody] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');

  // La ruta desde la que se llegó al formulario (enlace del pie): contexto
  // útil para entender un «¿por qué falta este versículo?» sin preguntar.
  const referrerPath = () => {
    try {
      const ref = new URL(document.referrer);
      if (ref.origin === window.location.origin) return ref.pathname + ref.search;
    } catch {
      // referrer vacío o inválido: sin contexto, sin más.
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    try {
      const fromPath = referrerPath();
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, email: email || null, fromPath, website }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="mx-auto w-full max-w-lg rounded-lg border border-sand-200 bg-white/60 p-6 text-center dark:border-stone-700 dark:bg-stone-800/60">
        <p className="font-sans text-sm text-stone-700 dark:text-sand-200">{t('sent')}</p>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-md border border-sand-200 bg-white/70 px-3 py-2 font-sans text-sm text-stone-800 placeholder:text-stone-500 focus:border-lapis-500 focus:outline-none focus:ring-1 focus:ring-lapis-500 dark:border-stone-700 dark:bg-stone-800/70 dark:text-sand-100 dark:placeholder:text-stone-400';

  return (
    <form
      onSubmit={onSubmit}
      className="relative mx-auto w-full max-w-lg space-y-4 rounded-lg border border-sand-200 bg-white/60 p-6 dark:border-stone-700 dark:bg-stone-800/60"
    >
      <label className="block">
        <span className="mb-1 block font-sans text-xs font-medium text-stone-600 dark:text-sand-200">
          {t('bodyLabel')}
        </span>
        <textarea
          required
          rows={6}
          maxLength={FEEDBACK_MAX_LENGTH}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('bodyPlaceholder')}
          className={inputClass}
        />
      </label>

      {!session && (
        <label className="block">
          <span className="mb-1 block font-sans text-xs font-medium text-stone-600 dark:text-sand-200">
            {t('emailLabel')}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={inputClass}
          />
          <span className="mt-1 block font-sans text-xs text-stone-500 dark:text-stone-400">
            {t('emailHint')}
          </span>
        </label>
      )}

      {/* Honeypot: invisible para personas (aria-hidden + tabIndex -1), pero
          los bots que rellenan todos los campos lo delatan. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {status === 'error' && (
        <p role="alert" className="font-sans text-sm text-red-700 dark:text-red-400">
          {t('error')}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-md bg-lapis-500 px-4 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-lapis-600 disabled:opacity-60"
      >
        {status === 'submitting' ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
