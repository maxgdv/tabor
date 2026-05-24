# Contribuir a Tabor

Gracias por considerar aportar al proyecto. Tabor es **un proyecto
abierto bajo dirección editorial única**: el código es libre y mejorable
por la comunidad, pero las decisiones de contenido y orientación
doctrinal las mantiene el promotor del proyecto.

## Antes de empezar

Lee la sección **"Principios editoriales"** del [README](./README.md).
Resumen para que estemos en la misma página:

- Solo versiones bíblicas católicas (aprobadas o de dominio público).
- Sin publicidad, gamificación, redes sociales, dark patterns.
- Privacidad por diseño.
- Accesibilidad WCAG 2.2 AA.
- Sin financiación por publicidad — donativo voluntario, nada más.

Las PRs que entren en conflicto con estos principios serán rechazadas
de buena fe; mejor abrir antes un *issue* para discutirlo si tienes
dudas.

## Qué tipos de contribuciones encajan bien

### 🟢 Muy bienvenidas
- **Corrección de bugs** (UI, accesibilidad, datos)
- **Mejoras de rendimiento** (queries, bundle size, render)
- **Pulido del lector y del mapa** (UX, tipografía, responsive)
- **Traducciones de UI** a otros idiomas (no del texto bíblico)
- **Mejoras de los importadores** (calidad de datos geográficos, edge cases)
- **Documentación** (README, SPEC, comentarios en código)
- **Pruebas** (unit, integración, end-to-end)
- **Tests de accesibilidad y correcciones WCAG**

### 🟡 Requieren discusión previa (abre un *issue* primero)
- **Nuevas versiones bíblicas** (necesita verificación de licencia o dominio público + revisión doctrinal)
- **Nuevos datasets geográficos** (necesita comprobación de licencia y calidad)
- **Cambios de diseño visual significativos**
- **Nuevos features** (búsqueda, marcadores, planes de lectura, etc.)
- **Integraciones con servicios externos**

### 🔴 No encajan en el proyecto
- **Publicidad** de cualquier tipo
- **Funcionalidades sociales** (comentarios entre usuarios, foros, likes)
- **Notas exegéticas o doctrinales** generadas por contribuyentes
  (riesgo doctrinal sin revisión editorial profesional)
- **Contenido generado por IA** sin revisión humana cualificada
- **Telemetría no anónima** o que no se pueda desactivar
- **Dark patterns** (UI engañosa, suscripciones forzadas, etc.)

## Cómo arrancar el entorno

Sigue [la sección "Arranque en local" del README](./README.md#arranque-en-local).
Si algo falla, abre un *issue* describiendo paso a paso lo que viste.

## Flujo de Pull Request

1. **Fork** del repo y crea una rama descriptiva: `fix/scroll-mobile`,
   `feat/keyboard-shortcuts`, `docs/spec-update`...
2. **Haz cambios pequeños y enfocados**. Una PR = un cambio lógico.
3. **Mensajes de commit** en formato convencional:
   `<tipo>(<scope>): <breve descripción>`. Tipos: `feat`, `fix`,
   `chore`, `docs`, `refactor`, `test`, `perf`, `style`.
4. **Antes de abrir la PR**, asegúrate de que:
   - `npm run lint` pasa sin errores.
   - `npm run typecheck` pasa sin errores.
   - `npm run build` compila correctamente.
5. **Abre la PR** describiendo qué resuelve, por qué y cómo verificarlo.
   Si toca UI, adjunta capturas (antes/después).
6. **Revisión** por @maxgdv. Puede haber iteración; sé paciente y
   responde con buena fe.
7. **Merge** lo hace el maintainer, no el contribuidor.

## Estilo de código

- **TypeScript estricto** (`strict: true`, `noUncheckedIndexedAccess: true`).
- **Prettier** para formato (config en `.prettierrc.json`).
- **ESLint** para reglas de calidad (config Next por defecto).
- **Comentarios en español** salvo nombres técnicos. La spec está en
  español; mantener coherencia.
- **Sin emojis en código** (sí están bien en commits y PRs).

## Gobernanza

- **Maintainer único:** @maxgdv (Manuel G., promotor del proyecto).
- **Branch principal:** `main`, protegida — solo se mergea vía PR.
- **CI:** GitHub Actions corre lint + typecheck + build en cada PR.
  Una PR no se mergea si CI está en rojo.
- **Decisiones doctrinales o editoriales:** responsabilidad exclusiva
  del maintainer.

## Código de conducta

Este proyecto adopta el [Código de Conducta](./CODE_OF_CONDUCT.md).
Resumen: respeto, buena fe y crítica del trabajo (no de las personas).

## Contacto

- **Issues técnicos / propuestas:** [issues en GitHub](https://github.com/maxgdv/tabor/issues)
- **Discusiones de producto / editoriales:** abre un *issue* con la etiqueta `discussion`
- **Asuntos sensibles** (licencias, doctrina, denuncias de comportamiento):
  contacta directamente al maintainer

Gracias por aportar. Que el proyecto sirva para que más gente encuentre
en la lectura de la Biblia el contexto geográfico que enriquece el texto.
