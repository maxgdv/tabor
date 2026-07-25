import type { MetadataRoute } from 'next';

/**
 * Manifiesto de aplicación web: hace a Tabor instalable en Android, iOS y
 * escritorio. Se sirve en /manifest.webmanifest y Next inyecta el
 * <link rel="manifest"> en el <head>.
 *
 * Sin service worker: instalable sí, offline no. Servir texto bíblico desde
 * una caché obsoleta es peor que no servirlo (decisión del promotor).
 *
 * El manifiesto NO se localiza: Next lo resuelve una sola vez, fuera del
 * segmento [locale], así que no hay forma de emitir uno por idioma. Se asume
 * el español como idioma principal del proyecto (`lang: 'es'`, textos en
 * español); los usuarios en inglés siguen navegando /en con normalidad
 * porque el `scope` cubre todo el origen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    // Identidad estable de la app, independiente de `start_url`: si algún día
    // cambia la URL de arranque, el sistema seguirá viéndola como la misma
    // aplicación instalada en lugar de ofrecer una segunda instalación.
    id: '/',
    name: 'Tabor',
    short_name: 'Tabor',
    description:
      'Lee la Biblia con un mapa interactivo que sitúa cada pasaje en su lugar y su época.',
    // Arrancar en /es y no en /: el proxy de next-intl (localePrefix: 'always')
    // redirige / a /es|/en con un 307, y ese salto extra se paga en cada
    // apertura de la app instalada, justo cuando no hay pantalla de navegador
    // que disimule la espera. Como el manifiesto no puede localizarse, se fija
    // el idioma por defecto del proyecto.
    start_url: '/es',
    // El ámbito sí es todo el origen: desde /es se puede cambiar a /en (o
    // entrar en /entrar, /cuenta…) sin que la navegación se salga de la app
    // instalada y se abra el navegador.
    scope: '/',
    display: 'standalone',
    // Sin `orientation`: leer en vertical y consultar el mapa en horizontal
    // son dos usos legítimos; bloquear la rotación estorbaría a ambos y
    // penaliza a quien tiene el dispositivo fijado en un soporte (WCAG 1.3.4).
    background_color: '#fbf7f0', // sand-50: el fondo del tema claro, para que el splash no destelle
    theme_color: '#fbf7f0', // sand-50 (el manifiesto admite un solo color; la variante oscura va en `viewport`)
    lang: 'es',
    dir: 'ltr',
    categories: ['books', 'education', 'lifestyle'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // Con zona de seguridad: Android recorta el icono a la forma del
      // lanzador (círculo, escudo, cuadrado redondeado) y sin esta variante
      // la silueta se comería el borde.
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
