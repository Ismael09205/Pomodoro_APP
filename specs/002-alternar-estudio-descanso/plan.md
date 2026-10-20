# Plan 002 — Alternar entre estudio y descanso

Fuentes: `specs/002-alternar-estudio-descanso/spec.md` (Estado: Aprobada, sin
`[NECESITA ACLARACIÓN]`), `specs/002-alternar-estudio-descanso/decisiones.md`
(Decisiones 001–009), `docs/historias/HU-002.md`, `docs/constitution.md` y el
plan de `specs/001-iniciar-sesion-estudio/` (arquitectura y código existentes).

## Alcance estricto

Dentro de alcance: transición automática al siguiente tramo al llegar a 00:00,
contador de pomodoros del ciclo (incremento, reinicio y persistencia),
incremento de "Completadas" del resumen diario, persistencia de la fase y del
contador, y texto de avance en la pantalla principal.

Fuera de alcance (no se toca nada de esto en esta spec):

- Recuperación del tiempo restante de la fase en curso (HU-003; Decisión 004).
- Avisos, sonido, vibración y permisos (HU-004; Decisión 004).
- Pantalla de ajustes: duraciones y cantidad de pomodoros configurables
  (HU-005). Se usan los valores por defecto ya vivientes en `config.ts`
  (Constitución 11, mismo criterio que el supuesto RC-3 de la spec 001).
- Controles de sesión de la spec 001 (iniciar, pausar, continuar, reiniciar) y
  el contenido completo del resumen diario, salvo el incremento de
  "Completadas" que esta spec define (Decisión 005).
- Sincronización de los documentos de la spec 001 (Decisión 002 reemplaza su
  Decisión 004 / RF-08, pero esos documentos no se modifican en esta fase).

## Arquitectura y separación de responsabilidades

Se conserva la separación de la spec 001 (Constitución 9, skill
`pomodoro-domain`):

- **Dominio** (`src/domain/`): TypeScript puro, sin React ni AsyncStorage, con
  `now` inyectado. El nuevo módulo `cycle.ts` centraliza todas las reglas de
  transición entre fases y del contador (skill `pomodoro-domain` §5).
- **Persistencia** (`src/storage/`): solo guardar/recuperar; una clave nueva
  para la fase y el contador, sin tocar la clave existente (Decisión 004).
- **Orquestación** (`src/hooks/use-pomodoro-session.ts`): detecta el vencimiento
  y ejecuta, en un solo paso, las funciones puras de dominio (ciclo + registro)
  y la persistencia. No contiene reglas del ciclo.
- **Interfaz** (`src/app/index.tsx`): pintado de etiqueta de fase, contador y
  controles. No calcula transiciones.

## Archivos que se crean o modifican

| Archivo | Tipo | Responsabilidad | RF |
|---|---|---|---|
| `src/domain/cycle.ts` | nuevo | Estado del ciclo (`fase` + `pomodoros`), transición al 00:00, duración por fase, etiqueta de fase y texto del contador. | RF-01, RF-02, RF-03, RF-04, RF-08, RF-09, RF-10 |
| `src/domain/__tests__/cycle.test.ts` | nuevo | Pruebas Jest del ciclo y del contador. | ver T1 |
| `src/domain/session-record.ts` | modificado | `applyTimerCompletion` incrementa "Completadas" al terminar un estudio (exactamente una vez, con el camino único de la Decisión 009) y no toca el resumen en descansos. | RF-14, RF-15, RF-16 |
| `src/domain/__tests__/session-record.test.ts` | modificado | Nuevos casos de "Completadas" y ajuste de las expectativas que codificaban el supuesto RC-1 / Decisión 025 de la spec 001, hoy reemplazados por la Decisión 005. | ver T2 |
| `src/storage/cycle-state.ts` | nuevo | `loadCycleState` / `saveCycleState` sobre AsyncStorage con clave nueva y JSON versionado. | RF-11, RN-03 |
| `src/storage/__tests__/cycle-state.test.ts` | nuevo | Pruebas Jest con el mock oficial de AsyncStorage. | ver T3 |
| `src/hooks/use-pomodoro-session.ts` | modificado | Carga fase + contador al montar; al vencimiento ejecuta registro + ciclo + nuevo temporizador en el mismo paso; persiste cada transición. Deja de recibir la fase como parámetro fijo. | RF-05, RF-06, RF-07, RF-11 |
| `src/app/index.tsx` | modificado | Etiqueta de fase y contador "Pomodoros: x/y" en la tarjeta del temporizador; sin controles nuevos. | RF-08, RF-12, RF-13 |
| `MEMORY.md` | modificado | Solo las secciones `Estado actual` y `Próximos pasos`. | — |

No se modifican: `spec.md`, `decisiones.md`, las HU, `src/domain/timer.ts`
(la detección de 00:00 ya existe y su máquina de estados no cambia),
`src/domain/config.ts` (ya contiene las tres duraciones y
`pomodorosPerCycle`), `src/storage/study-record.ts`, `src/app/_layout.tsx`,
la navegación ni `app.json`.

### Dependencias

Ninguna nueva. Se reutilizan `jest`, `ts-jest`, `@types/jest` y
`@react-native-async-storage/async-storage`, ya autorizados e instalados en la
spec 001 (Constitución 1 y 12).

## Funciones puras de lógica

### `src/domain/cycle.ts` (nuevo)

- `type CycleState = { phase: StudyPhase; pomodoros: number }` — la fase
  actual y el contador del ciclo, tal como los persiste la Decisión 004.
- `emptyCycle()` — `{ phase: 'study', pomodoros: 0 }`; estado sin datos.
- `durationForPhase(phase)` — devuelve `studyMs`, `shortBreakMs` o
  `longBreakMs` de `DEFAULT_PHASE_DURATIONS` (Constitución 11; RC-3 de la 001).
- `advanceCycle(cycle, pomodorosPerCycle)` — única función que muta el
  contador; se llama exclusivamente en el 00:00 (Decisión 003, RF-10):
  - estudio → incrementa; si alcanza la configurada, deja `longBreak` con
    contador 0 (RF-03); si no, `shortBreak` con el contador ya incrementado
    (RF-01, RF-02).
  - descanso corto o largo → `study` con el contador intacto (RF-04, RF-09).
- `nextTimerFor(cycle)` — `createTimer(durationForPhase(cycle.phase))`: la
  siguiente fase nace en estado Inicial con su tiempo completo y, por
  `controlsFor('initial')`, el control "Iniciar" (RF-06, RF-07; Decisiones 002
  y 006).
- `phaseLabel(phase)` — `"Estudio" | "Descanso corto" | "Descanso largo"`
  (RF-08, Decisión 008).
- `pomodoroText(cycle, pomodorosPerCycle)` — `"Pomodoros: <x>/<y>"`, p. ej.
  `"Pomodoros: 2/4"` y, con el descanso largo listo, `"Pomodoros: 0/4"`
  (RF-08, Decisión 008).

### `src/domain/session-record.ts` (modificado)

- `applyTimerCompletion(record, phase, now)` — ahora también incrementa
  `day.completed` cuando `phase === 'study'`:
  - sesión sin marca: `completed += 1` (RF-14).
  - sesión marcada como incompleta: `completed += 1` e `incomplete -= 1` (si
    la marca estaba contada), sin crear sesión nueva (RF-15, Decisión 009 —
    único camino, nunca ambos).
  - descansos: sin cambios en el registro (RF-16).
  - Invariante: una sesión de estudio en curso siempre creó el día en
    `applyTimerStart`; si `day` fuera `null`, se crea con `newDay(now)` y se
    incrementa `completed` una sola vez.
- El resto de funciones (`applyTimerStart`, `applyTimerReset`,
  `deriveSummary`) no cambian: reiniciar no toca el contador del ciclo (vive
  en `cycle.ts`) ni "Completadas" (RF-10, RF-12).

### `src/storage/cycle-state.ts` (nuevo)

- `loadCycleState(): Promise<CycleState>` / `saveCycleState(cycle)`.

## Persistencia y recuperación de datos

- **Clave nueva:** `'@pomodoro/cycle-state'` (Decisión 004: "se añaden claves
  nuevas de almacenamiento; no se modifica ni invalida el formato ya guardado
  por la 001"). La clave `'@pomodoro/study-record'` y su formato `version: 1`
  no se tocan (RN-03, Constitución 5).
- **Formato:**

```json
{
  "version": 1,
  "cycle": { "phase": "study", "pomodoros": 0 }
}
```

- **Carga:** al montar la pantalla, junto con `loadStudyRecord()`. Sin dato →
  `emptyCycle()` (fase de estudio, contador 0). JSON inválido → `emptyCycle()`
  sin lanzar, con la misma limitación documentada que la spec 001.
- **Guardado:** solo cuando la fase o el contador cambian (es decir, en cada
  transición de 00:00). Pausar, continuar o reiniciar no cambian la fase ni el
  contador, así que no escriben esta clave. Tras cada escritura del registro de
  estudio también se guarda el ciclo si cambió, en el mismo paso.
- El tiempo restante de la fase **no** se persiste (fuera de alcance,
  HU-003 / Decisión 004).

## Algoritmos en pseudocódigo

### 1. Transición al 00:00 (RF-01, RF-02, RF-03, RF-04, RF-06, RF-07, RF-09, RF-10; Decisiones 002 y 003)

```
avanzarCiclo(ciclo, configurados):
  si ciclo.fase != estudio:
      devolver { fase: estudio, pomodoros: ciclo.pomodoros }   // RF-04, RF-09
  pomodoros = ciclo.pomodoros + 1                              // RF-02
  si pomodoros >= configurados:                                // RF-03
      devolver { fase: descansoLargo, pomodoros: 0 }           // vuelve a cero
  devolver { fase: descansoCorto, pomodoros }                  // RF-01

alVencer(temporizador, ciclo, registro, ahora):   // llamado por el hook
  // El temporizador reporta 00:00; nunca se pinta: misma actualización de estado
  registro' = aplicarFinalizacion(registro, ciclo.fase, ahora) // RF-14..16
  ciclo'    = avanzarCiclo(ciclo, configurados)                // RF-01..04
  tiempo'   = crearTemporizador(duracionPara(ciclo'.phase))    // Inicial completo
  persistir(registro'); persistir(ciclo')
  devolver { temporizador: tiempo', ciclo: ciclo', registro: registro' }
```

- RF-06: `finished` es un estado interno de detección que se reemplaza en la
  misma actualización de estado de React; la pantalla nunca lo pinta.
- RF-07: `tiempo'` nace en Inicial; solo "Iniciar" lo arranca.
- RF-10: `avanzarCiclo` es el único punto que muta el contador y solo se
  invoca en el 00:00; reiniciar una sesión no lo toca.

### 2. Resumen diario en el 00:00 (RF-14, RF-15, RF-16; Decisiones 005 y 009)

```
aplicarFinalizacion(registro, fase, ahora):
  registro = aplicarCorte(registro, ahora, completar, fase, sesionEnCurso=true)
  si fase != estudio: devolver registro        // RF-16: descansos no tocan nada
  dia = registro.day ?? nuevoDia(ahora)
  si registro.sessionMarked:                   // RF-15: camino único (Decisión 009)
      sessionMarked = false
      si dia.markCounted: dia.incomplete -= 1; dia.markCounted = false
  dia.completed += 1                            // RF-14 o RF-15: exactamente una vez
  devolver registro con dia y sessionMarked=false
```

### 3. Carga al abrir la aplicación (RF-05, RF-11; Decisión 006)

```
alMontar():
  registro = cargarEstudio()
  ciclo    = cargarCiclo()            // fase + contador; sin dato: estudio, 0
  temporizador = crearTemporizador(duracionPara(ciclo.phase))   // Inicial completo
  // La regla de transición es única: la misma del algoritmo 1.
```

### 4. Reiniciar (RF-12; Decisión 007)

```
reiniciar():
  temporizador = reiniciarTemporizador(temporizador)   // tiempo inicial de la fase
  registro     = aplicarReinicio(registro, fase, estadoAnterior, ahora)
  // ciclo NO se toca: contador intacto; en descanso, el resumen tampoco (RF-12)
```

## Cómo se pinta en la interfaz

`src/app/index.tsx`, respetando `cotopaxi-brand` y `rn-conventions`:

- **Fila de avance** en la tarjeta del temporizador, sobre el tiempo:
  - Etiqueta de fase en azul marino `#181759`, tipografía clara y en español
    exacto: "Estudio", "Descanso corto", "Descanso largo" (Decisión 008).
  - Debajo, el contador en dorado `#C69214` como acento:
    `"Pomodoros: <x>/<y>"` (Decisión 008). Ambos textos se leen sin depender
    del color (lista manual de `rn-conventions`).
- **El resto de la pantalla no cambia**: mismos controles por estado, sin
  ningún botón nuevo — no existe control para saltar un descanso (RF-13,
  Decisión 007). El diálogo de reinicio sigue siendo el de la spec 001.
- Al llegar a 00:00 la tarjeta muestra de inmediato el tiempo completo de la
  nueva fase y el control "Iniciar" (RF-06, RF-07); nunca se ve una fase con
  "Finalizado" ni el tiempo en cero.
- Objetivos táctiles ≥ 44×44 y `accessibilityLabel` en los botones, ya
  cumplidos; textos visibles todos en español; StyleSheet, sin librerías nuevas.

## Decisiones técnicas justificadas (con alternativa descartada)

| # | Decisión | Justificación | Alternativa descartada |
|---|---|---|---|
| DT-1 | Estado del ciclo como tipo propio (`CycleState`) en `domain/cycle.ts`, con `advanceCycle` como única mutación del contador | Centraliza las transiciones en dominio puro (skill `pomodoro-domain` §5, RF-10) y hace el ciclo comprobable sin React ni storage (RN-01, Constitución 9) | Repartir `if (phase === 'study')` por la pantalla y el hook: lógica duplicada e imposible de probar con Jest |
| DT-2 | Detección de 00:00 en `tick` (sin tocar `timer.ts`) y transición inmediata en el hook dentro de la misma actualización de estado | Cumple RF-06 sin reescribir la máquina de estados aprobada en la spec 001; `finished` pasa a ser interno e invisible | Modificar `tick` para que devuelva la siguiente fase: mezclaría el ciclo Pomodoro en el temporizador genérico y rompería las suites de la 001 (Constitución 12) |
| DT-3 | Clave nueva `@pomodoro/cycle-state` con su propio JSON `version` (Decisión 004) | Añade claves sin alterar ni invalidar `@pomodoro/study-record` (RN-03, Constitución 5) | Ampliar el payload de `study-record`: modificaría un formato persistido ya en uso, prohibido sin autorización |
| DT-4 | Guardar el ciclo solo en las transiciones de 00:00 | La fase y el contador solo cambian ahí; evita escrituras cada 500 ms en AsyncStorage (constitución 1, skill `pomodoro-domain` §6) | Persistir en cada tick o en pausar/continuar: escrituras inútiles con riesgo de desgaste y sin beneficio |
| DT-5 | Duraciones tomadas de `DEFAULT_PHASE_DURATIONS` vía `durationForPhase` | Los valores aprobados ya viven en `config.ts` (HU-005 por defecto, Constitución 11); HU-005 lo sustituirá por valores configurados sin tocar el ciclo | Hardcodear tiempos dentro de `cycle.ts`: duplicaría valores y rompería la futura HU-005 |
| DT-6 | "Completadas" se incrementa dentro de `applyTimerCompletion`, con `phase === 'study'` como única puerta y el camino único de la Decisión 009 para sesiones marcadas | Misma regla y mismo instante que el contador del ciclo (Decisión 005), sin doble conteo (Decisión 009, RF-14 vs RF-15) | Incrementar al iniciar o pintar: no coincide con "en el 00:00" y duplicaría sesiones marcadas |
| DT-7 | Jest con `ts-jest` ya configurado, sin librerías de prueba de componentes | Misma estrategia que la spec 001; la interfaz se verifica manualmente en Expo Go (AGENTS.md); cero dependencias nuevas | Añadir `jest-expo`/Testing Library para probar el hook: dependencia nueva sin autorización (Constitución 1 y 12) |

## Nota sobre RF-05 (alcance verificable)

Decisión 006 aplica "la regla general": una sola transición, sin camino
especial para la app cerrada. Con el temporizador basado en marcas de tiempo
(DT-1 de la 001), el caso "celular bloqueado o app en segundo plano" se cubre
sin nada añadido: al volver, el intervalo recalcula el restante, detecta 00:00
y ejecuta el algoritmo 1 → la siguiente fase aparece lista en Inicial.

Caso "app cerrada por completo y reabierta": el tiempo restante de la fase no
se persiste (fuera de alcance, HU-003 / Decisión 004), por lo que esta spec
garantiza lo que le pertenece — la fase y el contador se conservan (RF-11) y,
cuando el vencimiento sea detectable con la recuperación de la HU-003, se
aplicará exactamente la misma transición. Esta limitación se documenta en el
informe de verificación; no es una decisión nueva de producto.

## Estrategia de pruebas con Jest

Todas las suites son puras, inyectan `now` y no usan esperas reales. Comandos:
`npx jest` y `npx tsc --noEmit`.

- **`src/domain/__tests__/cycle.test.ts`** (T1)
  - Estudio que llega a 00:00 bajo el umbral → descanso corto con contador +1
    (RF-01, RF-02).
  - Estudio que alcanza la cantidad configurada (4) → descanso largo con
    contador 0 (RF-03).
  - Descanso corto y largo que llegan a 00:00 → estudio con el contador
    intacto (RF-04, RF-09).
  - El contador solo lo muta `advanceCycle`; una sesión reiniciada y luego
    completada suma una sola vez (RF-10, Decisión 003 / Decisión 027 de 001).
  - `nextTimerFor` devuelve un temporizador en Inicial con la duración
    completa de la fase (RF-06, RF-07).
  - `phaseLabel` y `pomodoroText` producen los textos exactos de la Decisión
    008, incluido "Pomodoros: 0/4" con el descanso largo listo (RF-08).
- **`src/domain/__tests__/session-record.test.ts`** (T2)
  - Completar un estudio sin marca incrementa `completed` una sola vez
    (RF-14).
  - Completar un estudio marcado: `completed + 1` e `incomplete - 1`, sin
    sesión nueva y sin doble incremento (RF-15, Decisión 009).
  - Completar un descanso no modifica el registro (RF-16).
  - Se ajustan las expectativas de la 001 que codificaban RC-1/Decisión 025
    ("completed no se incrementa"), hoy sustituidas por la Decisión 005; el
    resto de casos (corte, marca, resumen) queda igual y sigue pasando.
- **`src/storage/__tests__/cycle-state.test.ts`** (T3)
  - Roundtrip guardar/recuperar; sin dato → `emptyCycle()`; JSON inválido no
    lanza; la clave `@pomodoro/study-record` se conserva intacta (RN-03).
- **Suite completa `npx jest`** (T4 y T6): sin regresiones en las suites de la
  spec 001 (timer y study-record).

Fuera de Jest (verificación manual en Expo Go): transición visible al 00:00,
etiqueta de fase, contador, persistencia al cerrar/abrir y ausencia de
controles nuevos — checklist en `tasks.md`.

## Cobertura de RF

| RF | Parte del plan |
|---|---|
| RF-01 | `cycle.ts` (`advanceCycle`) + hook + `index.tsx` |
| RF-02 | `cycle.ts` (`advanceCycle`) |
| RF-03 | `cycle.ts` (`advanceCycle`) |
| RF-04 | `cycle.ts` (`advanceCycle`) |
| RF-05 | hook (misma transición al volver) + `storage/cycle-state.ts` (nota de alcance) |
| RF-06 | hook (reemplazo en la misma actualización) + `cycle.ts` (`nextTimerFor`) + `index.tsx` |
| RF-07 | `cycle.ts` (`nextTimerFor` → Inicial) + `timer.controlsFor` + `index.tsx` |
| RF-08 | `cycle.ts` (`phaseLabel`, `pomodoroText`) + `index.tsx` |
| RF-09 | `cycle.ts` (`advanceCycle`) |
| RF-10 | `cycle.ts` (única mutación en 00:00) + `session-record` (reinicio no lo toca) |
| RF-11 | `storage/cycle-state.ts` + hook (carga/guardado) |
| RF-12 | `session-record` (`applyTimerReset` sin cambios) + hook (ciclo intacto) + `index.tsx` (diálogo existente) |
| RF-13 | `index.tsx` (sin controles nuevos) + `controlsFor` sin cambios |
| RF-14 | `session-record` (`applyTimerCompletion`) |
| RF-15 | `session-record` (`applyTimerCompletion`, camino Decisión 009) |
| RF-16 | `session-record` (puerta `phase === 'study'`) |
| RN-01 | `cycle.ts` puro, probado sin React ni storage |
| RN-02 | suites Jest de las tres tareas de lógica |
| RN-03 | clave nueva, `study-record` intacta (prueba específica en T3) |
| RN-04 | una sola función de transición (`advanceCycle` vía `alVencer`), sin rama por origen |
