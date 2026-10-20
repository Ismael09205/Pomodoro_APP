# Decisiones — 005-ajustar-tiempos-pomodoro (HU-005)

Decisiones tomadas en la entrevista (skill `grill-me`) sobre la HU-005 "Ajustar los tiempos del pomodoro", con base en `docs/constitution.md`, `AGENTS.md` y `docs/historias/HU-005.md`. Fecha: 20/10/2026.

## Decisión 001 — Rangos permitidos y unidad de cada campo

- **Pregunta:** La HU penaliza "un valor fuera del rango permitido" sin definir ese rango. ¿Cuál es el rango permitido y la unidad para los campos de estudio, descanso corto, descanso largo y pomodoros por ciclo?
- **Respuesta:** Duraciones de estudio, descanso corto y descanso largo: enteros de 1 a 120 minutos. Pomodoros por ciclo: entero de 1 a 12. Solo números enteros (sin decimales, sin segundos).
- **Motivo:** Ninguna HU ni spec previa define el rango; sin él, la implementación no sabría qué rechazar. Los límites son amplios para no estorbar al estudiante, pero impiden valores absurdos o inútiles (0 y vacío ya los cubre la HU).

## Decisión 002 — Acceso a la pantalla de ajustes

- **Pregunta:** La HU asume "estoy en la pantalla de ajustes", pero esa pantalla no existe. ¿Cómo se llega a ella?
- **Respuesta:** A. Reemplazar la pestaña "Explore" (pantalla plantilla de Expo sin relación con el dominio) por una pestaña "Ajustes"; la app queda con dos tabs: Home (temporizador) y Ajustes.
- **Motivo:** Explore es una pantalla de plantilla que no aporta; reemplazarla mantiene la barra inferior limpia con dos destinos claros, sin crecer la navegación (Constitución 1, simplicidad primero).

## Decisión 003 — Pomodoros por ciclo cuando el contador ya supera el nuevo valor

- **Pregunta:** El estudiante ya completó 5 pomodoros y cambia "pomodoros por ciclo" a 3: ¿el ciclo en curso termina con el valor anterior o el nuevo valor rige desde la próxima fase?
- **Respuesta:** A. Se aplica literal desde la próxima fase: si el contador ya alcanzó el nuevo valor, el próximo descanso será largo.
- **Motivo:** Es la lectura literal de la HU ("el cambio se aplica a la próxima fase") y de la Constitución 4 (respetar la configuración del estudiante): el estudiante pidió ciclos de 3, así que recibe el descanso largo lo antes posible. La opción alternativa requería inventar una "regla de ciclo atómico" que ninguna HU define.

## Decisión 004 — Campo inválido al pulsar "Guardar"

- **Pregunta:** Con 4 campos y un botón Guardar, si un campo es inválido pero los demás son válidos, ¿qué se guarda?
- **Respuesta:** A. No se guarda ninguno; se resalta el campo inválido con su rango permitido (guardado atómico: o todo o nada).
- **Motivo:** La HU dice "la aplicación no guarda el cambio" en singular; el guardado atómico es más simple de entender, evita medios cambios silenciosos y cumple la Constitución 1 al elegir la opción menos ambigua.

## Decisión 005 — Cómo se muestra el error de validación

- **Pregunta:** La HU exige "me indica qué valores puedo usar"; ¿cómo se muestra?
- **Respuesta:** A. Mensaje en rojo debajo de cada campo inválido, indicando su rango (ej. "Ingresa un número entre 1 y 120").
- **Motivo:** El error queda junto al campo afectado, se entiende sin leer un mensaje global y es el patrón estándar en interfaces móviles.

## Decisión 006 — Restablecer con una fase en curso

- **Pregunta:** La HU tiene escenarios separados para "cambiar un tiempo con fase en curso" y "restablecer"; combinados, si restablece mientras corre una fase de estudio de 45 min, ¿qué ocurre?
- **Respuesta:** A. La fase actual termina con los 45 min con que empezó; los valores por defecto (25/5/15/4) rigen desde la próxima fase.
- **Motivo:** Restablecer es simplemente "cambiar los 4 tiempos a la vez", por lo que aplica la misma regla que la HU ya aprobó. Reiniciar la fase de inmediato haría que el temporizador "tragara" tiempo en curso, contra la Constitución 3 (el tiempo debe ser exacto).

## Decisión 007 — Cambio de tiempos con la sesión en pausa

- **Pregunta:** La HU dice "tengo el temporizador corriendo", pero el estudiante también puede tener la sesión en pausa; ¿se permite cambiar tiempos y aplica la misma regla?
- **Respuesta:** A. Sí; la fase en curso (corriendo o en pausa) conserva el tiempo con que empezó y el cambio rige para la siguiente fase.
- **Motivo:** Es la misma regla de la HU extendida de forma natural al estado de pausa, sin inventar comportamientos nuevos. Bloquear los ajustes en pausa sería una restricción que ninguna HU pide.

## Decisión 008 — Persistencia: cuándo se guarda y confirmación de restablecer

- **Pregunta:** La HU dice "cambio un tiempo y guardo" y "elijo restablecer y lo confirmo"; ¿cuándo se aplican y persisten los cambios?
- **Respuesta:** A. Botón "Guardar" explícito: los cambios no se aplican ni persisten hasta pulsarlo; salir de la pantalla sin guardar descarta lo escrito. "Restablecer" abre un diálogo de confirmación y, al confirmar, restaura 25/5/15/4 solo en los campos en pantalla; persiste recién al pulsar Guardar.
- **Motivo:** El botón Guardar es fiel al texto de la HU. Un único mecanismo de guardado (todo persiste solo al Guardar) elimina sorpresas y mantiene un solo camino de persistencia, cumpliendo las Constituciones 1 y 5.

## Decisión 009 — Restablecer con fase en curso sigue el mecanismo de "Guardar"

- **Pregunta:** RF-08 de la spec afirmaba que, tras restablecer con una fase en curso, los valores por defecto se aplican desde la próxima fase sin mencionar el botón "Guardar", lo que contradice a RF-06 y RF-10 y al alcance de guardado definido en la Decisión 008. ¿Cómo se resuelve?
- **Respuesta:** A. El restablecimiento se rige por el mismo mecanismo de "Guardar": la fase actual conserva el tiempo con que empezó y los valores por defecto (25/5/15/4) rigen desde la próxima fase únicamente si el estudiante pulsa "Guardar"; si sale sin guardar, no se aplica ni se conserva ningún cambio.
- **Motivo:** Mantiene un único mecanismo de guardado, tal como establece la Decisión 008, y evita dos caminos distintos para aplicar cambios (guardar tiempos vs. restablecer), cumpliendo las Constituciones 1 (simplicidad primero) y 5 (los datos del estudiante se conservan de forma controlada).

## Nota técnica de soporte (no es decisión de producto)

- Los ajustes se persistirán en una clave nueva `@pomodoro/settings` de AsyncStorage, versionada como las existentes (`{ version: 1, ... }`), con los valores por defecto (25/5/15/4) cuando no haya nada guardado.
- La validación de rangos y las reglas de configuración viven en `src/domain/`, separadas de la interfaz y de la persistencia, conforme a la Constitución 9.
