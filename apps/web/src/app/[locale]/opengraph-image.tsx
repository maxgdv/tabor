import { ImageResponse } from 'next/og';

// Imagen Open Graph / Twitter Card para todas las rutas del locale.
// Generada con next/og (sin assets binarios en el repo): fondo lapislázuli
// de la marca, nombre y tagline según idioma. 1200×630 es el tamaño
// estándar que WhatsApp, X, Facebook y LinkedIn muestran completo.

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Tabor — La Biblia, lugar a lugar';

const TAGLINE: Record<string, string> = {
  es: 'La Biblia, lugar a lugar',
  en: 'The Bible, place by place',
};

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tagline = TAGLINE[locale] ?? TAGLINE.es;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2c4669',
          backgroundImage: 'radial-gradient(circle at 50% 120%, #3a5a85 0%, #2c4669 55%, #1d2f47 100%)',
          color: '#fbf7f0',
        }}
      >
        <div
          style={{
            fontSize: 132,
            letterSpacing: '0.22em',
            marginLeft: '0.22em', // compensa el tracking del último carácter para centrar de verdad
            fontWeight: 700,
          }}
        >
          TABOR
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 44,
            color: '#e6d6b5',
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            marginTop: 64,
            fontSize: 28,
            letterSpacing: '0.12em',
            color: '#aec3dd',
          }}
        >
          proyectotabor.org
        </div>
      </div>
    ),
    size,
  );
}
