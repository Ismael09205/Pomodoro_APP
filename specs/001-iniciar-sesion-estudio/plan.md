# Plan 001 — Iniciar y controlar una sesión de estudio

Fuentes: `specs/001-iniciar-sesion-estudio/spec.md` (Estado: aprobada, sin
`[NECESITA ACLARACIÓN]`), `specs/001-iniciar-sesion-estudio/decisiones.md`
(Decisiones 002–027), `docs/historias/HU-001.md` y `docs/constitution.md`.

## Alcance estricto

Dentro de alcance: control del temporizador (iniciar, pausar, continuar,
reiniciar con confirmación), comportamiento al llegar a 00:00, formato del
tiempo, registro y resumen de sesiones de estudio del día de uso.

Fuera de alcance (no se toca nada de esto en esta spec):

- Transición automática de fase al llegar a 00:00 (Decisión 004, HU-002).
- Avisos, sonido, vibración y permisos (HU-004).
- Pantalla de ajustes y persistencia de duraciones (HU-005). El temporizador
  usa el valor por defecto de la HU-005 (ver supuesto RC-3).
- Incremento del contador de sesiones completadas (Decisión 025, HU-002).
- Recuperación del temporizador al cerrar o reabrir la aplicación
  (Decisión 026, HU-003). Al reabrir, el temporizador arranca en Inicial.
- Reglas completas del ciclo de pomodoros (HU-002).

## Arquitectura y separación de responsabilidades

Separación exigida por la constitución 9 y la skill `pomodoro-domain`:

- **Dominio** (`src/domain/`): TypeScript puro. Sin React, sin AsyncStorage,
  sin `Date.now()` oculto: todo instante llega como parámetro `now` para que
  las pruebas sean deterministas.
- **Persistencia** (`src/storage/`): envoltorio de AsyncStorage. Solo
  guardar/recuperar; ninguna regla de negocio.
- **Orquestación** (`src/hooks/`): hook React que conecta dominio, storage y
  pantalla. Traduce eventos de UI en llamadas al dominio y persiste después
  de cada mutación. No contiene reglas del temporizador ni del registro.
- **Interfaz** (`src/app/index.tsx`): pintado, textos y diálogo. No calcula
  tiempos ni decide transiciones.

## Archivos que se crean o modifican

| Archivo | Tipo | Responsabilidad | RF |
|---|---|---|---|
| `src/domain/config.ts` | nuevo | Duraciones por defecto de las fases (estudio 25 min, según HU-005) y constantes del dominio. Único punto que HU-002/HU-005 ampliarán después. | RF-01 |
| `src/domain/timer.ts` | nuevo | Máquina de estados pura del temporizador: crear, iniciar, pausar, continuar, reiniciar, calcular restante, detectar vencimiento, formatear tiempo y mapear controles por estado. | RF-01, RF-02, RF-04, RF-06, RF-07, RF-08, RF-09, RNF-01 |
| `src/domain/session-record.ts` | nuevo | Registro de sesiones y día de uso: marca de sesión incompleta, retiro de la marca al completar, corte de 24 h, reinicio de contadores y derivación del resumen. | RF-10, RF-12, RF-13, RF-14, RF-15, RF-16, RF-17 |
| `src/domain/__tests__/timer.test.ts` | nuevo | Pruebas Jest del temporizador. | ver T2 |
| `src/domain/__tests__/session-record.test.ts` | nuevo | Pruebas Jest del registro y del día de uso. | ver T3, T4 |
| `src/storage/study-record.ts` | nuevo | `loadStudyRecord` / `saveStudyRecord` sobre AsyncStorage con clave única y JSON. | RF-11 |
| `src/storage/__tests__/study-record.test.ts` | nuevo | Pruebas Jest con el mock oficial de AsyncStorage. | ver T5 |
| `src/hooks/use-pomodoro-session.ts` | nuevo | Hook React: carga el registro al montar, intervalo de refresco basado en marcas de tiempo, ejecuta transiciones del dominio y persiste. | RF-01, RF-02, RF-11, RF-16 |
| `src/app/index.tsx` | modificado | Se convierte en la pantalla principal de la app (hoy es la pantalla de bienvenida del template de Expo; su reemplazo es el alcance de esta spec). Pinta tiempo, controles, diálogo y tarjeta de resumen. | RF-01, RF-03, RF-05, RF-06, RF-07, RF-08, RF-09, RF-12, RF-15 |
| `package.json` | modificado | devDependencies de pruebas, script `test` y configuración de Jest. **Requiere autorización previa (ver Dependencias).** | Constitución 10 |
| `MEMORY.md` | modificado | Solo las secciones `Estado actual` y `Próximos pasos`. | — |

No se modifican: `spec.md`, `decisiones.md`, las HU, `src/app/_layout.tsx`,
`src/app/explore.tsx`, la navegación por pestañas ni `app.json`.

### Dependencias (autorizadas por el usuario el 19/10/2026; instalar en la T1)

- `jest`, `ts-jest`, `@types/jest`: ejecutar pruebas (Constitución 10).
- `@react-native-async-storage/async-storage`: persistencia local exigida por
  la Decisión 008; hoy no está instalada. Instalación con `npx expo install`
  para respetar la versión compatible con Expo 57.

Alternativa descartada: `jest-expo` (preset completo de Expo), porque esta
spec no prueba componentes React — la interfaz se verifica manualmente en
Expo Go (AGENTS.md). Si `ts-jest` no resulta compatible con TypeScript 6 del
proyecto, se solicitará autorización para cambiar de preset antes de continuar.

## Funciones puras de lógica

### `src/domain/config.ts`

- `DEFAULT_PHASE_DURATIONS: { studyMs, shortBreakMs, longBreakMs, pomodorosPerCycle }`
  — valores por defecto de la HU-005 (25 / 5 / 15 / 4). Esta spec solo
  consume `studyMs`. (Constitución 11.)

### `src/domain/timer.ts`

- `type TimerState = 'initial' | 'running' | 'paused' | 'finished'`
  (Decisión 005: Inicial, Corriendo, Pausado, Finalizado; un único estado
  explícito, sin booleanos sueltos).
- `type Timer = { state, durationMs, remainingMs, runningSinceMs | null }`
- `createTimer(durationMs)` — estado Inicial con el restante igual a la
  duración.
- `startTimer(t, now)` / `resumeTimer(t, now)` — pasan a Corriendo fijando
  `runningSinceMs = now`.
- `pauseTimer(t, now)` — congela el restante calculado y pasa a Pausado.
- `resetTimer(t)` — restante = duración de la fase, estado Inicial (RF-04).
- `remainingMs(t, now)` — restante derivado de marcas de tiempo mientras
  Corriendo; congelado en Pausado/Inicial/Finalizado.
- `tick(t, now)` — devuelve el temporizador y si venció: al llegar a 0 pasa a
  `finished` con restante 0 (RF-08).
- `formatRemaining(remainingMs, durationMs)` — `MM:SS`; `HH:MM:SS` si la
  duración configurada de la fase es ≥ 60 min (RF-09, Decisión 006).
- `controlsFor(state)` — mapeo puro estado → controles visibles: `initial`
  → `['start']`; `running` → `['pause', 'reset']`; `paused` →
  `['resume', 'reset']`; `finished` → `['reset']` (RF-07, Decisiones 005 y
  009). Genérico para cualquier fase, sin distinguir estudio de descanso
  (RF-06, Decisión 003).

### `src/domain/session-record.ts`

- `type StudyPhase = 'study' | 'shortBreak' | 'longBreak'`
- `type DayRecord = { startMs, completed, incomplete, markCounted }`
- `type StudyRecord = { day: DayRecord | null, sessionMarked: boolean }`
  - `day.startMs`: inicio del día de uso vigente (Decisión 020).
  - `day.completed`: contador mostrado pero **nunca incrementado en esta
    spec** (Decisión 025; ver supuesto RC-1).
  - `day.incomplete`: sesiones incompletas contadas en el día vigente.
  - `day.markCounted`: la marca de la sesión actual está contada en el día
    vigente (necesario para RF-13 + RF-16 combinados).
  - `sessionMarked`: la sesión actual lleva marca de incompleta; impide
    doble conteo y conserva la identidad de sesión (RF-16, Decisión 027).
- `emptyStudyRecord()` — sin día (estado que muestra RF-15).
- `applyTimerStart(record, phase, now)` — evalúa el corte y, si no hay día,
  lo crea (solo con fases de estudio).
- `applyTimerReset(record, phase, previousState, now)` — evalúa el corte y
  aplica la marca de incompleta.
- `applyTimerCompletion(record, phase, now)` — evalúa el corte y resuelve la
  marca al llegar a 00:00.
- `deriveSummary(record)` — `empty` si `day == null`; si no, devuelve
  `completed`, `incomplete` y `startMs` para pintar el resumen (RF-12,
  RF-15).
- `newDay(now)` auxiliar — `{ startMs: now, completed: 0, incomplete: 0,
  markCounted: false }` (RF-13, Decisiones 013 y 014).

La pausa y la continuación no producen cambios en el registro (no hay
efectos registrables aprobados); solo cambian el temporizador.

## Persistencia y recuperación de datos

- **Clave:** `'@pomodoro/study-record'` (una sola clave; Decisiones 008 y 011).
- **Formato** (representación técnica; Decisiones 008, 011, 013, 015 y 020):

```json
{
  "version": 1,
  "record": {
    "day": { "startMs": 1760000000000, "completed": 0, "incomplete": 1, "markCounted": true },
    "sessionMarked": true
  }
}
```

- **Carga:** al montar la pantalla principal (`useEffect` de montaje). Si no
  hay dato, se usa `emptyStudyRecord()` (RF-15). La fecha se pinta con
  `new Date(startMs).toLocaleDateString()`, formato del dispositivo
  (Decisiones 016, 020 y 024).
- **Guardado:** después de cada evento que muta el registro (iniciar,
  pausar, continuar, reiniciar confirmado, llegar a 00:00). La escritura es
  asíncrona y sus errores se registran en consola sin romper el temporizador.
- **Dato corrupto:** si el JSON no se puede analizar, se devuelve
  `emptyStudyRecord()` y se documenta como limitación. Alternativa
  descartada: clave de respaldo del valor crudo, por añadir complejidad sin
  un requisito aprobado que la pida (constitución 1).
- El temporizador en curso **no** se persiste: la recuperación de la cuenta
  está fuera de alcance (Decisión 026). La marca de sesión incompleta y el
  día de uso sí persisten (RF-11).

## Algoritmos en pseudocódigo

### 1. Restante exacto (RNF-01, constitución 3)

```
restante(temporizador, ahora):
  si estado != Corriendo: devolver remainingMs
  consumido = ahora - runningSinceMs
  devolver max(0, remainingMs - consumido)
```

### 2. Transiciones del temporizador (RF-01, RF-02, RF-04, RF-07, RF-08)

```
iniciar(t, ahora):      exige estado Inicial   → estado=Corriendo, runningSinceMs=ahora
pausar(t, ahora):       exige estado Corriendo  → remainingMs=restante(t,ahora), estado=Pausado
continuar(t, ahora):    exige estado Pausado    → estado=Corriendo, runningSinceMs=ahora
reiniciar(t):           exige Corriendo|Pausado|Finalizado (Decisión 009)
                        → remainingMs=durationMs, estado=Inicial
tick(t, ahora):
  si estado == Corriendo y restante(t,ahora) == 0:
      → estado=Finalizado, remainingMs=0   (no hay transición automática: Decisión 004)
```

### 3. Formato del tiempo (RF-09, Decisión 006)

```
formatear(restanteMs, duracionMs):
  segundos = restanteMs / 1000
  si duracionMs >= 3600000: devolver HH:MM:SS
  si no: devolver MM:SS
```

### 4. Reglas del corte de 24 h (RF-13, RF-14, RF-17; Decisiones 014, 015, 018, 019, 023)

Se evalúa de forma perezosa en cada evento del dominio, nunca con un timer
programado (la app puede estar suspendida; skill `pomodoro-domain` §6):

```
aplicarCorte(registro, ahora, evento, fase, sesionEnCurso):
  si registro.day == null: devolver registro            // aún no hay día
  si ahora < day.startMs + 24h: devolver registro        // día vigente

  // RF-17 + Decisión 023: el corte esperó a la sesión de estudio en curso
  si evento ∈ {completar, reiniciar} y fase == estudio y sesionEnCurso:
      devolver nuevoDía(ahora)   // nuevo día en este instante; la sesión se
                                 // contabiliza en él (ver paso 5)

  // RF-14 + Decisión 015: sin sesión en curso se conserva hasta la próxima
  // sesión de estudio nueva
  si evento == iniciar y fase == estudio:
      devolver nuevoDía(ahora)

  devolver registro              // conservar contadores y fecha (RF-14) o
                                 // seguir esperando (RF-17 / Decisión 019)
```

- `sesionEnCurso` = la sesión de estudio está Corriendo o Pausado antes del
  evento: ninguna de las dos la ha completado ni reiniciado, así que el corte
  espera (RF-17, Decisión 019). Una fase de descanso nunca difiere el corte
  (solo "sesión de estudio en curso" en RF-17).

### 5. Eventos que mutan el registro (RF-10, RF-16; Decisiones 007, 010, 022, 025, 027)

```
aplicarInicio(registro, fase, ahora):
  registro = aplicarCorte(registro, ahora, iniciar, fase, sesionEnCurso=false)
  si registro.day == null y fase == estudio: registro.day = nuevoDía(ahora)
  // No crea sesión nueva: reiniciar y volver a iniciar continúa la misma
  // sesión (Decisión 027). No cambia contadores.

aplicarReinicio(registro, fase, estadoAnterior, ahora):
  sesionEnCurso = estadoAnterior ∈ {Corriendo, Pausado}
  registro = aplicarCorte(registro, ahora, reiniciar, fase, sesionEnCurso)
  si fase != estudio o estadoAnterior ∉ {Corriendo, Pausado}:
      devolver registro          // descansos no marcan (Decisión 010);
                                 // desde Finalizado no hay marca (Decisión 022)
  // Una sola marca por sesión (RF-16): el contador solo sube si la marca
  // no está contada en el día vigente
  si not registro.sessionMarked: sessionMarked = true
  si not day.markCounted: day.incomplete += 1; day.markCounted = true
  // day.completed no se incrementa nunca aquí (Decisión 025)

aplicarFinalizacion(registro, fase, ahora):   // tick llegó a 00:00
  registro = aplicarCorte(registro, ahora, completar, fase, sesionEnCurso=true)
  si sessionMarked:
      sessionMarked = false                  // misma sesión, sin sesión nueva
      si day.markCounted: day.incomplete -= 1; day.markCounted = false   // RF-16
  // day.completed no se incrementa en esta spec (Decisión 025, HU-002) — RC-1
```

### 6. Resumen (RF-12, RF-15; Decisiones 012, 016, 017, 024)

```
derivarResumen(registro):
  si registro.day == null: devolver {tipo: 'vacio'}
  devolver {tipo:'resumen', completadas: day.completed,
            incompletas: day.incomplete, fechaMs: day.startMs}
```

Pantalla:

- `vacio` → `Aún no hay sesiones de estudio registradas.`
- `resumen` → `Completadas: X · Incompletas: X · Última sesión de estudio: <fecha>`
  (etiqueta literal de la Decisión 024; fecha con `toLocaleDateString()` del
  dispositivo, Decisión 016).

## Cómo se pinta en la interfaz

`src/app/index.tsx`, respetando `cotopaxi-brand` y `rn-conventions`:

- Estructura vertical dentro de `SafeAreaView` (áreas seguras), orientación
  retrato (ya fijada en `app.json`, sin tocarla). Estilos con `StyleSheet`;
  sin librerías nuevas.
- **Tarjeta del temporizador** (superior): superficie blanca, radios
  redondeados y sombra sutil neutra (Claymorphism moderado). Tiempo restante
  con jerarquía visual clara y tipografía monoespaciada
  (`Fonts.mono` de `src/constants/theme.ts`) para que el texto no salte.
- **Fila de controles** debajo del tiempo: un botón por control que permite
  `controlsFor(estado)`, etiquetas en español exacto: "Iniciar", "Pausar",
  "Continuar", "Reiniciar" (RF-07). Azul marino `#181759` para el control
  principal y dorado `#C69214` como acento; estados presionado/deshabilitado
  por opacidad o borde, sin colores nuevos. Objetivos táctiles ≥ 44×44 y
  etiquetas de accesibilidad (`accessibilityLabel`).
- **Diálogo de reinicio**: `Alert.alert` del sistema con mensaje
  "¿Reiniciar el temporizador?" y botones "Cancelar" (cancel) y "Reiniciar"
  (destructive). Cancelar no muta nada (RF-05); Reiniciar llama a
  `resetTimer` + `aplicarReinicio` (RF-04, RF-10). Decisión 002.
- **Tarjeta de resumen** (inferior): misma superficie blanca con
  Claymorphism; muestra el texto derivado en `derivarResumen` o el mensaje
  vacío. Los textos se leen sin depender del color (lista rn-conventions).
- El refresco del tiempo sale del hook (intervalo de 500 ms recalculando
  `restante(t, now)`); la pantalla no calcula nada.
- Textos visibles todos en español. Sin anuncios, sin cuentas, sin red
  (RNF-02, RNF-03).

## Decisiones técnicas justificadas (con alternativa descartada)

| # | Decisión | Justificación | Alternativa descartada |
|---|---|---|---|
| DT-1 | Temporizador basado en marcas de tiempo (`runningSinceMs`) con `now` inyectado | Precisión exacta aunque el intervalo de UI se retrase; pruebas deterministas (constitución 3, RNF-01, skill `pomodoro-domain` §3) | Decrementar un contador cada segundo con `setInterval`: acumula deriva y obliga a esperas reales en los tests |
| DT-2 | Estados como unión literal única (`TimerState`) en un solo objeto | Un solo estado explícito; imposible representar estados incompatibles (Decisión 005, `pomodoro-domain` §2) | Varios booleanos (`isRunning`, `isPaused`…): permiten estados imposibles |
| DT-3 | Confirmación con `Alert.alert` del sistema | Decisión 002 pide diálogo modal y `rn-conventions` exige diálogo del sistema para confirmaciones; cero dependencias | Componente `Modal` propio: más código y estilos sin necesidad (constitución 1) |
| DT-4 | Persistencia en AsyncStorage con una clave JSON `version` (Decisión 008) | Ya decidido en la Decisión 008; local y sin conexión (constitución 5 y 6); `version` detecta formatos futuros sin romper datos | MMKV/SQLite/base de datos: dependencia nueva e innecesaria; sin `version`: imposible detectar cambios de formato |
| DT-5 | Corte de 24 h evaluado de forma perezosa en cada evento, con `now` | Funciona aunque la app esté suspendida o cerrada; sin timers programados que no disparan en segundo plano (`pomodoro-domain` §6) | `setTimeout` de 24 h: no se dispara con la app suspendida y pierde el corte |
| DT-6 | Identidad de sesión con `sessionMarked` + `markCounted` | Cubre a la vez RF-10 (sin doble conteo), RF-16 (la misma sesión al completarse retira la marca) y RF-13 (el día nuevo no arrastra conteos) | Solo un contador entero: no distingue una marca ya contada de otra nueva tras el corte, y duplica cifras |
| DT-7 | Jest con `ts-jest` y mock de AsyncStorage vía `moduleNameMapper` | Prueba dominio y storage puros sin arrancar Expo; la interfaz se verifica manualmente (AGENTS.md) | `jest-expo` + Testing Library: peso y complejidad añadidos sin pruebas de componentes en esta spec |

## Supuestos justificados (confirmados por el usuario el 19/10/2026)

Confirmados junto con la aprobación del plan; no son decisiones nuevas de
producto, son lecturas de textos ya aprobados:

- **RC-1 — "Completadas" no incrementa en esta spec.** RF-12 solo pide
  conservar y mostrar el registro, y la Decisión 025 asigna el incremento a
  HU-002; por tanto, en esta spec el contador de completadas se muestra pero
  solo puede provenir de datos ya guardados (hoy: siempre 0 hasta HU-002).
  Único efecto de RF-16 sobre completadas: la sesión deja de estar en
  incompletas (Decisión 027).
- **RC-2 — inicio del día en el corte diferido.** RF-17 dice que el nuevo
  día "empieza" cuando la sesión en curso se completa o se reinicia; por
  eso `startMs` del día nuevo es el instante de ese evento. Alternativa
  descartada: la fecha de inicio de la sesión (anterior al corte), que
  contradiría "empieza… para empezar el nuevo día".
- **RC-3 — duración por defecto de estudio: 25 min.** RF-01 exige "la
  duración de estudio configurada", pero los ajustes son HU-005 y están
  fuera de alcance; se toma el único valor aprobado de la HU-005 (25 min,
  escenario "Volver a los valores por defecto") y la constitución 11. Vive
  en `config.ts` para que HU-005 lo sustituya por el valor configurado.
- **RC-4 — solo las fases de estudio crean días de uso.** Las 24 h corren
  desde "la primera sesión de estudio" (Decisión 014); un descanso no
  inicia día ni difiere el corte (RF-17 habla de sesión de estudio).

## Estrategia de pruebas con Jest

Todas las suites son puras, inyectan `now` y no usan esperas reales
(`pomodoro-domain`: pruebas deterministas). Comandos: `npx jest` y
`npx tsc --noEmit`.

- **`src/domain/__tests__/timer.test.ts`** (T2)
  - Iniciar desde Inicial usa la duración configurada y muestra el
    restante (RF-01).
  - Pausar congela y continuar sigue desde ese instante, con pausas y
    reanudaciones sucesivas sin pérdida de tiempo (RF-02, RNF-01).
  - Reiniciar vuelve al tiempo inicial de la fase (RF-04).
  - `controlsFor` devuelve exactamente los controles de cada estado y es
    idéntico para estudio y descansos (RF-06, RF-07).
  - Al llegar a 00:00 el estado pasa a Finalizado, restante 0 y sin
    control de pausar (RF-08).
  - `formatRemaining`: MM:SS con 25 min; HH:MM:SS con duración ≥ 60 min
    (RF-09).
- **`src/domain/__tests__/session-record.test.ts`** (T3 y T4)
  - Reinicio de estudio desde Corriendo o Pausado suma 1 incompleta una
    sola vez aunque se repita el ciclo (RF-10, RF-16).
  - Reinicio desde Finalizado y reinicio de descanso no modifican el
    registro (Decisión 022, Decisión 010 → RF-10).
  - Completar la sesión marcada retira la marca sin crear sesión nueva y
    sin tocar `completed` (RF-16, RC-1).
  - Primer inicio de estudio crea el día; sin día existe el estado vacío
    (RF-12, RF-15).
  - Corte vencido sin sesión en curso: se conserva todo hasta el siguiente
    iniciar, que crea el día nuevo con contadores a cero (RF-13, RF-14).
  - Corte vencido con sesión en curso: no hay cambio hasta completar o
    reiniciar; entonces el día nuevo nace en ese instante y la sesión se
    contabiliza en él (RF-17).
- **`src/storage/__tests__/study-record.test.ts`** (T5)
  - Guardar y recuperar produce el mismo registro (roundtrip).
  - Sin dato previo devuelve `emptyStudyRecord()`.
  - JSON inválido devuelve registro vacío sin lanzar (limitación
    documentada).

Fuera de Jest (verificación manual en Expo Go): pantalla, controles,
diálogo, resumen y persistencia al cerrar/abrir — checklist en `tasks.md`.

## Cobertura de RF

| RF | Parte del plan |
|---|---|
| RF-01 | `timer.ts` + hook + `index.tsx` |
| RF-02 | `timer.ts` + hook + `index.tsx` |
| RF-03 | `index.tsx` (diálogo) + hook |
| RF-04 | `timer.ts` (`resetTimer`) + `index.tsx` (confirmación) |
| RF-05 | `index.tsx` (cancelar no muta) |
| RF-06 | `timer.ts` (`controlsFor` genérico) + `index.tsx` |
| RF-07 | `timer.ts` (`controlsFor`) + `index.tsx` |
| RF-08 | `timer.ts` (`tick`) + hook + `index.tsx` |
| RF-09 | `timer.ts` (`formatRemaining`) + `index.tsx` |
| RF-10 | `session-record.ts` (`applyTimerReset`) + hook |
| RF-11 | `storage/study-record.ts` + hook (carga/guardado) |
| RF-12 | `session-record.ts` (`deriveSummary`) + `index.tsx` |
| RF-13 | `session-record.ts` (`aplicarCorte`/`nuevoDía`) + `index.tsx` |
| RF-14 | `session-record.ts` (`aplicarCorte`) |
| RF-15 | `session-record.ts` (`deriveSummary`) + `index.tsx` |
| RF-16 | `session-record.ts` (`applyTimerCompletion`) + hook |
| RF-17 | `session-record.ts` (`aplicarCorte` diferido) |
| RNF-01 | `timer.ts` (DT-1) + hook (intervalo) |
| RNF-02 | `storage/` + todo el flujo local, sin red |
| RNF-03 | sin cambios: sin registro, cuentas ni anuncios |
