// POST /api/plan-progress — progreso de planes del usuario con sesión.
// Dos formas de cuerpo (mismo recurso, misma validación):
//   { plan: 'evangelios-30', day: 3, done: true }  → marca/desmarca → { done }
//   { merge: { 'evangelios-30': [0,1,2], ... } }   → migración única del
//     progreso local del dispositivo a la cuenta (unión) → { merged: true }

import { NextResponse, type NextRequest } from 'next/server';
import { mergePlanProgress, setPlanDay } from '@tabor/db';
import { auth } from '@/lib/auth';
import {
  parseSetDayBody,
  planDayCounts,
  sanitizeMergeProgress,
} from '@/lib/plan-progress-sync';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const data: unknown = await request.json().catch(() => null);
  const dayCounts = planDayCounts();

  if (typeof data === 'object' && data !== null && 'merge' in data) {
    const progress = sanitizeMergeProgress((data as Record<string, unknown>).merge, dayCounts);
    await mergePlanProgress({ userId: session.user.id, progress });
    // 200 aunque no quedara nada válido: el cliente debe limpiar su
    // localStorage igualmente (esa basura ya no sirve en ningún sitio).
    return NextResponse.json({ merged: true });
  }

  const body = parseSetDayBody(data, dayCounts);
  if (!body) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  await setPlanDay({
    userId: session.user.id,
    planSlug: body.plan,
    dayIndex: body.day,
    done: body.done,
  });
  return NextResponse.json({ done: body.done });
}
