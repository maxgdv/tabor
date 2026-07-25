/**
 * Aviso de "el panel del mapa ha cambiado de visibilidad o de tamaño".
 *
 * Lo emite la hoja deslizante del lector (ReaderShell) al abrirse o cerrarse
 * en móvil, y lo escucha BibleMap para llamar a `map.resize()`: si el canvas
 * de MapLibre se mide con el contenedor oculto o con otro tamaño, se queda
 * con el tamaño viejo y sale deformado.
 *
 * Va en su propio módulo (sin dependencias) para que el shell no arrastre
 * MapLibre al bundle solo por importar la constante.
 */
export const MAP_PANEL_EVENT = 'tabor-map-panel';
