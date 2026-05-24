// Estado vacío del panel derecho cuando el capítulo no tiene referencias
// geográficas (genealogías, leyes, poesía, cartas, etc. — ~37 % de los
// capítulos). Inspirado en la inicial iluminada de los manuscritos monásticos:
// una capital decorada con su libro y capítulo, en vez de un mapa vacío
// que confunda al lector.

type Props = {
  bookName: string;
  chapterNumber: number;
  message: string; // texto secundario ya traducido (p.ej. "Sin referencias...")
};

// Extrae la primera letra alfabética del nombre del libro. Salta dígitos y
// espacios para que "1 Samuel" → "S", "Cantar de los Cantares" → "C",
// "Hechos de los Apóstoles" → "H".
function bookInitial(name: string): string {
  return name.match(/\p{L}/u)?.[0]?.toUpperCase() ?? '?';
}

export function EmptyChapterIllumination({ bookName, chapterNumber, message }: Props) {
  const initial = bookInitial(bookName);

  return (
    <div className="flex h-full w-full items-center justify-center bg-sand-100 px-6 py-10 dark:bg-stone-800">
      <figure className="flex max-w-sm flex-col items-center">
        <div className="relative">
          <div className="flex h-32 w-32 items-center justify-center border border-stone-300 bg-sand-50 dark:border-stone-600 dark:bg-stone-900">
            <span
              className="select-none font-serif text-7xl font-medium leading-none text-stone-700 dark:text-sand-100"
              aria-hidden="true"
            >
              {initial}
            </span>
          </div>
          {/* Cuatro pequeños rombos en las esquinas — guiño heráldico/medieval */}
          <span
            aria-hidden="true"
            className="absolute -left-1.5 -top-1.5 block h-3 w-3 rotate-45 bg-stone-300 dark:bg-stone-600"
          />
          <span
            aria-hidden="true"
            className="absolute -right-1.5 -top-1.5 block h-3 w-3 rotate-45 bg-stone-300 dark:bg-stone-600"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-1.5 -left-1.5 block h-3 w-3 rotate-45 bg-stone-300 dark:bg-stone-600"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-1.5 -right-1.5 block h-3 w-3 rotate-45 bg-stone-300 dark:bg-stone-600"
          />
        </div>

        <figcaption className="mt-8 text-center">
          <p className="font-serif text-xl text-stone-800 dark:text-sand-100">
            {bookName} {chapterNumber}
          </p>
          <p className="mt-3 text-sm text-stone-500 dark:text-sand-200">{message}</p>
        </figcaption>
      </figure>
    </div>
  );
}
