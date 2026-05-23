import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  // @tabor/db exporta TypeScript sin compilar; Next debe transpilarlo.
  transpilePackages: ['@tabor/db'],
  // El driver de Postgres se ejecuta solo en servidor: no lo empaquetes.
  serverExternalPackages: ['postgres'],
};

export default withNextIntl(nextConfig);
