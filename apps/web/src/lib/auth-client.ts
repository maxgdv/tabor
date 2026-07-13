'use client';

// Cliente de Better-Auth para componentes de cliente. Mismo origen que la
// app (Vercel sirve web y API juntas), así que no necesita baseURL.
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient();
