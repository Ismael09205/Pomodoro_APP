# MEMORY.md - Aplicacion Pomodoro
Estado del trabajo entre sesiones. Máximo ~50 líneas.

## Estado actual
- Spec 001 aprobada; `plan.md` y `tasks.md` aprobados (9 tareas). Dependencias y supuestos RC-1 a RC-4 autorizados (19/10/2026).
- Spec 002 implementada y verificada: T1 a T6 completadas. Lógica con `npx jest` (6 suites / 45 pruebas) y `npx tsc --noEmit` (sin errores); verificación manual en Expo Go de T5/T6 confirmada por el usuario (19/10/2026).
- Spec 003 (HU-003): **implementada y verificada** 19/10/2026. T1 a T6 completadas. `npx jest` (7 suites / 69 pruebas) y `npx tsc --noEmit` sin errores; los cuatro escenarios de la HU-003 confirmados manualmente por el usuario en emulador Android (T5/T6). `src/app/index.tsx` sin cambios.
- 19/10/2026: durante la verificación de la 003 el usuario detectó pérdida total de datos al cerrar la app. Causa: `@react-native-async-storage/async-storage` 3.1.1 incompatible con el módulo nativo de Expo Go SDK 57 ("native module is null"). Con autorización del usuario se alineó a 2.2.0 (`npx expo install`) y se verificó la corrección. El fallo afectaba a toda persistencia (specs 001-003), no a la lógica.
- `specs/003-conteo-celular-bloqueado/spec.md` sigue con "Estado: Aprobado"; cambiarlo a "implementada" corresponde al usuario (no lo toca el agente de implementación).
- Spec 004 (HU-004): **implementada y verificada** 20/10/2026. T1–T8 completadas. `npx jest` (8 suites / 75 pruebas) y `npx tsc --noEmit` sin errores. Notificaciones locales con permiso, canal Android, botón "Detener" y aviso activo sin contador verificados en dispositivo. Limitaciones documentadas (sonido/vibración sujetos a ajustes del sistema/No molestar; Expo Go limita módulos nativos; app completamente cerrada fuera de alcance).
- Spec 005 (HU-005): `spec.md` aprobada (estado "aprobado"; el usuario confirmó su aprobación el 20/10/2026). Revisión QA realizada 20/10/2026: hallazgo de RF-08 resuelto con la Decisión 009.
- Spec 005: `plan.md` y `tasks.md` redactados 20/10/2026 (8 tareas). Pendiente la aprobación del usuario antes de implementar.
- Spec 006 (HU-006): `plan.md` y `tasks.md` aprobados por el usuario (20/10/2026). Tareas T1, T2 y T6 completadas. T3, T4 y T5 implementadas y con verificación automatizada en verde, pendientes de la confirmación manual del usuario en Expo Go; T7 pendiente. Verificación ejecutada: `npx jest` (11 suites / 139 pruebas, sin fallos) y `npx tsc --noEmit` (sin errores). Dos contradicciones entre specs 004 y 006 se resolvieron con el usuario en sesión (20/10/2026); su constancia queda en `tasks.md` (estado de T3) y su registro en `decisiones.md` corresponde al usuario.

## Próximos pasos
- Spec 006: el usuario ejecuta la lista manual de verificación en Expo Go (T3, T4, T5 y T7, con modo avión) y confirma; después, marcar esas tareas en `tasks.md`.
- Spec 005: esperar aprobación del usuario de `plan.md` y `tasks.md`; después, agente `sdd-implement` con la tarea T1.