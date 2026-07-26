// Mantener la pantalla encendida mientras se lee en voz alta.
//
// El problema que resuelve: en el móvil, la pantalla se apaga sola tras unos
// segundos sin tocarla. Al apagarse, el navegador suspende la página y la
// síntesis de voz enmudece a media lectura — que es justo cuando el usuario
// ha dejado el teléfono para escuchar.
//
// LÍMITE QUE ESTO NO SALVA: si el usuario bloquea el teléfono a propósito o
// se va a otra aplicación, la Web Speech API se calla y no hay forma de
// evitarlo. No es audio de verdad (no hay elemento <audio> ni stream), así
// que el navegador no le concede reproducción en segundo plano ni controles
// de bloqueo. Sonar con la pantalla apagada exigiría audio real —TTS
// generado en servidor o grabaciones— y eso es otra decisión, con licencias
// y backend por medio.

/**
 * Pide mantener la pantalla encendida y devuelve la función para soltarla.
 *
 * El bloqueo se pierde solo cada vez que la página deja de estar visible, así
 * que se vuelve a pedir al regresar. Si el navegador no lo soporta o lo
 * deniega (batería baja, contexto no seguro), no pasa nada: la lectura sigue
 * funcionando como hasta ahora, sencillamente sin retener la pantalla.
 */
export function keepScreenAwake(): () => void {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
    return () => {};
  }

  let stopped = false;
  let sentinel: WakeLockSentinel | null = null;

  const acquire = async () => {
    // Pedirlo con la página oculta lanza: se espera a volver a ser visible.
    if (stopped || sentinel || document.visibilityState !== 'visible') return;
    try {
      const lock = await navigator.wakeLock.request('screen');
      // Entre el await y aquí puede haberse soltado ya: no dejar huérfano.
      if (stopped) {
        void lock.release().catch(() => {});
        return;
      }
      sentinel = lock;
      lock.addEventListener('release', () => {
        if (sentinel === lock) sentinel = null;
      });
    } catch {
      // Denegado o no disponible: se sigue sin bloqueo, sin romper nada.
      sentinel = null;
    }
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') void acquire();
  };

  void acquire();
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    stopped = true;
    document.removeEventListener('visibilitychange', onVisibilityChange);
    const lock = sentinel;
    sentinel = null;
    void lock?.release().catch(() => {});
  };
}
