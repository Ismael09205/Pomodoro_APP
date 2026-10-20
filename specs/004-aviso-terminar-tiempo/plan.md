# Plan 004 — Aviso al terminar el tiempo

Fuentes: `specs/004-aviso-terminar-tiempo/spec.md` (alcance refinado por Decisión 011), `specs/004-aviso-terminar-tiempo/decisiones.md` (Decisiones 001–011), `docs/historias/HU-004.md`, `docs/constitution.md`, planes de las specs 001, 002 y 003 (arquitectura y código existentes).

## Alcance estricto

Dentro de alcance:
- Aviso al llegar el temporizador a cero: notificación local con sonido/vibración predeterminados, sujetos a los permisos y ajustes del sistema (RF-01, RF-02; Decisión 011).
- Contenido del aviso: fase terminada y siguiente fase (RF-03; Decisión 002).
- Detención del aviso únicamente con botón "Detener" dentro de la app (RF-05; Decisiones 003, 004).
- Al detener, la app muestra la siguiente fase de inmediato (RF-05; Decisión 004).
- Estado visual de aviso activo hasta que se detenga; el sonido/vibración de la notificación no se repite de forma garantizada (RF-04; Decisión 011).
- Solicitud de permiso de notificaciones solo al iniciar una sesión de estudio por primera vez (RF-06; Decisión 005).
- Si se deniega permiso: bloquear inicio del temporizador hasta otorgarlo; reintentar desde app y, si el sistema ya no lo muestra, indicar habilitarlo en ajustes del sistema (RF-07; Decisiones 006, 009).
- Notificación local programada al iniciar/reanudar para que el sistema pueda entregarla con la app abierta o en segundo plano (RF-08; Decisión 008). Fuera de alcance: app completamente cerrada (killed).
- Mientras el estado de aviso permanece activo y el usuario abre la app sin pulsar "Detener": mostrar "fase terminada / aviso activo" sin contador ni siguiente fase (RF-09; Decisiones 010, 011).

Fuera de alcance (no se toca):
- Configuración de duraciones/pomodoros por ciclo (HU-005).
- Cambios en `advanceCycle`/`applyTimerCompletion` ya aprobados (se reutilizan).
- Persistencia de datos existente (se respeta Constitución 5).
- Añadir backend/cuentas/publicidad/servicios externos (Constitución 8).

## Arquitectura y separación de responsabilidades

Se conserva la separación aprobada (Constitución 9; skill `pomodoro-domain`):

- **Dominio** (`src/domain/`): TypeScript puro, sin React ni AsyncStorage. Nuevo módulo `alarm.ts` para reglas puras del aviso (qué mostrar, cuándo bloquear inicio, transiciones del estado de alarma). No se modifican `timer.ts`, `cycle.ts`, `session-record.ts`.
- **Servicios/infra** (`src/services/` o integrado según patrón existente): abstracción para notificaciones/permisos/vibración/sonido. Debe ser intercambiable y testeable; la lógica de decisión vive en dominio. Si no existe carpeta `src/services/`, se crea solo si es estrictamente necesario y respeta estructura existente.
- **Orquestación** (`src/hooks/use-pomodoro-session.ts`): programa la notificación al iniciar/reanudar y la cancela al pausar/reiniciar; gestiona vencimiento, estado visual (`alarmActive`) y permisos; expone `stopAlarm()` para descartar la notificación y avanzar a la siguiente fase.
- **Interfaz** (`src/app/index.tsx`): añade botón "Detener" visible mientras `alarmActive` esté true, muestra estado "fase terminada / aviso activo" sin contador cuando corresponda (RF-09), y no muestra la siguiente fase hasta detener. Respeta `cotopaxi-brand` y lista manual de `rn-conventions`.

## Archivos que se crean o modifican

| Archivo | Tipo | Responsabilidad | RF |
|---|---|---|---|
| `src/domain/alarm.ts` | nuevo | Reglas puras: `AlarmState` (`idle` \| `active`), `shouldRequestNotificationPermissionOnFirstStudyStart(...)`, `canStartTimerWithPermission(...)`, `getAlarmContent(endedPhase, nextPhase)` (texto con fase terminada y siguiente fase), `getStopActionResult()` (detener → avanzar a siguiente fase). Sin React/AsyncStorage. | RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-09 |
| `src/domain/__tests__/alarm.test.ts` | nuevo | Pruebas Jest puras del dominio de alarma. | ver T1 |
| `src/services/notifications.ts` | nuevo (si no existe) | Abstracción para permisos, programar/cancelar notificación local con canal de alta importancia, sonido predeterminado y vibración sujetos al sistema. Debe funcionar sin conexión (RNF-01). Sin lógica de negocio. | RF-01, RF-02, RF-04, RF-08 |
| `src/hooks/use-pomodoro-session.ts` | modificado | Programar la notificación al iniciar/reanudar y cancelarla al pausar/reiniciar; procesar el vencimiento y conservar el estado visual de aviso hasta detener. | RF-01,RF-02,RF-03,RF-04,RF-05,RF-06,RF-07,RF-08,RF-09 |
| `src/app/index.tsx` | modificado | UI: botón "Detener" cuando `alarmActive`; estado "fase terminada / aviso activo" sin contador cuando corresponda (RF-09); mostrar contenido del aviso según `getAlarmContent`. Sin cambios visuales fuera de lo necesario. | RF-03,RF-05,RF-09 |
| `app.json` (o `app.config.*`) | modificado solo si necesario | Configurar el plugin de notificaciones para compilaciones nativas. | RF-01,RF-02,RNF-02 |
| `MEMORY.md` | modificado | Solo "Estado actual" y "Próximos pasos". | — |

No se modifican: `src/domain/timer.ts`, `src/domain/cycle.ts`, `src/domain/session-record.ts`, `src/storage/*` salvo si estrictamente necesario para marcar "permiso solicitado ya" (ver DT-2). Navegación fuera de lo requerido.

## Funciones puras de lógica

### `src/domain/alarm.ts` (nuevo)

- `export type AlarmState = 'idle' | 'active';`
- `export type AlarmContent = { title: string; body: string; endedPhaseLabel: string; nextPhaseLabel: string };`
- `export const getAlarmContent = (endedPhase: StudyPhase, nextPhase: StudyPhase): AlarmContent` — produce texto con fase terminada y siguiente fase (RF-03; Decisión 002). Usa `phaseLabel` de `cycle.ts`.
- `export const shouldRequestNotificationPermissionOnFirstStudyStart = (params: { phase: StudyPhase; permissionRequestedBefore: boolean }): boolean` — true solo al iniciar sesión de estudio por primera vez y sin haber solicitado permiso antes (RF-06; Decisión 005).
- `export const canStartTimerWithPermission = (status: NotificationPermissionStatus): { allowed: boolean; reason?: 'denied' }` — si denegado, no permite iniciar (RF-07; Decisión 006).
- `export const getPermissionRetryGuidance = (status: NotificationPermissionStatus, systemCanPrompt: boolean): { action: 'retry' | 'openSettings' | 'none'; message: string }` — reintentar desde app; si sistema ya no muestra prompt, indicar habilitar en ajustes (RF-07; Decisión 009).
- `export const alarmStopAdvancesToNext = (): boolean` — true (RF-05; Decisión 004).

Nota: `NotificationPermissionStatus` es un tipo propio del dominio/servicio; no depende de APIs nativas.

## Persistencia

- **Permiso solicitado**: si se necesita recordar "ya se solicitó permiso alguna vez" para no solicitarlo de nuevo fuera del primer inicio de estudio, usar una clave en storage existente o nueva solo si justificado. Debe respetar Constitución 5 (no invalidar datos existentes). Citar Decisión 005. Si no es estrictamente necesario con el flujo, evitarlo.
- **Estado de alarma**: no persistir alarma activa entre reinicios si va en contra de RF-09 (mientras suena y se abre app sin detener, se muestra estado activo). Evaluar caso por caso; priorizar comportamiento definido.
- **Sin cambios a `@pomodoro/cycle-state` o `@pomodoro/study-record`** salvo autorización explícita.

## Algoritmos en pseudocódigo

### 1. Disparar aviso al vencer
```
alVencer(ahora):
  - completar fase vía camino único (applyTimerCompletion + advanceCycle) para obtener nextCycle/nextRecord/nextTimer (ya existente)
  - si app abierta o en segundo plano (Decisión 008): activar alarma con getAlarmContent(endedPhase, nextCycle.phase)
  - mostrar botón "Detener"; si usuario abre app sin detener, mostrar "fase terminada / aviso activo" sin contador (RF-09)
  - la app conserva el estado visual de aviso hasta detener; el sonido/vibración de la notificación lo controla el sistema operativo (RF-04)
```

### 2. Flujo de permiso
```
alIniciarEstudioPrimeraVez():
  si permiso ya concedido: permitir
  si no solicitado antes y fase == study: solicitar permiso con explicación (RF-06)
  si denegado: bloquear inicio (RF-07). Al reintentar: volver a solicitar; si sistema no muestra, guiar a ajustes (Decisión 009)
```

### 3. Detener aviso
```
stopAlarm():
  - descartar la notificación presentada (servicio)
  - establecer alarmActive = false
  - aplicar transición a siguiente fase de inmediato (ya calculada o calcular con estado guardado) mostrando siguiente fase (RF-05, Decisión 004)
```

### 4. UI estado alarma activa
```
si alarmActive:
  - mostrar texto "fase terminada / aviso activo" (RF-09)
  - NO mostrar contador/tiempo restante de siguiente fase
  - mostrar botón "Detener" (obligatorio)
  - al pulsar Detener → stopAlarm() y mostrar siguiente fase
```

## Cómo se pinta en la interfaz

`src/app/index.tsx`:
- Cuando `alarmActive` sea true: reemplazar/ocultar contador por estado de aviso activo, mostrar etiquetas de fase terminada y siguiente fase (RF-03), botón "Detener" prominente (≥44x44). Colores `cotopaxi-brand` (#181759, #C69214, #FFFFFF), Claymorphism si aplica según skill.
- Mientras el estado de aviso permanece activo y app se abre sin detener: mismo estado sin contador, sin mostrar siguiente fase hasta detener (RF-09).
- Respeta legibilidad, orientación vertical, sin depender solo del color (lista `rn-conventions`).
- Textos en español.

## Decisiones técnicas justificadas (con alternativa descartada)

| # | Decisión | Justificación | Alternativa descartada |
|---|---|---|---|
| DT-1 | Nuevo módulo puro `domain/alarm.ts` | Reglas de permiso/contenido/flujo testeables sin React/native (Constitución 9,10). | Poner lógica en hook/UI → difícil de probar, mezcla responsabilidades. |
| DT-2 | Recordar "permiso solicitado" solo si necesario vía storage con clave separada y compatible | Cumple RF-06/RF-07 sin romper datos existentes (Constitución 5). Solo si el flujo lo requiere; documentar. | Solicitar permiso cada vez → viola Decisión 005. |
| DT-3 | Abstracción `services/notifications.ts` | Aísla APIs nativas (permisos, programación local, canal, vibración y sonido predeterminado sujetos al sistema). Permite funcionar offline (RNF-01). | Llamar APIs directamente desde hook/UI → acoplamiento, difícil de testear. |
| DT-4 | Estado `alarmActive` en hook, descartado solo con botón "Detener" | Cumple Decisiones 003,004,009,010,011. | Permitir detener desde notificación → explícitamente fuera de alcance/descartado (Decisión 003). |
| DT-5 | Reutilizar camino único de vencimiento para pasar a siguiente fase al detener | Mantiene consistencia con specs 001-003 (Constitución 3,4). | Duplicar lógica de transición → riesgo de inconsistencia. |
| DT-6 | No soportar aviso con app completamente cerrada (killed) | Conforme a Decisión 008. Documentar limitación (RNF-02). | Usar notificaciones persistentes complejas sin garantía → fuera de alcance y no verificable. |

## Estrategia de pruebas con Jest

Comandos: `npx jest`, `npx tsc --noEmit`.

- **`src/domain/__tests__/alarm.test.ts`** (T1): `getAlarmContent` incluye fase terminada y siguiente fase (RF-03). `shouldRequestNotificationPermissionOnFirstStudyStart` solo true en primer inicio de estudio (RF-06). `canStartTimerWithPermission` bloquea si denegado (RF-07). `getPermissionRetryGuidance` reintenta desde app o guía a ajustes (Decisión 009). Casos límite.
- **Suite completa** (T5): sin regresiones en specs 001-003.
- **Manual (Expo Go)**: RF-01,RF-02,RF-04,RF-05,RF-08,RF-09 y permisos (RF-06,RF-07). Verificar aviso al frente/fondo y registrar efecto real de silencio/No molestar y duración del sonido (Decisión 011; RNF-02). Checklist en tasks.md.

## Cobertura de RF

| RF | Parte del plan |
|---|---|
| RF-01 | `services/notifications.ts` + `domain/alarm.ts` + hook (sonido/vibración predeterminados sujetos al sistema) |
| RF-02 | `services/notifications.ts` (canal de alta importancia, sin eludir silencio/No molestar) |
| RF-03 | `domain/alarm.ts` (`getAlarmContent`) + `app/index.tsx` |
| RF-04 | `services/notifications.ts` (notificación de una sola entrega) + hook estado visual `alarmActive` hasta detener |
| RF-05 | `app/index.tsx` botón "Detener" + hook `stopAlarm()` + dominio (avanza fase inmediata) |
| RF-06 | `domain/alarm.ts` + hook (primer inicio estudio) + explicación permiso |
| RF-07 | `domain/alarm.ts` + hook (bloquear inicio, reintentar, guiar a ajustes) |
| RF-08 | hook (programar notificación local al iniciar/reanudar; el SO puede entregarla en segundo plano) |
| RF-09 | hook + `app/index.tsx` (estado sin contador hasta detener) |
| RNF-01 | `services/notifications.ts` sin deps remotas |
| RNF-02 | documentar limitaciones en verificación manual |
