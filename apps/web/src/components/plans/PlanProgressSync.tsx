'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { clearLocalProgress, readLocalProgress } from '@/lib/plan-progress';

/**
 * Migración única del progreso local del dispositivo a la cuenta. Se monta
 * solo con sesión iniciada (lo deciden las páginas de planes). Si hay
 * progreso en localStorage lo sube (unión en el servidor), lo limpia y
 * refresca para que los server components muestren el resultado.
 * Si el POST falla, NO limpia: se reintentará en la próxima visita.
 */
export function PlanProgressSync() {
  const router = useRouter();
  // Evita el doble disparo del StrictMode en dev; el merge es idempotente
  // en el servidor de todas formas.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const progress = readLocalProgress();
    if (Object.keys(progress).length === 0) return;

    void fetch('/api/plan-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merge: progress }),
    })
      .then((res) => {
        if (!res.ok) return;
        clearLocalProgress();
        router.refresh();
      })
      .catch(() => {
        // Silencioso: el progreso local sigue intacto para reintentar.
      });
  }, [router]);

  return null;
}
