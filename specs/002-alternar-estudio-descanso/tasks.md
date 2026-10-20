# Tareas — 002-alternar-estudio-descanso

Orden por dependencias. Tareas de lógica verificadas con `npx jest` (y
`npx tsc --noEmit` cuando corresponda); tareas de interfaz verificadas con los
puntos aplicables de la lista manual de `rn-conventions` en Expo Go.
Actualmente 6 tareas (≤ 10, no se propone dividir la spec).

Sin dependencias nuevas: se reutilizan las ya autorizadas en la spec 001.

- [x] **T1. Dominio del ciclo: transición de fases y contador.** RF-01, RF-02, RF-03, RF-04, RF-08, RF-09, RF-10
  - Hecho cuando: `npx jest` pasa en `src/domain/__tests__/cycle.test.ts` cubriendo: estudio bajo el umbral → descanso corto con contador +1; estudio que alcanza las configuradas (4) → descanso largo con contador 0; descanso corto y largo → estudio con el contador intacto; `advanceCycle` es la única mutación del contador (una sesión reiniciada y completada suma una sola vez); `nextTimerFor` devuelve Inicial con la duración completa; `phaseLabel`/`pomodoroText` producen "Estudio"/"Descanso corto"/"Descanso largo" y "Pomodoros: 2/4", incluido "Pomodoros: 0/4".

- [x] **T2. Resumen diario: incremento de "Completadas".** RF-14, RF-15, RF-16, RF-12
  - Hecho cuando: `npx jest` pasa en `src/domain/__tests__/session-record.test.ts` cubriendo: completar estudio sin marca incrementa `completed` una sola vez; completar estudio marcado suma 1 a `completed` y resta 1 a `incomplete` sin sesión nueva ni doble conteo; completar un descanso no modifica el registro; reiniciar un descanso no altera registro ni contador; las expectativas de la spec 001 que codificaban RC-1/Decisión 025 quedan actualizadas y el resto de la suite sigue pasando.

- [x] **T3. Persistencia de la fase y del contador del ciclo.** RF-11, RF-05 (carga), RN-03
  - Hecho cuando: `npx jest` pasa en `src/storage/__tests__/cycle-state.test.ts` (roundtrip guardar/recuperar, sin dato devuelve `emptyCycle()`, JSON inválido no lanza) incluyendo una aserción de que la clave `@pomodoro/study-record` queda intacta, y `npx tsc --noEmit` no reporta errores en `src/storage/`.

- [x] **T4. Orquestación en el hook: transición al 00:00 y persistencia.** RF-05, RF-06, RF-07, RF-11, RN-01, RN-04
  - Hecho cuando: `npx jest` completo pasa sin regresiones en las suites de la spec 001 y `npx tsc --noEmit` no reporta errores; el hook carga fase + contador al montar (sin parámetro de fase fijo), al vencimiento ejecuta en un solo paso `applyTimerCompletion` + `advanceCycle` + nuevo temporizador en Inicial, guarda el ciclo solo en transiciones y ninguna llamada a la interfaz decide la siguiente fase.

- [x] **T5. Pantalla principal: etiqueta de fase y contador de pomodoros.** RF-08, RF-12, RF-13, RN-04
  - Hecho cuando: en Expo Go se confirman los puntos aplicables de la lista manual de `rn-conventions` (se ve bien en vertical, textos en español, los textos de estado se leen sin depender del color) y además: la tarjeta muestra la etiqueta exacta de la fase actual y "Pomodoros: x/y"; al 00:00 la etiqueta y el contador cambian con la nueva fase; no existe ningún control nuevo (un descanso no se puede saltar) y "Reiniciar" en un descanso no cambia el contador ni el resumen.

- [x] **T6. Verificación integral de la HU-002.** RF-01 a RF-16, RN-01 a RN-04, criterios de finalización
  - Hecho cuando: `npx jest` y `npx tsc --noEmit` pasan completos sin errores y los cuatro escenarios de la HU-002 (terminar un pomodoro, llegar al descanso largo, terminar un descanso, ver mi avance) se confirman manualmente en Expo Go junto con "Cerrar la app por completo y abrirla conserva la fase y el contador" y ningún estado en Finalizado visible; cualquier limitación (recuperación con app cerrada, HU-003) queda documentada en el informe.
