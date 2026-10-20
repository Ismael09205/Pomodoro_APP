# Spec 002 — Alternar entre estudio y descanso

Estado: Aprobada
HU de origen: docs/historias/HU-002.md

## Contexto y objetivo

La HU-002 define que la aplicación pase sola del tiempo de estudio al de descanso y vuelva al estudio, siguiendo la técnica Pomodoro sin que el estudiante tenga que llevar la cuenta manualmente.

La spec 001 ya definió los controles de la sesión (iniciar, pausar, continuar, reiniciar) y, en su versión original, que al llegar a 00:00 la fase quedaba en estado "Finalizado" sin transición automática, delegando esa transición a esta iniciativa. La Decisión 002 de esta spec reemplaza esa regla: al llegar a 00:00 la app carga de inmediato la siguiente fase en estado Inicial.

Esta spec define, por tanto: en qué momento y estado se carga la siguiente fase, cuándo incrementa y cuándo vuelve a cero el contador de pomodoros del ciclo, qué se persiste de la fase y del contador, cuándo incrementa el contador de sesiones "Completadas" del resumen diario, y qué muestra la pantalla principal sobre el avance del ciclo.

## Usuarios

Estudiante que usa la aplicación para gestionar sesiones de estudio y descanso con la técnica Pomodoro.

## Historias de usuario

**HU-002: Alternar entre estudio y descanso**

Como estudiante, quiero que la aplicación pase del tiempo de estudio al de descanso, para seguir la técnica Pomodoro sin tener que llevar la cuenta manualmente.

Escenarios de aceptación:

1. **Terminar un pomodoro.** Dado que termina un tiempo de estudio, cuando todavía no completó los pomodoros necesarios para el descanso largo, entonces la aplicación deja listo un descanso corto para que él lo inicie.
2. **Llegar al descanso largo.** Dado que completó la cantidad de pomodoros configurada (cuatro por defecto), cuando termina el último tiempo de estudio, entonces la aplicación deja listo un descanso largo y el contador de pomodoros vuelve a cero.
3. **Terminar un descanso.** Dado que termina un descanso corto o largo, cuando vuelve a la aplicación, entonces la aplicación deja listo el siguiente tiempo de estudio.
4. **Ver mi avance.** Dado que está en una sesión, cuando mira la pantalla principal, entonces ve si está en estudio o en descanso y cuántos pomodoros lleva en el ciclo actual.

## Definiciones

- **Fase:** tramo de tiempo de estudio, descanso corto o descanso largo.
- **Ciclo:** secuencia de fases desde un tiempo de estudio hasta el descanso largo correspondiente.
- **Contador del ciclo:** cantidad de pomodoros (fases de estudio) completados en el ciclo actual.
- **"Dejar listo" un tramo:** pasar a la siguiente fase en estado Inicial, con el tiempo completo de esa fase y el control "Iniciar" (Decisión 002).

## Requisitos funcionales

- RF-01: CUANDO el tiempo de estudio llega a 00:00 y todavía no se alcanzó la cantidad de pomodoros configurada, EL SISTEMA deja listo un descanso corto en estado Inicial, con el tiempo completo del descanso corto y el control "Iniciar". Origen: HU-002, escenario "Terminar un pomodoro"; Decisión 002.
- RF-02: CUANDO el tiempo de estudio llega a 00:00, EL SISTEMA incrementa en uno el contador de pomodoros del ciclo. Origen: Decisión 003.
- RF-03: CUANDO el tiempo de estudio llega a 00:00 habiéndose alcanzado la cantidad de pomodoros configurada (cuatro por defecto), EL SISTEMA deja listo un descanso largo en estado Inicial, con el tiempo completo del descanso largo y el control "Iniciar", y el contador del ciclo vuelve a cero. Origen: HU-002, escenario "Llegar al descanso largo"; Decisión 002; Decisión 003.
- RF-04: CUANDO el tiempo de un descanso corto o largo llega a 00:00, EL SISTEMA deja listo el siguiente tiempo de estudio en estado Inicial, con el tiempo completo del estudio y el control "Iniciar". Origen: HU-002, escenario "Terminar un descanso"; Decisión 002.
- RF-05: CUANDO una fase llega a 00:00 con la aplicación cerrada o el celular bloqueado, EL SISTEMA muestra, al volver, la siguiente fase lista en estado Inicial, con su tiempo completo y el control "Iniciar". Origen: Decisión 006.
- RF-06: EL SISTEMA no muestra ninguna fase en estado Finalizado: al llegar a 00:00 la fase actual cambia de inmediato a la siguiente en estado Inicial. Origen: Decisión 002.
- RF-07: EL SISTEMA no inicia ninguna fase automáticamente: toda fase siguiente comienza únicamente cuando el estudiante pulsa "Iniciar". Origen: Decisión 002.
- RF-08: MIENTRAS el estudiante está en una sesión, EL SISTEMA muestra en la pantalla principal la etiqueta de la fase actual ("Estudio", "Descanso corto" o "Descanso largo") y el contador como "Pomodoros: <completados>/<configurados>", donde <configurados> es la cantidad configurada de pomodoros por ciclo. Origen: HU-002, escenario "Ver mi avance"; Decisión 008.
- RF-09: MIENTRAS está en curso un descanso corto o largo, EL SISTEMA no modifica el contador de pomodoros del ciclo. Origen: Decisión 003.
- RF-10: SI una fase de estudio se reinicia antes de llegar a 00:00 y más tarde se vuelve a completar, ENTONCES EL SISTEMA incrementa el contador del ciclo una sola vez por esa fase. Origen: Decisión 003 (Decisión 027 de la spec 001).
- RF-11: CUANDO la aplicación se cierra y se vuelve a abrir, EL SISTEMA conserva la fase actual y el contador de pomodoros del ciclo. Origen: Decisión 004.
- RF-12: SI el estudiante reinicia un descanso, ENTONCES EL SISTEMA devuelve ese descanso a su tiempo inicial sin modificar el contador del ciclo ni el resumen diario. Origen: Decisión 007.
- RF-13: EL SISTEMA no ofrece ningún control para saltar un descanso: el siguiente tramo sigue siendo ese descanso hasta que se complete. Origen: Decisión 007.
- RF-14: CUANDO el tiempo de estudio llega a 00:00 sin haber sido marcada como incompleta, EL SISTEMA incrementa en uno el contador de sesiones "Completadas" del resumen diario. Origen: Decisión 005; Decisión 009.
- RF-15: SI una sesión de estudio marcada como incompleta se completa más tarde, ENTONCES EL SISTEMA la contabiliza como completada sin crear una sesión nueva: "Completadas" aumenta en uno y "Incompletas" disminuye en uno. Es el único camino de incremento para estas sesiones; no se aplica además el incremento de RF-14. Origen: Decisión 005; Decisión 009.
- RF-16: MIENTRAS está en curso un descanso, EL SISTEMA no modifica el resumen diario de sesiones. Origen: Decisión 005.

## Requisitos no funcionales

- RN-01: La alternancia de fases, el contador del ciclo y las reglas del resumen diario deben mantenerse separados de la interfaz y de la persistencia, y poder comprobarse de forma independiente. Origen: Constitución 9.
- RN-02: La lógica del ciclo, del contador y del resumen diario debe verificarse con pruebas automatizadas antes de considerar terminada su implementación. Origen: Constitución 10.
- RN-03: La fase y el contador del ciclo deben conservarse al cerrar y reabrir la aplicación sin alterar ni invalidar los datos ya guardados por la spec 001. Origen: Constitución 5; Decisión 004.
- RN-04: El comportamiento de la alternancia debe ser el mismo con la aplicación abierta, con la aplicación cerrada y con el celular bloqueado. Origen: Constitución 3; Decisión 006.

## Casos límite

- Fase que termina con la aplicación cerrada o el celular bloqueado: como el descanso no arranca hasta que se pulsa "Iniciar", mientras la app está cerrada solo puede terminar una fase; nunca hay fases vencidas encadenadas ni tiempo de descanso que descontar. (Decisión 006)
- Descanso largo listo y sin iniciar: la pantalla muestra "Pomodoros: 0/<configurados>" hasta que se inicie o se complete el descanso. (Decisión 003; Decisión 008)
- Sesión de estudio reiniciada y luego completada: cuenta una sola vez en el contador del ciclo. (Decisión 003; Decisión 027 de la spec 001)
- Sesión de estudio marcada como incompleta que se completa más tarde: pasa de incompleta a completada sin crear una sesión nueva. (Decisión 005)
- Reiniciar un descanso: no altera el contador del ciclo ni el resumen diario, y el estudiante no puede llegar al siguiente tiempo de estudio sin haber iniciado y terminado ese descanso. (Decisión 007)

## Fuera de alcance

- Recuperación del tiempo restante de la fase en curso al cerrar o reabrir la aplicación (HU-003; Decisión 004).
- Avisos de finalización y notificaciones (HU-004; Decisión 004).
- Configuración de las duraciones de estudio y descansos, y de la cantidad de pomodoros por ciclo (HU-005).
- Los controles de sesión de la spec 001 (iniciar, pausar, continuar, reiniciar) y el registro y contenido del resumen diario, salvo el incremento del contador de "Completadas" que esta spec define (Decisión 005).
- La sincronización del documento de la spec 001, cuya Decisión 004 / RF-08 queda reemplazada por la Decisión 002 de esta spec.

## Criterios de finalización

- Los cuatro escenarios de la HU-002 quedan cubiertos y verificados en la implementación.
- La lógica del ciclo, del contador y del resumen diario pasa las pruebas automatizadas con Jest.
- La fase y el contador del ciclo se conservan al cerrar y reabrir la aplicación.
- La pantalla principal muestra la etiqueta de la fase y el contador con el formato de la Decisión 008, incluido el caso "Pomodoros: 0/<configurados>" con el descanso largo listo.
- Al llegar a 00:00 ninguna fase queda visible en estado Finalizado y la siguiente aparece lista con "Iniciar".
- Verificación manual en Expo Go de la alternancia, del texto de "Ver mi avance" y del comportamiento al cerrar y reabrir la aplicación.

## Dudas abiertas

Sin dudas abiertas.
