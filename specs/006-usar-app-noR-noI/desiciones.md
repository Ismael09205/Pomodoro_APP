# Decisiones — 006-usar-app-noR-noI (HU-006)

Decisiones tomadas en la entrevista (skill `grill-me`) sobre la HU-006 "Usar la aplicación sin registro, sin internet y sin publicidad", con base en `docs/constitution.md`, `AGENTS.md` y `docs/historias/HU-006.md`. Fecha: 20/10/2026.

## Decisión 001 — Momento del permiso de notificaciones en el primer arranque

- **Pregunta:** La HU dice que al abrirla por primera vez se llega "directo al temporizador, sin pantallas de registro ni de inicio de sesión", pero los avisos (Constitución 7) requieren permiso de notificaciones. ¿Cuándo se pide ese permiso?
- **Respuesta:** A. Pedirlo en el primer arranque, justo al llegar al temporizador (una sola vez, no en cada apertura). Si el usuario lo rechaza, se continúa normalmente y el rechazo se documenta como limitación de plataforma.
- **Motivo:** Los avisos son experiencia esencial (Constitución 7) y así funcionan desde la primera sesión. No hay pantalla intermedia de la aplicación: solo el diálogo del sistema, por lo que se mantiene el "llego directo al temporizador" de la HU (Constitución 8).

## Decisión 002 — Alcance de "sin internet"

- **Pregunta:** La HU cita temporizador, avisos y ajustes, pero "sin internet" puede interpretarse de forma total o parcial. ¿Qué se garantiza?
- **Respuesta:** A. Cero peticiones de red en toda la aplicación: nada de analíticas, telemetría, fuentes ni imágenes remotas; todo proviene del bundle local.
- **Motivo:** La Constitución 6 prohíbe la dependencia obligatoria de servidores o servicios remotos, y la verificación del código confirmó que actualmente no existen llamadas de red en `src/`. La regla "cero peticiones" es la más simple de verificar y la menos ambigua (Constitución 1).

## Decisión 003 — Qué cuenta como "publicidad"

- **Pregunta:** La HU dice "no aparece ningún anuncio"; ¿incluye el contenido promocional propio de la aplicación?
- **Respuesta:** A. Ni anuncios de terceros ni contenido promocional propio: sin banners, sin enlaces de terceros, sin mensajes tipo "valora la app".
- **Motivo:** La Constitución 8 establece que "no debe mostrar anuncios ni incorporar mecanismos publicitarios". Solo la opción a no deja ningún gris interpretativo y evita inventar una categoría de "publicidad permitida" que ninguna HU aprueba.

## Decisión 004 — Naturaleza de esta spec

- **Pregunta:** Las pantallas ya existen en `src/app/` (`index.tsx` del temporizador y `settings.tsx` de ajustes); ¿qué construye la spec de la HU-006?
- **Respuesta:** A. Es una spec de restricción y verificación: no crea pantallas nuevas (salvo el mecanismo de permiso de la Decisión 001), solo exige que las pantallas existentes y las futuras cumplan sin registro, sin red y sin anuncios.
- **Motivo:** La HU no describe ninguna pantalla propia; su valor está en garantizar restricciones transversales. Menos alcance = menos riesgo de inventar requisitos, conforme a AGENTS.md (no añadir funcionalidades no contempladas) y Constitución 1.

## Decisión 005 — Cómo se verifican "sin conexión" y "sin publicidad"

- **Pregunta:** Los criterios de aceptación de la HU son de verificación manual; ¿qué exige la spec para considerarlos cumplidos?
- **Respuesta:** A. Validación manual en Expo Go con modo avión (temporizador, avisos y ajustes) + revisión de que no existan SDKs de anuncios ni llamadas de red, documentando resultados y limitaciones.
- **Motivo:** La Constitución 10 exige verificar los criterios de aceptación antes de dar la historia por terminada y prohibe afirmar validaciones no ejecutadas. La combinación de prueba manual (única forma de simular "sin datos móviles ni wifi" real) y revisión de código cubre los tres escenarios de la HU.

## Decisión 006 — Indicador de sin conexión

- **Pregunta:** Cuando el celular está sin datos ni wifi, ¿la aplicación muestra algún indicador o aviso de estado de red?
- **Respuesta:** A. Ningún indicador: la aplicación simplemente funciona igual, sin avisos ni estados de red.
- **Motivo:** Coherente con la Decisión 004 (spec de restricción) y la Decisión 002 (cero peticiones): si nada depende de la red, el estado de red es irrelevante para la interfaz. Un indicador añadiría complejidad sin decisión de producto que lo respalde (Constitución 1).

## Decisión 007 — Primer arranque y valores por defecto

- **Pregunta:** Al llegar "directo al temporizador" la primera vez, ¿con qué tiempos arranca la sesión?
- **Respuesta:** A. Con los valores por defecto que define la HU-005 / spec 005 (ajustes); la HU-006 no define tiempos nuevos.
- **Motivo:** La Constitución 11 asigna los valores de duración y conteo a la HU donde se especifican. Definirlos de nuevo aquí duplicaría la definición y podría contradecir a la spec 005.

## Decisión 008 — Recuperación si el usuario rechaza el permiso de notificaciones

- **Pregunta:** Si el usuario rechaza el permiso pedido en el primer arranque (Decisión 001), ¿se puede recuperar después?
- **Respuesta:** A. Sí: en la pantalla de ajustes se ofrece una opción que abre los ajustes del sistema para activar los avisos; si no lo hace, la aplicación funciona igual sin avisos.
- **Motivo:** Es el patrón estándar en móviles, respeta la Constitución 7 (documentar limitaciones del sistema sin afirmar garantías falsas) y evita volver a preguntar en cada apertura, manteniendo el acceso directo al temporizador de la Constitución 8.

## Decisión 009 — Condición de visibilidad de la opción de recuperación de avisos en Ajustes

- **Pregunta:** La Decisión 008 no indica si la opción que abre los ajustes del sistema para activar los avisos se muestra siempre en la pantalla de ajustes o solo cuando el permiso ha sido rechazado; y "rechazado" puede interpretarse de forma estrecha o amplia. ¿Cuándo se muestra?
- **Respuesta:** B. Solo cuando los avisos no están concedidos: por rechazo explícito del permiso en el primer arranque, porque nunca se concedió o porque se revocó desde el sistema. No se muestra cuando los avisos ya están activos.
- **Motivo:** El estudiante solo ve la vía de recuperación cuando realmente la necesita y la pantalla de ajustes queda limpia cuando todo funciona. Definir la condición como estado de los avisos y no como evento puntual evita dejar sin salida de recuperación los casos en los que el permiso acaba sin concederse por otra vía (Constitución 1, Decisión 004).

## Decisión 010 — Actualización de la opción al volver de los ajustes del sistema

- **Pregunta:** Si el estudiante toca la opción, activa los avisos en el sistema y vuelve a la aplicación, ¿la pantalla de ajustes refleja el cambio al momento o solo en la siguiente apertura?
- **Respuesta:** A. Se actualiza al volver: si los avisos ya están concedidos, la opción «Activar avisos» desaparece en cuanto el estudiante retoma la aplicación.
- **Motivo:** La pantalla nunca muestra información obsoleta después de una acción que el estudiante acaba de realizar en el sistema, evitando confusión con una opción que ya no tiene utilidad.

## Decisión 011 — Alcance de la opción «Activar avisos»

- **Pregunta:** La Decisión 008 dice que la opción "abre los ajustes del sistema para activar los avisos"; ¿solo cubre el permiso de notificaciones o también otros bloqueos del sistema que impiden los avisos?
- **Respuesta:** B. Cubre el permiso de notificaciones y también otros bloqueos del sistema, como el canal de notificaciones desactivado, «No molestar» o el sonido y la vibración.
- **Motivo:** El estudiante tiene un único punto de entrada para arreglar cualquier problema de avisos. Es una aclaración del alcance que la Decisión 008 no definía y que no contradice las limitaciones ya documentadas como de plataforma en la spec 004 (Constitución 7).

## Decisión 012 — Texto visible de la opción en la pantalla de ajustes

- **Pregunta:** No hay ningún texto aprobado para la opción en la pantalla de ajustes; sin definirlo, el implementador decidiría un texto visible por su cuenta. ¿Se fija ahora?
- **Respuesta:** A. Sí: la opción se muestra con el texto visible «Activar avisos» y la spec lo fija como comportamiento verificable.
- **Motivo:** El texto visible deja de ser una decisión del implementador y pasa a ser verificable en la revisión manual de la HU-006, sin dejar ambigüedad sobre lo que el estudiante ve.

## Decisión 013 — Alcance de la opción «Activar avisos»: solo el permiso de notificaciones

- **Pregunta:** La Decisión 011 amplió el alcance de la opción a otros bloqueos del sistema (canal de notificaciones, «No molestar», sonido, vibración), lo que entra en conflicto con la condición de visibilidad de la Decisión 009, basada en el estado del permiso: con el permiso concedido y, por ejemplo, el canal desactivado, la opción no aparece y ese alcance amplio queda inalcanzable. ¿Cómo se resuelve?
- **Respuesta:** B. La opción «Activar avisos» cubre únicamente el permiso de notificaciones, conservando sin cambios la visibilidad de la Decisión 009. La Decisión 011 queda revocada en su alcance amplio. Los demás bloqueos del sistema que impiden los avisos (canal de notificaciones, «No molestar», sonido y vibración) se tratan como limitación de plataforma documentada, como ya hizo la spec 004.
- **Motivo:** La HU-006 y la Decisión 008 definen la opción como recuperación del permiso rechazado; la ampliación de la Decisión 011 añadía alcance que ninguna HU aprobaba y resultaba inalcanzable con la visibilidad basada en el permiso. Detectar bloqueos del sistema añade lógica inestable y difícil de verificar (Constitución 1, 7 y 10, Decisión 004), y la Constitución 7 ya pide identificar y documentar esas limitaciones en lugar de compensarlas dentro de la aplicación.

## Nota técnica de soporte (no es decisión de producto)

- Hechos verificados durante la entrevista: las pantallas viven en `src/app/` (`index.tsx`, `settings.tsx`, `_layout.tsx`), no en `app/` como indica literalmente AGENTS.md; no existen llamadas de red (`fetch`/`axios`) en `src/`; `package.json` no incluye dependencias de publicidad ni analíticas. `src/components/external-link.tsx` y `app-tabs.web.tsx` son residuos de la plantilla de Expo (enlace a `docs.expo.dev`, solo web) y no constituyen publicidad; su uso quedará cubierto por la restricción de la Decisión 003.
