// 404 global: solo lo alcanzan URLs que el middleware de i18n no reescribe
// (rutas con punto, p. ej. /foo.png o las sondas /.well-known/… de Chrome
// DevTools). Como el layout raíz es un passthrough (el <html lang> real vive
// en [locale]/layout), este archivo debe aportar su propia estructura de
// documento — sin ella, Next lanza "Missing <html> and <body> tags".
import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body
        style={{
          fontFamily: 'Georgia, serif',
          display: 'grid',
          placeItems: 'center',
          minHeight: '100vh',
          margin: 0,
          background: '#fbf7f0',
          color: '#2b2622',
        }}
      >
        <main style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ letterSpacing: '0.2em', fontSize: '0.75rem' }}>TABOR</p>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>404</h1>
          <p>
            Página no encontrada · <span lang="en">Page not found</span>
          </p>
          <Link href="/es" style={{ color: '#3a5a85' }}>
            proyectotabor.org
          </Link>
        </main>
      </body>
    </html>
  );
}
