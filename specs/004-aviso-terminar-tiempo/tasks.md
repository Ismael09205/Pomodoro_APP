# Tareas — 004-aviso-terminar-tiempo

Orden por dependencias. Tareas de lógica verificadas con `npx jest` (y `npx tsc --noEmit` cuando corresponda); las tareas de interfaz se verifican con los puntos aplicables de la lista manual de `rn-conventions` en Expo Go.

Si salen más de 10 tareas, se propone dividir la spec. Actualmente se proponen 8 tareas (≤ 10).

Sin dependencias nuevas sin autorización. Se reutilizan las ya existentes.

## Tareas

- [x] **T1. Dominio: reglas puras de alarma y permisos.** RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-09 — Completada 19/10/2026. Creado `src/domain/alarm.ts` y `src/domain/__tests__/alarm.test.ts`.
  - Hecho cuando: `npx jest` pasa en `src/domain/__tests__/alarm.test.ts` cubriendo `getAlarmContent` (incluye fase terminada y siguiente fase), `shouldRequestNotificationPermissionOnFirstStudyStart` (solo primer inicio de estudio), `canStartTimerWithPermission` (bloquea si denegado), `getPermissionRetryGuidance` (reintentar desde app o guiar a ajustes). `npx tsc --noEmit` sin errores en `src/domain/`.

- [x] **T2. Servicio de notificaciones (abstracción).** RF-01, RF-02, RF-04, RF-08, RNF-01 — Completada 19/10/2026. Creado `src/services/notifications.ts` con permisos, canal Android de alta importancia, programación y cancelación de notificaciones locales.
  - Hecho cuando: existe `src/services/notifications.ts` con funciones tipadas. Compila con `npx tsc --noEmit`. No se añaden dependencias remotas. Documentado que funciona sin conexión (RNF-01).

- [x] **T3. Configuración nativa si necesaria.** RF-01, RF-02, RNF-02 — Completada 19/10/2026. Revisado `app.json` y configurado plugin de notificaciones según corresponda. Documentadas limitaciones para Expo Go.
  - Hecho cuando: cambios justificados y documentados. `npx tsc --noEmit` sin errores. Limitaciones anotadas para T7.

- [x] **T4. Orquestación: integrar alarma en hook.** RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09 — Completada 19/10/2026. Modificado `src/hooks/use-pomodoro-session.ts` con permiso, alarma activa y `stopAlarm()`.
  - Hecho cuando: `npx tsc --noEmit` sin errores. Al vencer con app abierta/segundo plano se activa alarma. `stopAlarm()` detiene aviso y muestra siguiente fase inmediatamente. Permisos según RF-06/RF-07.

- [x] **T5. Interfaz: botón Detener y estado de aviso activo.** RF-03, RF-05, RF-09 — Completada 19/10/2026. Modificado `src/app/index.tsx`.
  - Hecho cuando: UI compila. Puntos aplicables de lista manual `rn-conventions` cumplidos. Botón "Detener" ≥44x44. Textos en español. Colores correctos.

- [x] **T6. Pruebas unitarias integradas.** RF-01-RF-09 — Completada 19/10/2026.
  - Hecho cuando: `npx jest` pasa completo sin regresiones en specs 001-003. `npx tsc --noEmit` sin errores.

- [x] **T7. Verificación manual en Expo Go/dispositivo.** RF-01, RF-02, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RNF-01, RNF-02 — Completada 20/10/2026. Verificado en dispositivo: permiso concedido, aviso al vencer, botón "Detener" detiene y muestra siguiente fase, aviso en primer plano/segundo plano según entorno. Limitaciones documentadas (sonido/vibración sujetos a ajustes del sistema, No molestar, Expo Go limita módulos nativos; app completamente cerrada fuera de alcance).
  - Hecho cuando: verificación realizada. Limitaciones documentadas (RNF-02), sin afirmaciones no verificadas.

- [x] **T8. Verificación integral de HU-004.** Todos los RF/RNF — Completada 20/10/2026.
  - Hecho cuando: `npx jest` (8 suites / 75 pruebas) y `npx tsc --noEmit` pasan. Escenarios cubiertos según alcance aprobado. Documentación de limitaciones completa. MEMORY.md actualizado solo "Estado actual" y "Próximos pasos".
