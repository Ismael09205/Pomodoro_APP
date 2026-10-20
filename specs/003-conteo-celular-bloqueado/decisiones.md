# Decisiones — 003-conteo-celular-bloqueado (HU-003)

Decisiones tomadas en la entrevista con la skill `grilling` (invocada como `@grill-me`) sobre la HU-003 "Mantener el conteo con el celular bloqueado o la aplicación cerrada", con base en `docs/constitution.md`, `AGENTS.md`, `MEMORY.md` y las decisiones ya aprobadas en `specs/001-iniciar-sesion-estudio/decisiones.md` y `specs/002-alternar-estudio-descanso/decisiones.md`. Fecha: 19/10/2026.

Convención de respuestas: en la primera ronda el usuario respondió `A, A, B, A, A, A, A, A` para las preguntas 1 a 8; en la segunda ronda respondió `A, A, A, A, A, A` para las preguntas 9 a 14. El número de cada pregunta dentro de su ronda se indica en el encabezado.

## Decisión 001 — Qué se persiste para recuperar la cuenta (Ronda 1, Pregunta 1)

- **Pregunta:** El motor actual (`src/domain/timer.ts`) calcula el restante a partir de un instante real (`runningSinceMs`), pero solo se persiste la fase y los pomodoros (`src/storage/cycle-state.ts`). ¿Qué se guarda para recuperar la cuenta?
- **Respuesta:** Opción A. Se persiste el estado del temporizador (`state`, `durationMs`, `remainingMs`, `runningSinceMs`) además de la fase y los pomodoros, dentro de la clave `@pomodoro/cycle-state` ampliada.
- **Motivo:** Es el mínimo indispensable para que la app pueda reconstruir el restante al volver, y evita tener dos fuentes de verdad sobre el estado de la sesión (Constitución 1, 3 y 5).

## Decisión 002 — Fase vencida con el celular bloqueado o la app cerrada (Ronda 1, Pregunta 2)

- **Pregunta:** Con la app abierta, al 00:00 se avanza de inmediato (Decisiones 002 y 006 de la spec 002). ¿Qué se aplica al reabrir si la fase venció mientras la app estaba cerrada o el celular bloqueado?
- **Respuesta:** Opción A. Se aplica la regla general: la app queda en la siguiente fase en estado Inicial, con su tiempo completo y el control "Iniciar". El aviso de fin corresponde a la HU-004.
- **Motivo:** Como el descanso no arranca hasta pulsar "Iniciar", con la app cerrada solo puede vencer una fase; no hay fases encadenadas ni excedente que descontar. Mantiene un único comportamiento, ya aprobado en la Decisión 006 de la spec 002 (Constitución 1, 3 y 12).

## Decisión 003 — Cambios del reloj del dispositivo (Ronda 1, Pregunta 3; Ronda 2, Preguntas 9 a 13)

- **Pregunta:** La recuperación se basa en el reloj de pared (`runningSinceMs`). ¿Cómo se maneja un cambio de hora o de zona horaria mientras la cuenta corre? ¿Qué significa exactamente "salto anómalo"? ¿Qué pasa si el salto ocurre con la fase en pausa? ¿Qué estado deja el sistema? ¿Cómo se distingue de un cierre largo normal? ¿Se avisa al estudiante?
- **Respuesta:** Opción B en la primera ronda: se detecta un salto anómalo y en ese caso la fase se da por vencida. Las aclaraciones de la segunda ronda (todas Opción A) fijan la regla así:
  - **Detección (P9-A):** un salto anómalo es un **retroceso** del reloj: si el restante calculado resulta **mayor** que el restante que había al iniciar o continuar la fase (reloj atrasado o zona horaria retrocedida), la fase se da por vencida. No se aplica ningún margen para saltos hacia adelante.
  - **Fase en pausa (P10-A):** la detección solo aplica a una fase **corriendo**. Una fase pausada conserva su restante congelado y nunca se marca vencida por un salto del reloj.
  - **Estado resultante (P11-A):** el salto que vence la fase usa el **mismo camino de vencimiento** que un 00:00 normal (contador del ciclo, "Completadas" y `sessionMarked` según las Decisiones 003 y 005 de la spec 002) y deja lista la siguiente fase en Inicial.
  - **App cerrada (P12-A):** el umbral de detección **no se aplica** al caso "app cerrada". Si el restante calculado llegó a 0, es un vencimiento normal (Decisión 002 de esta spec) y se procesa como tal. La detección aplica únicamente con la app abierta o en primer plano, donde el salto se mide contra un intervalo de tick conocido.
  - **Aviso (P13-A):** no se muestra ni registra ninguna señal visible; la app queda con la siguiente fase lista en Inicial y el aviso de fin es de la HU-004.
- **Motivo:** El retroceso del reloj es imposible en el uso normal y es el caso que rompe la exactitud del tiempo (Constitución 3). Fijar el criterio, excluir la pausa y excluir el caso "app cerrada" evita marcar como error el uso más común (cerrar la app y volver al día siguiente) y no añade márgenes arbitrarios, pantallas ni textos nuevos (Constitución 1 y 2). El aviso se delega a la HU-004 (Constitución 12).

## Decisión 004 — Cuándo se guarda el estado del temporizador (Ronda 1, Pregunta 4)

- **Pregunta:** Hoy `use-pomodoro-session.ts` solo persiste en transiciones. ¿Cuándo se escribe el estado del temporizador?
- **Respuesta:** Opción A. Solo en transiciones: iniciar, pausar, continuar, reiniciar y al llegar a 00:00. No hay guardado periódico.
- **Motivo:** Guardando `runningSinceMs` y `remainingMs` al iniciar o continuar, el restante se reconstruye sin escrituras repetidas. Un guardado cada 500 ms desgastaría el almacenamiento sin mejorar la exactitud (Constitución 1 y 3).

## Decisión 005 — Recuperación de la fase pausada (Ronda 1, Pregunta 5)

- **Pregunta:** Si el estudiante pausa, cierra la app y la reabre, ¿se persiste también el estado pausado?
- **Respuesta:** Opción A. Sí: se persiste `state: 'paused'` con su `remainingMs` congelado. Al reabrir, la fase sigue pausada con el mismo restante, no se reanuda sola, el control es "Continuar" y no se produce ningún aviso.
- **Motivo:** Es literal del escenario "Pausar antes de cerrar" de la HU-003 y lo único que respeta el tiempo ya invertido (Constitución 3 y 5).

## Decisión 006 — Restante mostrado al reabrir con la fase ya vencida (Ronda 1, Pregunta 6)

- **Pregunta:** Si se cerró la app con la cuenta corriendo y se reabre cuando la fase ya venció hace tiempo, ¿qué muestra la pantalla?
- **Respuesta:** Opción A. La siguiente fase a su tiempo completo en estado Inicial. El vencimiento no deja tiempo negativo ni se arrastra.
- **Motivo:** Es la Decisión 006 de la spec 002 y el escenario "El tiempo termina con la aplicación cerrada" de la HU-003. El aviso de fin corresponde a la HU-004, fuera de esta iniciativa (Constitución 12).

## Decisión 007 — Resumen diario y contador del ciclo al vencer con la app cerrada (Ronda 1, Pregunta 7)

- **Pregunta:** El 00:00 ocurrido sin la app abierta debe incrementar "Completadas" y el contador del ciclo igual que con la app abierta. ¿Dónde y con qué fecha se aplica?
- **Respuesta:** Opción A. Al reabrir se procesa el vencimiento detectado con la **hora actual real** y se aplican las mismas reglas de las Decisiones 003 y 005 de la spec 002: incrementa el contador del ciclo y "Completadas"; si la sesión estaba marcada (`sessionMarked`), pasa de incompleta a completada sin duplicar. No se calcula una "hora exacta de vencimiento".
- **Motivo:** Usa el camino único de procesamiento ya existente (`applyTimerCompletion`), sin añadir un cálculo nuevo de hora de vencimiento, y mantiene coherentes el contador del ciclo y el resumen diario (Constitución 3 y 4). Consecuencia asumida: el corte del día de uso se evalúa con la hora de reapertura.

## Decisión 008 — Comportamiento con la app en segundo plano (Ronda 1, Pregunta 8)

- **Pregunta:** ¿Qué ocurre con la app en segundo plano pero sin cerrarla?
- **Respuesta:** Opción A. La app no ejecuta nada en segundo plano: al volver al frente recalcula el restante por reloj y procesa el vencimiento. Sin temporizadores ni tareas en segundo plano y sin notificaciones.
- **Motivo:** Expo/React Native no garantiza ejecución continua en segundo plano y, como el restante se deriva del reloj de pared, no se necesita. Se documenta como limitación de plataforma (Constitución 7) y no se adelanta trabajo de la HU-004 (Constitución 12).

## Decisión 009 — Versionado de la clave de almacenamiento (Ronda 2, Pregunta 14)

- **Pregunta:** Al ampliar `@pomodoro/cycle-state` con el bloque del temporizador hay que versionar. ¿Cómo se admite el formato ya guardado?
- **Respuesta:** Opción A. La clave sigue siendo `@pomodoro/cycle-state` con `version: 2` y un campo `timer` adicional. Al leer una v1 sin `timer`, se respetan la fase y los pomodoros guardados y el temporizador se reconstruye en estado Inicial con el tiempo completo de la fase guardada.
- **Motivo:** Mantiene una única fuente de verdad, no invalida ni pierde los datos ya guardados por las specs 001 y 002 (Constitución 5) y no cambia la clave de almacenamiento existente.

## Decisión 010 — Detección del salto anómalo con la aplicación cerrada o el celular bloqueado (aclaración posterior a la entrevista; 19/10/2026)

- **Pregunta:** La Decisión 003 (P12) excluía el caso "app cerrada" de la detección de salto anómalo, pero la RF-11 de la spec aplicaba la regla a toda fase Corriendo, lo que generaba una contradicción. ¿Dónde aplica la detección?
- **Respuesta:** La detección del salto anómalo del reloj aplica también cuando la aplicación está cerrada o el celular bloqueado. Al recuperar la sesión, si el restante calculado resulta mayor que el que había al iniciar o continuar la fase, la fase se da por vencida usando el mismo camino de vencimiento (Decisión 003, P11). Si el restante calculado llegó a 0, se trata como un vencimiento normal (Decisión 002 y Decisión 006).
- **Motivo:** Modifica la Decisión 003 (P12) para eliminar la exclusión de "app cerrada" y mantener un único criterio de detección, alineado con la RF-11 aprobada por el usuario (opción 3B).

---

**Pendiente fuera de esta entrevista:** los avisos de finalización y notificaciones (HU-004) y la configuración de duraciones y de la cantidad de pomodoros por ciclo (HU-005). Solo se registran aquí como dependencias; no se deciden en esta iniciativa.
