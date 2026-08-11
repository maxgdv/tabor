// Lectura comparada: catálogo de versiones y saneado del parámetro ?vs=.
//
// Vive separado de lib/bible.ts porque lo importan también componentes de
// cliente (CompareSelector, ReaderClient) y bible.ts arrastra @tabor/db, que
// solo puede ejecutarse en servidor.

/** Versiones disponibles como segunda columna. `param` viaja en ?vs= y `lang`
 *  alimenta el atributo lang del texto secundario (a11y: pronunciación). */
export type CompareOption = { code: string; param: string; lang: string };

export const COMPARE_VERSIONS: CompareOption[] = [
  { code: 'STRA', param: 'stra', lang: 'es' },
  { code: 'CPDV', param: 'cpdv', lang: 'en' },
  { code: 'VUL', param: 'vul', lang: 'la' },
];

/** Opción de comparación válida para `?vs=`, o `null` (incluye "contra sí misma"). */
export function resolveCompare(
  param: string | undefined,
  primaryVersionCode: string,
): CompareOption | null {
  if (!param) return null;
  const option = COMPARE_VERSIONS.find((v) => v.param === param.toLowerCase());
  return option && option.code !== primaryVersionCode ? option : null;
}
