# Plan 005 — Ajustar los tiempos del pomodoro

Fuentes: `specs/005-ajustar-tiempos-pomodoro/spec.md` (aprobada), `specs/005-ajustar-tiempos-pomodoro/decisiones.md` (Decisiones 001–009 y nota técnica de soporte), `docs/historias/HU-005.md`, `docs/constitution.md`, planes de las specs 001–004 y código existente (`src/domain/`, `src/storage/`, `src/hooks/`, `src/app/`).

## Alcance estricto

Dentro de alcance:
- Pestaña "Ajustes" que reemplaza a "Explore" (RF-01; Decisión 002).
- Pantalla de ajustes con 4 campos (estudio, descanso corto, descanso largo, pomodoros por ciclo), botón "Guardar" y botón "Restablecer" con confirmación (RF-01, RF-02, RF-06; Decisión 008).
- Validación de rangos: duraciones enteras de 1 a 120 minutos; pomodoros por ciclo entero de 1 a 12; vacío, cero y no entero son inválidos (RF-04; Decisión 001).
- Guardado atómico: si algún campo es inválido, no se guarda nada y cada campo inválido muestra en rojo, debajo, el rango admitido (RF-05; Decisiones 004 y 005).
- Los valores guardados se usan desde la próxima fase y persisten al cerrar la app (RF-02, RF-03).
- La fase en curso (en marcha o en pausa) conserva el tiempo con que empezó; el cambio rige desde la siguiente fase (RF-07, RF-08; Decisiones 006, 007, 009).
- Si el contador ya alcanza o supera el nuevo valor de pomodoros por ciclo, el próximo descanso es largo (RF-09; Decisión 003).
- Restablecer rellena 25/5/15/4 solo en pantalla; persiste únicamente al pulsar "Guardar" (RF-06, RF-08; Decisión 008).
- Salir sin guardar descarta lo escrito (RF-10; Decisión 008).

Fuera de alcance (no se toca):
- Aplicar cambios sin pulsar "Guardar" (Decisión 008, fuera de alcance de la spec).
- Reglas de temporización, recuperación y notificaciones de las specs 001–004 (se reutilizan sin cambios de comportamiento).
- Formato de los datos persistidos existentes `@pomodoro/cycle-state` y `@pomodoro/study-record` (Constitución 5).
- Backend, cuentas, publicidad, servicios externos o dependencias nuevas (Constitución 1, 6, 8).

## Arquitectura y separación de responsabilidades

Se conserva la separación aprobada (Constitución 9; skill `pomodoro-domain`):

- **Dominio** (`src/domain/`): TypeScript puro, sin React ni AsyncStorage. Nuevo módulo `settings.ts` con los tipos de ajustes, los valores por defecto y la validación pura. `cycle.ts` parametriza `durationForPhase` y `nextTimerFor` con los ajustes vigentes. `config.ts` sigue siendo la única fuente de los valores por defecto (25/5/15/4).
- **Persistencia** (`src/storage/`): nuevo módulo `settings.ts` con carga y guardado en la clave nueva `@pomodoro/settings`, versionada `{ version: 1 }`, con valores por defecto cuando no haya nada guardado o el dato sea inválido (nota técnica de soporte de `decisiones.md`; Constitución 5).
- **Orquestación** (`src/hooks/use-settings.ts` nuevo; `src/hooks/use-pomodoro-session.ts` modificado): un contexto `SettingsProvider` es la única fuente en memoria de los ajustes; la sesión de pomodoro los consume para calcular la siguiente fase, su duración y el contenido del aviso.
- **Interfaz** (`src/app/settings.tsx` nuevo en sustitución de `src/app/explore.tsx`; `src/components/app-tabs.tsx`; `src/app/_layout.tsx`): pantalla de ajustes con formulario, validación visual y confirmación de restablecer; pestaña "Ajustes" en la barra inferior. Respeta `cotopaxi-brand` y la lista manual de `rn-conventions`.

## Archivos que se crean o modifican

| Archivo | Tipo | Responsabilidad | RF |
|---|---|---|---|
| `src/domain/settings.ts` | nuevo | Tipos `PomodoroSettings` y `SettingsInput`; `DEFAULT_SETTINGS` (derivado de `config.ts`); `validateSettingsField(field, rawText)` y `validateSettingsForm(input)` (validación atómica con mensajes de rango); `toMinutesMs`/`durationMinutesForPhase` si corresponde. Sin React/AsyncStorage. | RF-02, RF-04, RF-05, RF-06 |
| `src/domain/__tests__/settings.test.ts` | nuevo | Pruebas Jest puras de validación, defectos y restablecimiento. | ver T1 |
| `src/domain/cycle.ts` | modificado | `durationForPhase(phase, settings)` y `nextTimerFor(cycle, settings)` reciben los ajustes vigentes en lugar de leer solo los valores fijos; `advanceCycle` ya recibe `pomodorosPerCycle` como parámetro y no cambia su lógica. | RF-02, RF-07, RF-09 |
| `src/domain/__tests__/cycle.test.ts` | modificado | Ampliar pruebas: duración por fase con ajustes personalizados; próximo descanso largo cuando el contador ya alcanza o supera el nuevo valor. | RF-02, RF-09 |
| `src/storage/settings.ts` | nuevo | `loadSettings()` y `saveSettings(settings)` sobre `@pomodoro/settings` (`{ version: 1, ... }`); defectos ante ausencia o JSON inválido. Sin cambios en claves existentes. | RF-03 |
| `src/storage/__tests__/settings.test.ts` | nuevo | Pruebas con AsyncStorage simulado (patrón de `cycle-state.test.ts`): defectos al no haber dato, ida y vuelta, JSON inválido. | RF-03 |
| `src/hooks/use-settings.ts` | nuevo | `SettingsProvider` + `useSettings()`: estado en memoria de los ajustes, carga inicial desde storage, `saveSettings` (persiste y actualiza el estado). Única fuente compartida entre pantallas. | RF-02, RF-03, RF-08, RF-10 |
| `src/hooks/use-pomodoro-session.ts` | modificado | Consumir los ajustes del contexto: `completionFor` usa `settings.pomodorosPerCycle` y `nextTimerFor(cycle, settings)`; el efecto de notificación programada usa el mismo valor para el contenido; el temporizador inicial se construye con la duración configurada tras cargar. No toca el temporizador de la fase en curso al guardar. | RF-02, RF-07, RF-09 |
| `src/app/_layout.tsx` | modificado | Envolver `AppTabs` con `SettingsProvider`. | RF-02 |
| `src/app/settings.tsx` | nuevo (reemplaza `src/app/explore.tsx`) | Pantalla de ajustes: 4 campos numéricos, mensajes de error por campo, "Guardar" y "Restablecer" con diálogo de confirmación; rehidrata los campos desde el contexto al entrar (descarta cambios sin guardar). | RF-01, RF-05, RF-06, RF-10 |
| `src/components/app-tabs.tsx` (y `.web.tsx` si aplica) | modificado | Reemplazar la pestaña "Explore" por "Ajustes" (ruta `settings`). | RF-01 |
| `MEMORY.md` | modificado | Solo "Estado actual" y "Próximos pasos". | — |

No se modifican: `src/domain/timer.ts`, `src/domain/session-record.ts`, `src/domain/session-recovery.ts`, `src/domain/alarm.ts`, `src/services/notifications.ts`, `src/storage/cycle-state.ts`, `src/storage/study-record.ts` salvo ajustes estrictamente mecánicos de tipos derivados de la firma nueva de `durationForPhase`/`nextTimerFor`.

## Funciones puras de lógica

### `src/domain/settings.ts` (nuevo)

- `export type PomodoroSettings = { studyMinutes: number; shortBreakMinutes: number; longBreakMinutes: number; pomodorosPerCycle: number };`
- `export type SettingsField = keyof PomodoroSettings;`
- `export type SettingsInput = Record<SettingsField, string>;` (texto tal como se escribe en pantalla)
- `export const DEFAULT_SETTINGS: PomodoroSettings = { studyMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, pomodorosPerCycle: 4 }` (derivado de `DEFAULT_PHASE_DURATIONS` de `config.ts`, sin duplicar números mágicos; Definiciones de la spec).
- `export const SETTINGS_RANGES: Record<SettingsField, { min: number; max: number }>` — duraciones 1–120, pomodoros 1–12 (RF-04; Decisión 001).
- `export const validateSettingsField = (field: SettingsField, raw: string): { valid: boolean; message?: string }` — inválido si está vacío, no es un entero estricto (sin decimales ni otros caracteres), o está fuera del rango; el mensaje indica el rango admitido, p. ej. "Ingresa un número entre 1 y 120" (RF-04, RF-05; Decisiones 001 y 005).
- `export const validateSettingsForm = (input: SettingsInput): { values: PomodoroSettings | null; errors: Record<SettingsField, string | null> }` — valida los 4 campos; si al menos uno es inválido devuelve `values: null` y el mensaje de cada campo inválido (guardado atómico, RF-05; Decisión 004); si todos son válidos devuelve los números y `errors` en null.
- `export const resetSettingsInput = (): SettingsInput` — 4 campos como texto "25", "5", "15", "4" (RF-06; Decisión 008: solo llena la pantalla, no persiste).

### `src/domain/cycle.ts` (modificado)

- `durationForPhase(phase, settings)` — misma firma antes, más `settings: PomodoroSettings`; convierte minutos a milisegundos.
- `nextTimerFor(cycle, settings)` — crea el temporizador de la siguiente fase con la duración configurada (RF-02, RF-07).
- `advanceCycle(cycle, pomodorosPerCycle)` — sin cambios de lógica; quien lo invoca pasará `settings.pomodorosPerCycle` en lugar del valor fijo (RF-09; Decisión 003: con contador ya alcanzado o superado, el resultado es `longBreak`).

## Persistencia

- Clave nueva `@pomodoro/settings`, formato `{ version: 1, studyMinutes, shortBreakMinutes, longBreakMinutes, pomodorosPerCycle }` (nota técnica de soporte de `decisiones.md`). No se tocan `@pomodoro/cycle-state` ni `@pomodoro/study-record` (Constitución 5).
- `saveSettings` se ejecuta únicamente al pulsar "Guardar" con el formulario válido (RF-02, RF-10; Decisión 008).
- `loadSettings` se ejecuta al montar la app; ante clave ausente o JSON inválido devuelve `DEFAULT_SETTINGS` (RF-03).
- Funciona sin conexión: solo AsyncStorage local (RNF-01; Constitución 6).

## Algoritmos en pseudocódigo

### 1. Validación (dominio puro)

```
validarCampo(campo, texto):
  rango = SETTINGS_RANGES[campo]           // 1..120 o 1..12 (Decisión 001)
  si texto vacío → { inválido, "Ingresa un número entre rango.min y rango.max" }
  si texto no es entero estricto (solo dígitos, sin signo, sin decimales) → inválido
  n = entero de texto
  si n < rango.min o n > rango.max → inválido (cubre cero y vacío)
  → { válido }

validarFormulario(entradas):               // atómico: o todo o nada (Decisión 004)
  errores = {}; ok = true
  para cada campo en [study, shortBreak, longBreak, pomodorosPerCycle]:
    r = validarCampo(campo, entradas[campo])
    si r.inválido: errores[campo] = r.mensaje; ok = false
  si no ok → { values: null, errores }     // RF-05: no se guarda NADA
  → { values: números, errores: todos null }
```

### 2. Guardar

```
alPulsarGuardar():
  resultado = validarFormulario(camposEnPantalla)
  si resultado.values == null:
    mostrar errores junto a cada campo inválido (Decisión 005); FIN   // RF-05
  settings = resultado.values
  saveSettings(settings)                    // persiste en @pomodoro/settings  // RF-03
  contexto.actualizar(settings)             // única fuente en memoria        // RF-02
  // La fase en curso NO se toca: el temporizador actual conserva
  // durationMs y remainingMs con que empezó (RF-07, RF-08; Decisiones 006, 007, 009)
```

### 3. Aplicación desde la próxima fase (hook de sesión)

```
alMontar():
  settings = useSettings()                  // contexto (cargado desde storage)
  [tras cargar] si no hay temporizador guardado:
    timer = createTimer(durationForPhase(cycle.phase, settings))   // duración configurada

alVencerFase()  // camino único existente:
  nextCycle = advanceCycle(cycle, settings.pomodorosPerCycle)      // RF-09 (Decisión 003)
  nextTimer = nextTimerFor(nextCycle, settings)                    // RF-02, RF-07

alProgramarNotificación():
  nextCycle = advanceCycle(cycle, settings.pomodorosPerCycle)      // contenido del aviso
```

### 4. Restablecer y salir sin guardar (pantalla de ajustes)

```
alPulsarRestablecer():
  mostrar diálogo de confirmación del sistema (rn-conventions)
  si confirma: camposEnPantalla = resetSettingsInput()   // 25/5/15/4 SOLO en pantalla
  // no persiste ni actualiza el contexto (RF-06, RF-08; Decisión 008)

alEntrarEnLaPantalla(useFocusEffect):
  camposEnPantalla = texto desde contexto/settings      // rehidratación

alSalirSinGuardar():
  los campos son estado local de la pantalla; al volver a entrar se rehidratan
  desde el contexto, descartando lo escrito              // RF-10 (Decisión 008)
```

## Cómo se pinta en la interfaz

- `src/app/settings.tsx` (ruta `settings`, título "Ajustes" en la pestaña):
  - Contenedor desplazable (`ScrollView` con `KeyboardAvoidingView`) para que el teclado no tape campos ni botones; áreas seguras respetadas (rn-conventions).
  - 4 campos `TextInput` con `keyboardType="number-pad"`, etiqueta en español ("Estudio (min)", "Descanso corto (min)", "Descanso largo (min)", "Pomodoros por ciclo"), objetivo táctil ≥44x44 y etiqueta de accesibilidad.
  - Bajo cada campo inválido, mensaje en rojo con el rango admitido (Decisión 005), legible sin depender solo del color (texto explícito).
  - Botón "Guardar" (estilo Claymorphism, dorado #C69214 / azul marino #181759 / blanco #FFFFFF según `cotopaxi-brand`) y botón "Restablecer" con `Alert.alert` de confirmación del sistema.
  - Textos visibles en español; orientación vertical (app fijada a retrato en `app.json`).
- `src/components/app-tabs.tsx`: pestaña "Ajustes" reemplaza a "Explore" (Decisión 002); icono existente de Expo (índice de ajustes) sin dependencias nuevas.
- La pantalla del temporizador (`src/app/index.tsx`) no cambia visualmente; solo deja de leer duraciones fijas vía el hook.

## Decisiones técnicas justificadas (con alternativa descartada)

| # | Decisión | Justificación | Alternativa descartada |
|---|---|---|---|
| DT-1 | Nuevo módulo puro `domain/settings.ts` para tipos, defectos y validación | Reglas de validación y rangos testeables sin React/native (Constitución 9, 10; RNF-02). | Validar en la pantalla de ajustes → no comprobable con Jest, mezcla interfaz y lógica. |
| DT-2 | Parametrizar `durationForPhase`/`nextTimerFor` con `PomodoroSettings`; `config.ts` sigue siendo la fuente de los defectos | Un solo punto de verdad para duraciones; los consumidores existentes solo cambian de argumento (RF-02, RF-07). | Mutar `DEFAULT_PHASE_DURATIONS` al guardar → rompe pureza (`as const`), arriesga datos de specs 001–004 y permitiría que la fase en curso cambiara (RF-07). |
| DT-3 | Estado de ajustes compartido mediante React Context (`SettingsProvider` en `_layout.tsx`) | Los ajustes se usan en dos rutas (Home y Ajustes) que deben estar sincronizadas sin dependencias nuevas; el hook de sesión consume el mismo contexto. | Leer AsyncStorage en cada pantalla → Home no se entera del cambio y RF-02 falla; singleton de módulo → difícil de resetear en pruebas; prop drilling entre rutas de Expo Router → no natural. |
| DT-4 | Clave nueva `@pomodoro/settings` versionada `{ version: 1 }` | Nota técnica de soporte de `decisiones.md`; no altera formatos existentes (Constitución 5). | Reutilizar `@pomodoro/cycle-state` → mezcla ajustes con estado de sesión y exige migrar un formato persistido sin autorización. |
| DT-5 | Guardar no toca el temporizador actual: solo actualiza el contexto y la persistencia | Cumple RF-07/RF-08 (fase en curso conserva su tiempo; Decisiones 006, 007, 009) y Constitución 3 (el tiempo debe ser exacto). | Reconstruir el temporizador al guardar → la fase en curso perdería o ganaría tiempo. |
| DT-6 | Validación atómica con `values: null` cuando algo es inválido | Decisión 004 aprobada (o todo o nada); una sola comprobación en la UI. | Guardar campo por campo → medios cambios silenciosos, explícitamente descartados. |
| DT-7 | Rehidratar los campos con `useFocusEffect` al entrar en Ajustes | Implementa RF-10 (salir sin guardar descarta) sin lógica extra, aprovechando que las pestañas permanecen montadas. | Guardar el borrador en storage → crea un mecanismo de guardado paralelo no aprobado (Decisión 008). |
| DT-8 | Reemplazar la ruta `explore.tsx` por `settings.tsx` | Decisión 002 aprobada: Explore es pantalla de plantilla sin relación con el dominio. | Mantener Explore y añadir una tercera pestaña → más navegación sin necesidad (Constitución 1). |

## Estrategia de pruebas con Jest

Comandos: `npx jest`, `npx tsc --noEmit`.

- **`src/domain/__tests__/settings.test.ts`** (T1): `validateSettingsField` rechaza vacío, "0", decimales ("25.5"), texto y valores fuera de rango (121, 13) en cada campo; acepta los límites 1, 120 y 12; el mensaje indica el rango (RF-04, RF-05). `validateSettingsForm` devuelve `values: null` si un solo campo es inválido y mensaje en los demás (RF-05; Decisión 004). `DEFAULT_SETTINGS` es 25/5/15/4 (RF-06). `resetSettingsInput` produce los textos por defecto sin estado (RF-06).
- **`src/domain/__tests__/cycle.test.ts`** (T2, ampliadas): `durationForPhase` devuelve la duración configurada por fase (minutos→ms); `nextTimerFor` crea el temporizador de la siguiente fase con la duración configurada (RF-02, RF-07); `advanceCycle` con `pomodorosPerCycle` personalizado da `longBreak` cuando el contador ya alcanza o supera el nuevo valor, p. ej. contador 5 con perCycle 3 (RF-09; Decisión 003) y conserva el comportamiento previo (specs 001–002 sin regresiones).
- **`src/storage/__tests__/settings.test.ts`** (T3): AsyncStorage simulado (patrón de `cycle-state.test.ts`): defectos ante clave ausente; ida y vuelta de los 4 valores; JSON inválido → defectos (RF-03).
- **Suite completa** (T7): sin regresiones en specs 001–004 (8 suites actuales + 2 nuevas).
- **Manual (Expo Go)** (T8): los cuatro escenarios de la HU-005 y la lista manual de `rn-conventions` (teclado no tapa, cierre y reapertura conserva ajustes, textos sin depender del color). Checklist en `tasks.md`.

## Cobertura de RF

| RF | Parte del plan |
|---|---|
| RF-01 | `app-tabs.tsx` (pestaña "Ajustes") + `src/app/settings.tsx` (Decisión 002) |
| RF-02 | `domain/settings.ts` + `cycle.ts` parametrizado + `use-settings` contexto + `use-pomodoro-session` (`nextTimerFor` al transicionar) + pantalla |
| RF-03 | `storage/settings.ts` (`@pomodoro/settings`, defectos ante ausencia) |
| RF-04 | `domain/settings.ts` (`validateSettingsField`, rangos Decisión 001) |
| RF-05 | `domain/settings.ts` (`validateSettingsForm` atómico; Decisión 004) + pantalla (errores en rojo por campo; Decisión 005) |
| RF-06 | `domain/settings.ts` (`resetSettingsInput`) + pantalla (diálogo de confirmación; Decisión 008) |
| RF-07 | `use-pomodoro-session` no toca el temporizador actual (DT-5; Decisiones 006, 007) + `nextTimerFor(cycle, settings)` |
| RF-08 | Restablecer → solo pantalla; persiste con "Guardar" (pantalla + `use-settings.saveSettings`; Decisiones 006, 008, 009) |
| RF-09 | `advanceCycle(cycle, settings.pomodorosPerCycle)` en el hook (Decisión 003) + pruebas de `cycle.test.ts` |
| RF-10 | Campos locales + `useFocusEffect` rehidrata desde el contexto (DT-7; Decisión 008) |
| RNF-01 | `storage/settings.ts` solo AsyncStorage, sin dependencias remotas |
| RNF-02 | Suites nuevas de `domain/settings.test.ts`, `cycle.test.ts` y `storage/settings.test.ts` |
