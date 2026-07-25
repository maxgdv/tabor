import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { plansOfKind } from '@/lib/plans';

/**
 * Accesos directos, desde la portada, a los planes para una situación
 * concreta.
 *
 * Por qué en la portada y no sólo dentro de /planes: quien busca esto no
 * llega con ganas de explorar un catálogo. Llega un mal día, y que la
 * lectura que necesita esté a dos toques de distancia —portada, plan— en
 * vez de a cuatro es justamente la diferencia entre que sirva y que no.
 *
 * Cada pastilla lleva el nombre corto («Duelo»), que es lo que uno
 * reconoce de un vistazo; el nombre completo y la nota pastoral viven en
 * la página del plan, que es donde se empieza a leer.
 */
export function SituationPlansSection({ locale }: { locale: string }) {
  const t = useTranslations('home.situations');
  const lang = locale === 'en' ? 'en' : 'es';
  const plans = plansOfKind('situacion');
  if (plans.length === 0) return null;

  return (
    <section
      aria-labelledby="situations-heading"
      className="border-sand-200 mt-14 rounded-lg border bg-white/60 p-6 sm:p-8 dark:border-stone-700 dark:bg-stone-800/60"
    >
      <h2 id="situations-heading" className="dark:text-sand-100 font-serif text-xl text-stone-800">
        {t('title')}
      </h2>
      <p className="dark:text-sand-200 mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
        {t('lede')}
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {plans.map((plan) => (
          <li key={plan.slug}>
            <Link
              href={`/planes/${plan.slug}`}
              // min-h-11: objetivo táctil cómodo; son doce pastillas juntas
              // y en un teléfono se pulsan con el pulgar.
              className="border-sand-200 bg-sand-50/60 hover:border-lapis-500 hover:text-lapis-600 dark:text-sand-100 dark:hover:border-lapis-500 inline-flex min-h-11 items-center rounded-full border px-4 font-sans text-sm text-stone-700 transition-colors dark:border-stone-600 dark:bg-stone-800/60"
            >
              {(plan.shortName ?? plan.name)[lang]}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-5">
        <Link
          href="/planes"
          className="text-lapis-600 dark:text-lapis-300 inline-flex items-center gap-1.5 font-sans text-sm underline-offset-2 hover:underline"
        >
          {t('all')}
          <span aria-hidden="true">→</span>
        </Link>
      </p>
    </section>
  );
}
