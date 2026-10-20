# Plan 003 — Mantener el conteo con el celular bloqueado o la aplicación cerrada

Fuentes: `specs/003-conteo-celular-bloqueado/spec.md` (Estado: Aprobado, sin
`[NECESITA ACLARACIÓN]`), `specs/003-conteo-celular-bloqueado/decisiones.md`
(Decisiones 001–010), `docs/historias/HU-003.md`, `docs/constitution.md` y los
planes de las specs 001 y 002 (arquitectura y código existentes).

## Alcance estricto

Dentro de alcance: persistir el estado del temporizador junto con la fase y el
contador, reconstruir el tiempo restante al volver (desbloqueo, primer plano,
reapertura), procesar el vencimiento ocurrido con la app cerrada o el celular
bloqueado, conservar la fase pausada con su restante congelado y detectar el
salto anómalo del reloj (retroceso) dándola por vencida con el mismo camino de
vencimiento.

Fuera de alcance (no se toca nada de esto en esta spec):

- Avisos de finalización, sonido, vibración, pantalla de bloqueo y permisos
  (HU-004). El escenario "el tiempo termina con la aplicación cerrada" se cubre
  solo en cuanto a recuperación, estado de la fase, contador del ciclo y
  resumen diario (Decisión 002; fuera de alcance de la spec).
- Ejecución de la cuenta en segundo plano (Decisión 008; RN-05).
- Configuración de duraciones y pomodoros por ciclo (HU-005). Se siguen usando
  los valores de `DEFAULT_PHASE_DURATIONS` (Constitución 11).
- Controles de sesión de la spec 001 y las reglas de transición, contador y
  resumen diario de la spec 002; esta spec los reutiliza sin modificarlos
  (Decisión 002; Decisión 007). En particular, `applyTimerCompletion` y
  `advanceCycle` no cambian.
- Pantalla de ajustes, navegación ni `app.json`.

## Arquitectura y separación de responsabilidades

Se conserva la separación aprobada (Constitución 9; skill `pomodoro-domain`):

- **Dominio** (`src/domain/`): TypeScript puro, con `now` inyectado, sin
  React ni AsyncStorage. El nuevo módulo `session-recovery.ts` concentra la
  evaluación del temporizador (restante, vencimiento y salto anómalo) y la
  recuperación de la sesión. `timer.ts`, `cycle.ts` y `session-record.ts` no
  se modifican.
- **Persistencia** (`src/storage/cycle-state.ts`): única clave
  `@pomodoro/cycle-state`, ampliada a `version: 2` con el campo `timer`
  (Decisión 001; Decisión 009). `study-record.ts` no se toca.
- **Orquestación** (`src/hooks/use-pomodoro-session.ts`): al montar, recupera
  la sesión y procesa un vencimiento pendiente con la hora actual de reabrir
  (Decisión 007); con la app abierta, evalúa el temporizador en cada
  actualización de reloj y al volver al frente (AppState, Decisión 008);
  persiste solo en transiciones (Decisión 004).
- **Interfaz** (`src/app/index.tsx`): sin cambios previstos. El hook expone la
  misma forma (`cycle`, `timer`, `remaining`, `controls`, `summary`), por lo
  que la pantalla pinta el resultado de la recuperación sin saber que existe.

## Archivos que se crean o modifican

| Archivo | Tipo | Responsabilidad | RF |
|---|---|---|---|
| `src/domain/session-recovery.ts` | nuevo | Evaluación pura del temporizador (restante crudo, vencimiento, salto anómalo) y recuperación de la sesión almacenada (Corriendo, Pausada, Inicial o sin `timer`). | RF-02, RF-03, RF-04, RF-06, RF-09, RF-10, RF-11, RF-12, RF-13, RF-14 |
| `src/domain/__tests__/session-recovery.test.ts` | nuevo | Pruebas Jest de evaluación y recuperación. | ver T1, T2 |
| `src/storage/cycle-state.ts` | modificado | `version: 2` con campo `timer`; `loadCycleState` devuelve `{ cycle, timer }` (`timer: null` en v1 o dato inválido) y el guardado recibe la sesión completa. | RF-01, RF-05 |
| `src/storage/__tests__/cycle-state.test.ts` | modificado | Roundtrip v2, compatibilidad v1 (sin `timer`), JSON inválido, clave `@pomodoro/study-record` intacta. | ver T3 |
| `src/hooks/use-pomodoro-session.ts` | modificado | Recuperación al montar; vencimiento (normal o por salto anómalo) procesado con la hora actual vía el camino único `applyTimerCompletion` + `advanceCycle` + `nextTimerFor`; listener de AppState para recalcular al volver al frente; persistencia de `{ cycle, timer }` en cada transición (iniciar, pausar, continuar, reiniciar, 00:00). | RF-02, RF-03, RF-05, RF-06, RF-07, RF-08, RF-09, RF-15 |
| `MEMORY.md` | modificado | Solo las secciones `Estado actual` y `Próximos pasos`. | — |

No se modifican: `spec.md`, `decisiones.md`, las HU, `src/domain/timer.ts`,
`src/domain/cycle.ts`, `src/domain/session-record.ts`, `src/domain/config.ts`,
`src/storage/study-record.ts`, `src/app/index.tsx`, `src/app/_layout.tsx`, la
navegación ni `app.json`.

### Dependencias

Ninguna nueva. Se reutilizan `jest`, `ts-jest`, `@types/jest` y
`@react-native-async-storage/async-storage`, ya autorizados en la spec 001
(Constitución 1 y 12). `AppState` es parte de `react-native`, ya incluida.

## Funciones puras de lógica

### `src/domain/session-recovery.ts` (nuevo)

- `type TimerEvaluation = { kind: 'running' | 'expired' | 'expiredByClockJump'; remainingMs: number }`
- `evaluateTimer(t: Timer, now: number): TimerEvaluation` — solo tiene
  significado con `t.state === 'running'` (con Pausada o Inicial devuelve
  `kind: 'running'` con el restante congelado, que es lo que ya hace
  `remainingMs`):
  - `crudo = t.remainingMs - (now - t.runningSinceMs)` (sin clamar a 0).
  - `crudo <= 0` → `expired`: vencimiento normal (RF-09, RF-13; se prioriza
    sobre la detección de salto, Decisión 010).
  - `crudo > t.remainingMs` → `expiredByClockJump`: el reloj retrocedió
    respecto del instante en que se inició o continuó la fase, porque el hook
    nunca guarda los ticks intermedios y `t.remainingMs` sigue siendo la base
    del arranque (RF-11; Decisión 003 P9 y Decisión 010).
  - En caso contrario → `running` con `remainingMs = crudo` (RF-02, RF-03,
    RF-04; RN-04).
- `type RecoveryOutcome = { action: 'restore' | 'complete' | 'none'; timer: Timer }`
- `recoverSession(stored: { cycle: CycleState; timer: Timer | null }, now: number): RecoveryOutcome`
  - `timer === null` (clave v1 sin `timer`) o estado distinto de
    `running`/`paused` → `none` con `createTimer(durationForPhase(cycle.phase))`:
    la fase guardada se muestra en Inicial con su tiempo completo (Decisión
    009; RF-01).
  - `paused` → `none` conservando el temporizador pausado con el restante
    congelado: no se reanuda solo, sin aviso (RF-06, RF-07, RF-12;
    Decisión 005).
  - `running` con `evaluateTimer` en `running` → `restore` con el temporizador
    normalizado: `runningSinceMs = now` y `remainingMs = crudo` (RF-02,
    RF-03).
  - `running` con `evaluateTimer` en `expired` o `expiredByClockJump` →
    `complete`: el hook procesa el vencimiento con la hora actual de reapertura
    (RF-08, RF-09, RF-10, RF-11; Decisión 002, Decisión 007, Decisión 010).
    Ningún caso muestra señal visible al estudiante (RF-14).

### `src/storage/cycle-state.ts` (modificado)

- `loadCycleState(): Promise<{ cycle: CycleState; timer: Timer | null }>` —
  `version: 2`; un v1 sin `timer` devuelve `timer: null` respetando fase y
  pomodoros (Decisión 009).
- `saveCycleState(session: { cycle: CycleState; timer: Timer })` — serializa
  `version: 2`, `cycle` y `timer`.

## Persistencia y recuperación de datos

- **Misma clave:** `'@pomodoro/cycle-state'`, ahora `version: 2` con un campo
  `timer` adicional (Decisión 001; Decisión 009). `'@pomodoro/study-record'`
  y su formato no se tocan (RN-03, Constitución 5).

```json
{
  "version": 2,
  "cycle": { "phase": "study", "pomodoros": 1 },
  "timer": {
    "state": "running",
    "durationMs": 1500000,
    "remainingMs": 900000,
    "runningSinceMs": 1760000000000
  }
}
```

- **Compatibilidad v1:** al leer un v1 sin `timer`, se respetan la fase y los
  pomodoros y el temporizador se reconstruye en Inicial con el tiempo completo
  de la fase guardada (Decisión 009).
- **Guardado:** solo en transiciones — iniciar, pausar, continuar, reiniciar y
  al llegar a 00:00 (Decisión 004; RF-05). No hay escrituras periódicas.
- **Carga:** al montar la pantalla, junto con `loadStudyRecord()`. JSON
  inválido → `emptyCycle()` y `timer: null`, sin lanzar (misma limitación
  documentada que en specs 001 y 002).

## Algoritmos en pseudocódigo

### 1. Evaluación del temporizador (RF-02, RF-03, RF-04, RF-09, RF-11, RF-13, RF-14)

```
evaluarTemporizador(t, ahora):
  si t.estado != corriendo o t.runningSinceMs == nulo:
      devolver { clase: corriendo, restante: t.remainingMs }   // pausado/inicial: congelado
  crudo = t.remainingMs - (ahora - t.runningSinceMs)           // sin clamar a 0
  si crudo <= 0:
      devolver { clase: vencido }                              // RF-13: vencimiento normal, sin lógica de salto
  si crudo > t.remainingMs:
      devolver { clase: vencidoPorSalto }                      // RF-11: reloj retrocedió; RF-14: sin señal visible
  devolver { clase: corriendo, restante: crudo }               // RF-02, RF-03
```

- Invariante clave: el hook nunca guarda los resultados intermedios de `tick`
  en el estado, por lo que `t.remainingMs` sigue siendo la base del iniciar o
  continuar; `crudo > base` solo puede ocurrir si el reloj retrocedió.

### 2. Recuperación al abrir (RF-01, RF-06, RF-08; Decisiones 005, 009, 010)

```
recuperarSesion(almacenado, ahora):
  si almacenado.temporizador es nulo o su estado no es corriendo ni pausado:
      devolver { accion: ninguna, temporizador: crearTemporizador(duracionPara(almacenado.ciclo.fase)) }
      // Decisión 009 (v1) o estado no persistible: Inicial con tiempo completo
  si almacenado.temporizador.estado == pausado:
      devolver { accion: ninguna, temporizador: almacenado.temporizador }   // RF-06, RF-12: congelado, sin aviso (RF-07)
  evaluacion = evaluarTemporizador(almacenado.temporizador, ahora)
  si evaluacion.clase == corriendo:
      devolver { accion: restaurar, temporizador: { ...temporizador, runningSinceMs: ahora, remainingMs: evaluacion.restante } }
  devolver { accion: completar, temporizador: almacenado.temporizador }     // RF-08, RF-10, RF-11
```

### 3. Procesamiento del vencimiento, con app abierta o recuperado (RF-08, RF-09; Decisiones 002 y 007)

Mismo camino único que el algoritmo 1 de la spec 002; no se calcula una hora
exacta de vencimiento, el instante del suceso es la hora actual (Decisión 007):

```
alVencer(ahora):                          // llamado por el hook, app abierta o al reabrir
  registro' = aplicarFinalizacion(registro, ciclo.fase, ahora)   // hora real de reapertura; corte del día evaluado aquí (consecuencia asumida, D-007)
  ciclo'    = avanzarCiclo(ciclo, configurados)
  tiempo'   = crearTemporizador(duracionPara(ciclo'.fase))       // Inicial completo con "Iniciar" (RF-08, RF-10)
  persistir({ ciclo: registro'/ciclo', temporizador: tiempo' })  // D-004: también en el 00:00
```

### 4. Flujo del hook (RF-05, RF-15; Decisión 004; Decisión 008)

```
alMontar():
  registro = cargarEstudio()
  almacenado = cargarCiclo()                       // { ciclo, temporizador|null }
  resultado = recuperarSesion(almacenado, Date.now())
  si resultado.accion == completar: alVencer(Date.now())    // RF-09: hora de reapertura
  si no: registrar temporizador = resultado.temporizador
  registrar cargado = verdadero

alCambiarAhora() / AppState pasa a 'active':        // D-008: sin tareas en segundo plano; solo al volver al frente
  ahora = Date.now()
  si temporizador.estado == corriendo:
      evaluacion = evaluarTemporizador(temporizador, ahora)
      si evaluacion.clase != corriendo: alVencer(ahora)   // vencimiento normal o por salto, mismo camino
```

- `start`, `pause`, `resume`, `reset` persisten `{ cycle, timer }` en el
  instante de la transición (Decisión 004). `reset` sigue sin tocar el ciclo
  ni el resumen (spec 002).

## Cómo se pinta en la interfaz

`src/app/index.tsx` no requiere cambios de código: la pantalla ya pinta
`session.remaining`, `session.controls` y `session.summary`, y el hook expone
la sesión recuperada con la misma forma. Lo que se comprueba manualmente en
Expo Go (lista de `tasks.md`):

- Con fase Corriendo, bloquear y desbloquear: el tiempo mostrado baja en
  exactamente lo transcurrido y el control sigue siendo "Pausar" (RF-02).
- Cerrar la app y reabrirla con la fase Corriendo: se muestra el restante
  correcto, sin salto ni reinicio (RF-03).
- Cerrar con la fase Pausada y reabrir: mismo restante congelado, control
  "Continuar", sin reanudación automática y sin ningún aviso (RF-06, RF-07).
- Reabrir con la fase ya vencida: la siguiente fase aparece en Inicial con su
  tiempo completo y el control "Iniciar"; nunca se ve tiempo negativo ni
  "Finalizado" (RF-08, RF-10); el contador del ciclo y "Completadas" se
  actualizan según la spec 002 (Decisión 007).
- Sin textos nuevos ni cambios visuales: textos en español, colores
  `cotopaxi-brand` intactos, objetivos táctiles ≥ 44×44, orientación retrato y
  legibilidad sin depender del color (lista manual de `rn-conventions`).

## Decisiones técnicas justificadas (con alternativa descartada)

| # | Decisión | Justificación | Alternativa descartada |
|---|---|---|---|
| DT-1 | Nuevo módulo puro `domain/session-recovery.ts` con `evaluateTimer` y `recoverSession`, sin tocar `timer.ts` | RN-01 exige probar recuperación, vencimiento y salto sin React ni storage; no se modifica el temporizador aprobado en la spec 001 (Constitución 12) | Añadir la detección dentro de `tick` de `timer.ts`: mezclaría la recuperación de sesión en el temporizador genérico y rompería las suites aprobadas de la 001 |
| DT-2 | Detección del salto por comparación `crudo > t.remainingMs`, sin campo adicional ni margen | El hook nunca persiste ticks intermedios (Decisión 004), de modo que `remainingMs` es establemente la base del iniciar/continuar; `crudo > base` implica retroceso del reloj. Sin margen, como exige la Decisión 003 P9 | Guardar un campo `baseRemainingMs` aparte: redundante con el invariante existente; añadir un margen tolerado: prohibido por la Decisión 003 P9 ("no se aplica ningún margen") |
| DT-3 | Ampliar `@pomodoro/cycle-state` a `version: 2` con campo `timer` y lectura compatible con v1 (Decisión 009) | Una sola fuente de verdad; no invalida ni pierde los datos de las specs 001 y 002 (Constitución 5) | Clave nueva `@pomodoro/timer`: dos claves para un mismo estado de sesión, contraída por la Decisión 001 ("evita dos fuentes de verdad") |
| DT-4 | Guardado solo en transiciones: iniciar, pausar, continuar, reiniciar y 00:00 (Decisión 004; RF-05) | `runningSinceMs` + `remainingMs` permiten reconstruir el restante sin escrituras repetidas; un guardado periódico desgastaría AsyncStorage sin mejorar la exactitud (Constitución 1 y 3) | Persistir en cada tick (500 ms): desgaste inútil del almacenamiento; ya fue descartado en la Decisión 004 |
| DT-5 | Recálculo por reloj al montar y con listener de `AppState` al volver al frente; sin tareas en segundo plano (Decisión 008) | El restante se deriva del reloj de pared, por lo que basta recalcular al volver; cumple RN-05 y documenta la limitación de plataforma (RN-06, Constitución 6 y 7) | `BackgroundFetch`/timers en segundo plano: dependencia y capacidad no garantizadas por Expo/React Native, prohibidas sin autorización (Constitución 1 y 12) y declaradas fuera de alcance |
| DT-6 | El vencimiento recuperado se procesa en el momento de reabrir con `Date.now()` de reapertura, reutilizando `applyTimerCompletion` + `advanceCycle` (Decisión 007) | Camino único ya aprobado en la spec 002; mantiene coherentes contador del ciclo y resumen diario (Constitución 3 y 4). Consecuencia asumida en la Decisión 007: el corte del día se evalúa con la hora de reapertura | Calcular una "hora exacta de vencimiento" y retrotraer el registro: cálculo nuevo, riesgo de doble conteo y explícitamente descartado por la Decisión 007 |
| DT-7 | Normalizar el temporizador restaurado (`runningSinceMs = now`, `remainingMs = crudo`) | Equivalente puro al reloj correcto y evita conservar marcas temporales obsoletas que harían depender la próxima evaluación de valores viejos; el restante mostrado no cambia | Restaurar el temporizador con sus marcas antiguas sin normalizar: correcto a corto plazo, pero deja `runningSinceMs` en el pasado y complica el razonamiento sobre el invariante de DT-2 |
| DT-8 | Estrategia de pruebas: Jest puro con `now` inyectado para dominio y storage; verificación manual en Expo Go para la interfaz | Misma estrategia aprobada en las specs 001 y 002; cero dependencias nuevas (Constitución 1 y 12) | Añadir `jest-expo` o Testing Library para probar el hook: dependencia nueva sin autorización; la verificación manual en Expo Go es la regla del proyecto (AGENTS.md) |

## Estrategia de pruebas con Jest

Todas las suites son puras, inyectan `now` y no usan esperas reales. Comandos:
`npx jest` y `npx tsc --noEmit`.

- **`src/domain/__tests__/session-recovery.test.ts`** (T1 y T2)
  - `evaluateTimer` con Corriendo: restante exacto antes del vencimiento
    (RF-02, RF-03, RF-04); `crudo <= 0` → vencimiento normal (RF-09, RF-13);
    reloj retrocedido (`now < runningSinceMs`) → `expiredByClockJump`
    (RF-11); Pausada → restante congelado, nunca vencida por el reloj
    (RF-12); ninguna rama produce señal visible (RF-14, verificado por la
    ausencia de campos de aviso en el resultado).
  - `recoverSession`: v1 sin `timer` → Inicial con tiempo completo de la fase
    guardada (RF-01, Decisión 009); Pausada → conservada sin reanudar
    (RF-06, RF-07); Corriendo viva → `restore` normalizado con el restante
    descontado (RF-02, RF-03); Corriendo vencida → `complete` (RF-08);
    Corriendo con salto → `complete` (RF-11); estado inexistente → Inicial
    completo.
- **`src/storage/__tests__/cycle-state.test.ts`** (T3)
  - Roundtrip v2 guardar/recuperar `{ cycle, timer }`; v1 sin `timer` →
    `timer: null` con fase y pomodoros intactos (Decisión 009); JSON inválido
    no lanza; la clave `@pomodoro/study-record` queda intacta (RN-03).
- **Suite completa `npx jest`** (T4 y T6): sin regresiones en las suites de
  las specs 001 y 002 (`timer`, `cycle`, `study-record`, `session-record`,
  `smoke`).

Fuera de Jest (verificación manual en Expo Go): bloqueo/desbloqueo, cierre y
reapertura, pausa recuperada y vencimiento con la app cerrada — checklist en
`tasks.md`.

## Cobertura de RF

| RF | Parte del plan |
|---|---|
| RF-01 | `storage/cycle-state.ts` (v2 con `timer`, compat v1) + `session-recovery.ts` (`recoverSession`) |
| RF-02 | `session-recovery.ts` (`evaluateTimer`, `recoverSession`) + hook (AppState + recálculo) |
| RF-03 | `session-recovery.ts` (recuperación al montar) + hook |
| RF-04 | `session-recovery.ts` (`evaluateTimer` deriva del reloj; sin tareas en segundo plano) |
| RF-05 | `storage/cycle-state.ts` + hook (guardado solo en transiciones, Decisión 004) |
| RF-06 | `session-recovery.ts` (rama Pausada) + `controlsFor('paused')` → "Continuar" + `index.tsx` sin cambios |
| RF-07 | `session-recovery.ts` (Pausada no genera `complete`) + hook (sin procesar vencimiento en pausa) |
| RF-08 | hook (`alVencer` con hora de reapertura, camino único spec 002) + `cycle.ts` sin cambios |
| RF-09 | `session-recovery.ts` (`complete` se procesa en el instante de reabrir; Decisión 007) |
| RF-10 | `cycle.ts` (`nextTimerFor` → Inicial completo) + hook (sin arrastre de excedente) |
| RF-11 | `session-recovery.ts` (`expiredByClockJump` → mismo camino de vencimiento) |
| RF-12 | `session-recovery.ts` (la detección solo aplica a Corriendo) |
| RF-13 | `session-recovery.ts` (orden de evaluación: `crudo <= 0` antes que el salto) |
| RF-14 | `session-recovery.ts` (resultado sin señales visibles) + `index.tsx` sin textos nuevos |
| RF-15 | hook (solo AppState y recálculo por reloj; ningún temporizador en segundo plano; sin notificaciones) |
| RN-01 | `session-recovery.ts` puro, probado sin React ni storage |
| RN-02 | suites Jest de T1–T3 |
| RN-03 | misma clave con compat v1; `study-record` intacta (prueba específica en T3) |
| RN-04 | `evaluateTimer` deriva siempre del reloj inyectado |
| RN-05 | sin dependencias de ejecución en segundo plano (DT-5) |
| RN-06 | limitación de plataforma documentada en el informe de verificación de T5/T6 (Decisión 008) |
