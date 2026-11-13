import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Cabeceras de seguridad para todas las respuestas. HSTS ya lo pone Vercel.
//
// La CSP se limita a las directivas que no dependen de qué scripts o estilos
// carga la página: una `script-src` estricta exige un nonce por petición, y
// eso obligaría a renderizar cada página en una función en vez de servirla
// desde la CDN (ver el porqué en [locale]/layout.tsx). Lo que sí se cierra:
//   · frame-ancestors / X-Frame-Options: nadie puede incrustar el sitio en un
//     iframe, que es la base del clickjacking sobre los formularios de acceso.
//   · base-uri y form-action: un HTML inyectado no puede redirigir enlaces
//     relativos ni enviar un formulario a otro dominio.
//   · object-src: sin plugins.
const SECURITY_HEADERS = [
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Tabor no usa ninguna de estas APIs; denegarlas impide que un script de
  // terceros las pida en su nombre.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  // Arte sacro de dominio público servido desde Wikimedia Commons.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'upload.wikimedia.org' }],
  },
  // @tabor/db exporta TypeScript sin compilar; Next debe transpilarlo.
  transpilePackages: ['@tabor/db'],
  // El driver de Postgres se ejecuta solo en servidor: no lo empaquetes.
  serverExternalPackages: ['postgres'],
};

export default withNextIntl(nextConfig);
