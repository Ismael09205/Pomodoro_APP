# Tareas — 005-ajustar-tiempos-pomodoro

Orden por dependencias. Tareas de lógica verificadas con `npx jest` (y `npx tsc --noEmit` cuando corresponda); las tareas de interfaz se verifican con los puntos aplicables de la lista manual de `rn-conventions` en Expo Go.

Si salen más de 10 tareas, se propone dividir la spec. Actualmente se proponen 8 tareas (≤ 10).

Sin dependencias nuevas sin autorización. Se reutilizan las ya existentes.

## Tareas

- [ ] **T1. Dominio: tipos, defectos y validación pura de ajustes.** RF-04, RF-05, RF-06 — Creado `src/domain/settings.ts` y `src/domain/__tests__/settings.test.ts` (DT-1, DT-6).
  - Hecho cuando: `npx jest` pasa en `src/domain/__tests__/settings.test.ts` cubriendo `validateSettingsField` (rechaza vacío, cero, decimales, texto y fuera de rango en cada campo; acepta los límites 1, 120 y 12; el mensaje indica el rango — Decisión 001), `validateSettingsForm` (devuelve `values: null` si un campo es inválido y no propone guardar nada — Decisión 004), `DEFAULT_SETTINGS` (25/5/15/4) y `resetSettingsInput`. `npx tsc --noEmit` sin errores en `src/domain/`.

- [ ] **T2. Dominio: parametrizar duraciones del ciclo con los ajustes.** RF-02, RF-07, RF-09 — Modificados `src/domain/cycle.ts` y `src/domain/__tests__/cycle.test.ts` (DT-2).
  - Hecho cuando: `npx jest` pasa en `src/domain/__tests__/cycle.test.ts` cubriendo `durationForPhase` con ajustes personalizados (minutos→ms), `nextTimerFor` que crea el temporizador de la siguiente fase con la duración configurada (RF-07) y `advanceCycle` con `pomodorosPerCycle` personalizado que da `longBreak` cuando el contador ya alcanza o supera el nuevo valor, p. ej. contador 5 con perCycle 3 (RF-09; Decisión 003), sin regresiones del comportamiento previo. `npx tsc --noEmit` sin errores; los llamantes existentes del hook compilan ajustando solo argumentos.

- [ ] **T3. Persistencia: cargar y guardar ajustes en `@pomodoro/settings`.** RF-03 — Creado `src/storage/settings.ts` y `src/storage/__tests__/settings.test.ts` (DT-4).
  - Hecho cuando: `npx jest` pasa con AsyncStorage simulado (patrón de `cycle-state.test.ts`): `loadSettings` devuelve los defectos ante clave ausente y ante JSON inválido; `saveSettings` + `loadSettings` conservan los 4 valores (ida y vuelta). Formato `{ version: 1, ... }`; claves existentes intactas (Constitución 5). `npx tsc --noEmit` sin errores.

- [ ] **T4. Contexto de ajustes compartido (`SettingsProvider`).** RF-02, RF-03, RF-08, RF-10 — Creado `src/hooks/use-settings.ts` y modificado `src/app/_layout.tsx` (DT-3).
  - Hecho cuando: `npx tsc --noEmit` sin errores. `SettingsProvider` envuelve `AppTabs` en `_layout.tsx`; `useSettings()` expone los ajustes cargados desde storage, los defectos mientras carga y `saveSettings` que persiste (T3) y actualiza el estado en memoria. Una única fuente para Home y Ajustes.

- [ ] **T5. Orquestación: la sesión consume los ajustes vigentes.** RF-02, RF-07, RF-09 — Modificado `src/hooks/use-pomodoro-session.ts` (DT-2, DT-5).
  - Hecho cuando: `npx tsc --noEmit` sin errores. `completionFor` y el efecto de notificación programada usan `settings.pomodorosPerCycle` (ya no el valor fijo) y `nextTimerFor(nextCycle, settings)`; el temporizador inicial se construye con la duración configurada tras cargar. Guardar ajustes NO modifica el temporizador de la fase en curso (corriendo, en pausa o inicial en curso): conserva `durationMs` y `remainingMs`.

- [ ] **T6. Interfaz: pantalla de ajustes y pestaña "Ajustes".** RF-01, RF-05, RF-06, RF-10 — Creado `src/app/settings.tsx` (reemplaza `src/app/explore.tsx`, Decisión 002), modificado `src/components/app-tabs.tsx` (y `.web.tsx` si aplica).
  - Hecho cuando: `npx tsc --noEmit` sin errores. La barra inferior muestra "Home" y "Ajustes" (sin "Explore"). La pantalla tiene 4 campos con `keyboardType="number-pad"`, mensajes de error en rojo debajo de cada campo inválido con su rango (Decisión 005), "Guardar" que valida con el dominio y llama a `saveSettings` solo si todo es válido (atómico, Decisión 004), "Restablecer" con `Alert.alert` de confirmación que rellena 25/5/15/4 solo en pantalla (Decisión 008) y `useFocusEffect` que rehidrata los campos al entrar (RF-10). Puntos aplicables de `rn-conventions`: teclado no tapa campos ni botones, objetivos ≥44x44, etiquetas de accesibilidad, textos en español, áreas seguras. Paleta `cotopaxi-brand` y Claymorphism donde corresponda.

- [ ] **T7. Pruebas integradas y tipos.** Todos los RF/RNF — Suite completa sin regresiones de las specs 001–004.
  - Hecho cuando: `npx jest` pasa completo (suites anteriores + `settings.test.ts` del dominio y del storage, sin regresiones) y `npx tsc --noEmit` sin errores.

- [ ] **T8. Verificación manual en Expo Go de los cuatro escenarios de la HU-005.** Todos los RF/RNF — Verificación con el usuario en dispositivo/emulador.
  - Hecho cuando: se verifican en Expo Go: (1) cambiar un tiempo y guardar → se usa desde la próxima fase y sobrevive a cerrar la app (RF-02, RF-03); (2) valor no válido → no guarda nada y el campo indica su rango (RF-04, RF-05); (3) restablecer y confirmar → 25/5/15/4 en pantalla, persiste solo al Guardar (RF-06, RF-08); (4) con una fase en curso (corriendo o en pausa) → esa fase conserva su tiempo y el cambio rige desde la siguiente (RF-07), incluido el contador ya superior al nuevo valor de pomodoros (RF-09); salir sin guardar descarta (RF-10). Lista manual de `rn-conventions`: vertical, teclado sin tapar, cierre y reapertura conserva los ajustes, textos legibles sin depender del color. `MEMORY.md` actualizado solo en "Estado actual" y "Próximos pasos".
