import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
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
