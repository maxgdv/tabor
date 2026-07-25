import { useTranslations } from 'next-intl';

type Props = {
  /**
   * `detail` → recuadro en la página del plan, antes de la lista de días.
   * `index` → aviso breve bajo el encabezado de la sección del índice.
   */
  variant?: 'detail' | 'index';
};

/**
 * Nota pastoral de los planes de situación. No es un descargo legal ni una
 * advertencia: dice lo que diría quien presta un libro en un mal momento —
 * esto acompaña, pero no basta, y lo que pesa se habla con alguien.
 * Se muestra en la cabecera de la sección del índice y en cada plan de
 * `kind: 'situacion'`, siempre antes de empezar a leer.
 */
export function PastoralNote({ variant = 'detail' }: Props) {
  const t = useTranslations('plans');

  if (variant === 'index') {
    return (
      <p className="mt-3 max-w-2xl border-l-2 border-sand-300 pl-3 text-sm leading-relaxed text-stone-600 dark:border-stone-600 dark:text-sand-200">
        {t('pastoralNote')}
      </p>
    );
  }

  return (
    <p className="mb-10 max-w-2xl rounded-lg border border-sand-200 bg-white/60 px-5 py-4 text-sm leading-relaxed text-stone-600 dark:border-stone-700 dark:bg-stone-800/60 dark:text-sand-200">
      {t('pastoralNote')}
    </p>
  );
}
