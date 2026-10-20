# Decisiones — 002-alternar-estudio-descanso (HU-002)

Decisiones tomadas en la entrevista con la skill `grill-me` sobre la HU-002 "Alternar entre estudio y descanso", con base en `docs/constitution.md`, `AGENTS.md` y las decisiones ya aprobadas en `specs/001-iniciar-sesion-estudio/decisiones.md`. Fecha: 19/10/2026.

## Decisión 001 — Alcance de la iniciativa

- **Pregunta:** La entrevista se solicitó primero sobre la HU-001, pero la carpeta destino `specs/002-alternar-estudio-descanso/` coincide con el título literal de la HU-002 y la HU-001 ya está cubierta por la spec 001 (aprobada, 27 decisiones, sin dudas abiertas). ¿Qué historia corresponde a esta iniciativa?
- **Respuesta:** La HU-002 "Alternar entre estudio y descanso". La HU-001 se usa solo como contexto de los controles y estados ya definidos.
- **Motivo:** El nombre de la iniciativa debe reflejar su alcance real y no debe duplicar ni contradecir la spec 001 (Constitución 2 y 12).

## Decisión 002 — Momento y forma de "dejar listo" el siguiente tramo

- **Pregunta:** La spec 001 decidió (Decisión 004 / RF-08) que al llegar a 00:00 la fase queda en estado Finalizado, con "Reiniciar" como único control y sin transición automática, delegando esa transición a la HU-002. La HU-002 dice que la app "deja listo" el siguiente descanso o estudio. ¿En qué momento y en qué estado ocurre el cambio?
- **Respuesta:** Al llegar a 00:00, la app pasa de inmediato a la siguiente fase en estado Inicial, con el tiempo completo de esa fase y el control "Iniciar". El estado "Finalizado" deja de ser visible. La siguiente fase nunca arranca sola: siempre requiere que el estudiante pulse "Iniciar". La Decisión 004 / RF-08 de la spec 001 queda reemplazada por esta regla.
- **Motivo:** Es la lectura literal de "deja listo ... para que yo lo inicie", no añade estados ni botones nuevos (Constitución 1) y mantiene un único disparador ("Iniciar"), igual que en la HU-001.

## Decisión 003 — Cuándo incrementa el contador de pomodoros y cuándo vuelve a cero

- **Pregunta:** El escenario "Llegar al descanso largo" dice que al terminar el último estudio la app deja listo el descanso largo y "el contador de pomodoros vuelve a cero", pero no fija el momento exacto en que se cuenta un pomodoro, ni cuándo se reinicia, ni qué pasa con una sesión reiniciada que luego se completa.
- **Respuesta:** El contador incrementa en el 00:00 de cada fase de estudio completada y, si alcanza la cantidad configurada (4 por defecto), en ese mismo instante deja listo el descanso largo y vuelve a cero. Mientras el descanso largo está listo y sin iniciar, la pantalla muestra 0 pomodoros. Una sesión reiniciada y luego completada cuenta una sola vez (Decisión 027 de la 001). Los descansos nunca incrementan ni retroceden el contador.
- **Motivo:** Se alinea con "completé la cantidad de pomodoros configurada", hace coincidir el reinicio con el momento en que la app deja listo el descanso largo y evita perder un pomodoro si el estudiante no continúa con el descanso (Constitución 3 y 4).

## Decisión 004 — Persistencia de la fase y del contador del ciclo

- **Pregunta:** El escenario "Ver mi avance" exige ver la fase actual y los pomodoros del ciclo. La spec 001 (Decisión 026, RF-11) no persiste el temporizador en curso y delegó su recuperación a la HU-003. ¿Esta spec guarda la fase y el contador?
- **Respuesta:** Sí. La 002 persiste localmente la fase actual (estudio, descanso corto, descanso largo) y el contador del ciclo. La recuperación del tiempo restante de la fase en curso queda en la HU-003 y los avisos en la HU-004. Se añaden claves nuevas de almacenamiento; no se modifica ni invalida el formato ya guardado por la 001.
- **Motivo:** Es el mínimo para que "Ver mi avance" siga siendo cierto al cerrar y reabrir la app (Constitución 5 y 3) sin invadir la recuperación del tiempo en curso, ya delegada a la HU-003 (Constitución 12).

## Decisión 005 — Cuándo incrementa el contador de sesiones completadas del resumen diario

- **Pregunta:** La spec 001 muestra "Completadas: X · Incompletas: Y · Última sesión de estudio: <fecha>", pero dejó fuera de su alcance cuándo incrementa el contador de completadas (Decisión 025), remitiéndolo a las reglas del ciclo de la HU-002. ¿Cuál es la regla?
- **Respuesta:** "Completadas" incrementa en el 00:00 de cada fase de estudio, en el mismo instante en que incrementa el contador de pomodoros. Si esa sesión estaba marcada como incompleta (reiniciada antes y luego retomada), pasa de incompleta a completada: "Incompletas" baja 1 y "Completadas" sube 1, sin crear una sesión nueva. Los descansos no afectan el resumen diario.
- **Motivo:** Cierra la Decisión 025 de la 001 con la misma regla que decide el ciclo, mantiene coherentes el resumen diario y el contador del ciclo, y respeta la Decisión 027 de la 001 (una sesión retomada y completada no se duplica).

## Decisión 006 — Fase terminada con la app cerrada o el celular bloqueado

- **Pregunta:** La HU-003 dice que, si el tiempo termina con la app cerrada, "al abrir la aplicación, la fase aparece como terminada", lo que choca con la Decisión 002 (al 00:00 se carga de inmediato la siguiente fase). ¿Qué muestra la app al reabrir?
- **Respuesta:** Se aplica la regla general: al volver, la pantalla muestra la siguiente fase lista en Inicial (ej. descanso corto a 05:00 con "Iniciar"), y el fin de la fase lo comunica la notificación (HU-004). La redacción de HU-003 se ajusta a "la fase anterior figura terminada y la siguiente queda lista". Como el descanso no arranca hasta que se pulse "Iniciar", mientras la app está cerrada solo puede terminar una fase: nunca hay fases vencidas encadenadas ni tiempo de descanso que descontar.
- **Motivo:** Mantiene un solo comportamiento (Decisión 002) y evita un camino especial para el caso "app cerrada", sin pantallas ni textos nuevos (Constitución 1 y 3).

## Decisión 007 — Descansos interrumpidos o reiniciados y opción de saltar

- **Pregunta:** La spec 001 aplica los mismos controles a estudio y descanso (Decisión 003) y definió que reiniciar un descanso no deja marca ni modifica el registro (Decisión 010). La HU-002 no menciona interrumpir ni saltar un descanso. ¿Qué se define?
- **Respuesta:** No se añade ningún control nuevo; los descansos usan los controles de la HU-001 (iniciar, pausar, continuar, reiniciar). Reiniciar un descanso lo devuelve al tiempo inicial de ese mismo descanso y no altera ni el contador del ciclo ni el resumen diario. No hay atajo para saltar: el siguiente tramo sigue siendo ese descanso hasta que se complete. Consecuencia explícita: el estudiante no puede llegar a estudiar sin haber iniciado y terminado el descanso.
- **Motivo:** No añade funcionalidad que ninguna HU define (Constitución 2 y 12) y conserva un único temporizador con los estados ya aprobados.

## Decisión 008 — Texto de "Ver mi avance"

- **Pregunta:** El escenario pide ver si se está en estudio o en descanso y cuántos pomodoros se llevan en el ciclo, pero no fija textos. ¿Qué se muestra?
- **Respuesta:** El nombre de la fase con etiqueta explícita ("Estudio", "Descanso corto", "Descanso largo") y el contador como "Pomodoros: <completados>/<configurados>" (ej. "Pomodoros: 2/4"). El denominador es la cantidad configurada (HU-005); cuando el descanso largo ya quedó listo se muestra "Pomodoros: 0/4".
- **Motivo:** Es explícito y autocontenido, coherente con el estilo de etiquetas de la Decisión 016 de la 001, y el denominador deja ver el umbral que dispara el descanso largo.

## Decisión 009 — Incremento de "Completadas" sin duplicación

- **Pregunta:** RF-14 incrementa "Completadas" de forma incondicional en el 00:00 del estudio y RF-15 también incrementa "Completadas" cuando la sesión estaba marcada como incompleta; en ese 00:00 ambos se aplican y el contador podría subir dos.
- **Respuesta:** RF-14 aplica únicamente a las sesiones que no estaban marcadas como incompleta. Para una sesión marcada como incompleta que se completa más tarde, el único camino es RF-15: "Completadas" sube 1 y "Incompletas" baja 1. Toda sesión de estudio suma exactamente una vez.
- **Motivo:** Elimina el doble conteo manteniendo la regla de la Decisión 005 (un solo incremento en el 00:00) y la coherencia con el contador del ciclo (Decisión 003 / Decisión 027 de la spec 001). Constitución 4.

---

**Pendiente fuera de esta entrevista:** la recuperación del tiempo restante de la fase en curso (HU-003), los avisos de finalización (HU-004) y la configuración de duraciones y de la cantidad de pomodoros por ciclo (HU-005). Solo se registran aquí como dependencias; no se deciden en esta iniciativa.
