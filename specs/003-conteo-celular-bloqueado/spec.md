# Spec 003 — Mantener el conteo con el celular bloqueado o la aplicación cerrada

Estado: Aprobado 
HU de origen: docs/historias/HU-003.mdr

## Contexto y objetivo

La HU-003 define que el temporizador siga contando aunque el estudiante bloquee el celular o cierre la aplicación, de modo que no pierda el tiempo que lleva estudiando.

Hoy la spec 001 (Decisión 026) dejó fuera de su alcance la recuperación del temporizador en curso y la spec 002 (Decisión 004) persistió únicamente la fase y el contador del ciclo, declarando expresamente que el tiempo restante de la fase en curso pertenecía a la HU-003. Esta iniciativa cierra esa deuda: define qué información de la sesión en curso debe conservarse, cómo se reconstruye el tiempo restante al volver, qué ocurre cuando la fase vence sin la aplicación abierta y qué pasa si el reloj del dispositivo cambia mientras la cuenta corre.

Esta spec define, por tanto: la recuperación del tiempo restante al volver a la aplicación, el tratamiento del vencimiento ocurrido con el celular bloqueado o la aplicación cerrada, la conservación de la fase pausada y el efecto del cambio del reloj del dispositivo.

## Usuarios

Estudiante que usa la aplicación para gestionar sesiones de estudio y descanso con la técnica Pomodoro.

## Historias de usuario

**HU-003: Mantener el conteo con el celular bloqueado o la aplicación cerrada**

Como estudiante, quiero que el temporizador siga contando aunque bloquee el celular o cierre la aplicación, para no perder el tiempo que llevo estudiando.

Escenarios de aceptación:

1. **Bloquear el celular.** Dado que tiene el temporizador corriendo, cuando bloquea el celular y lo desbloquea unos minutos después, entonces la aplicación muestra el tiempo restante correcto, descontando lo que pasó mientras estaba bloqueado.
2. **Cerrar la aplicación.** Dado que tiene el temporizador corriendo, cuando cierra la aplicación desde las aplicaciones recientes y la vuelve a abrir, entonces la aplicación recupera la sesión y muestra el tiempo restante correcto.
3. **El tiempo termina con la aplicación cerrada.** Dado que cerró la aplicación con el temporizador corriendo, cuando el tiempo se cumple antes de que vuelva a abrirla, entonces recibe el aviso de fin y, al abrir la aplicación, la fase aparece como terminada.
4. **Pausar antes de cerrar.** Dado que pausó el temporizador, cuando cierra la aplicación y la vuelve a abrir, entonces el temporizador sigue pausado con el mismo tiempo restante y no recibe ningún aviso.

## Definiciones

- **Sesión en curso:** fase (estudio, descanso corto o descanso largo) con su temporizador en estado Corriendo o Pausado.
- **Tiempo restante:** tiempo que le falta a la fase en curso para llegar a 00:00.
- **Vencimiento:** momento en que el tiempo restante de la fase en curso llega a 0.
- **Salto anómalo del reloj:** retroceso del reloj del dispositivo, es decir, una lectura del reloj que hace que el tiempo restante calculado de una fase Corriendo resulte mayor que el que había al iniciar o continuar esa fase.
- **"Dejar lista" la siguiente fase:** mostrar la siguiente fase en estado Inicial, con su tiempo completo y el control "Iniciar" (Decisión 002 de la spec 002).

## Requisitos funcionales

- RF-01: EL SISTEMA conserva localmente la sesión en curso (la fase, su estado del temporizador —Corriendo o Pausado— y el tiempo restante) para poder reconstruirla. Origen: HU-003, escenario "Cerrar la aplicación"; Decisión 001.
- RF-02: CUANDO el estudiante desbloquea el celular con una fase Corriendo, EL SISTEMA muestra el tiempo restante correcto, descontando el tiempo transcurrido mientras el celular estaba bloqueado. Origen: HU-003, escenario "Bloquear el celular"; Decisión 001; Decisión 008.
- RF-03: CUANDO el estudiante vuelve a abrir la aplicación con una fase Corriendo, EL SISTEMA recupera la sesión y muestra el tiempo restante correcto, descontando el tiempo transcurrido mientras la aplicación estaba cerrada. Origen: HU-003, escenario "Cerrar la aplicación"; Decisión 001; Decisión 002.
- RF-04: MIENTRAS una fase está Corriendo, EL SISTEMA calcula el tiempo restante a partir de la referencia temporal del reloj del dispositivo, sin depender de que la aplicación permanezca abierta ni de tareas en segundo plano. Origen: Decisión 001; Decisión 008.
- RF-05: MIENTRAS una fase Corriendo progresa, EL SISTEMA no necesita guardar de forma periódica para conservar el tiempo restante: basta con guardar en cada transición (iniciar, pausar, continuar, reiniciar y al llegar a 00:00). Origen: Decisión 004.
- RF-06: SI el estudiante pausa la fase y cierra la aplicación, ENTONCES, al volver a abrirla, EL SISTEMA mantiene la fase Pausada con el mismo tiempo restante, con el control "Continuar" y sin reanudarla automáticamente. Origen: HU-003, escenario "Pausar antes de cerrar"; Decisión 005.
- RF-07: SI una fase Pausada se recupera, ENTONCES EL SISTEMA no muestra ningún aviso de fin. Origen: HU-003, escenario "Pausar antes de cerrar"; Decisión 005.
- RF-08: CUANDO una fase en curso vence mientras la aplicación está cerrada o el celular está bloqueado y el estudiante vuelve a la aplicación, EL SISTEMA procesa el vencimiento con las mismas reglas que aplica con la aplicación abierta (contador del ciclo y resumen diario según la spec 002) y deja lista la siguiente fase en estado Inicial, con su tiempo completo y el control "Iniciar". Origen: HU-003, escenarios "Bloquear el celular" y "El tiempo termina con la aplicación cerrada"; Decisión 002; Decisión 006; Decisión 007.
- RF-09: CUANDO una fase vence mientras la aplicación está cerrada, EL SISTEMA procesa el vencimiento en el momento de volver a abrirla, usando como instante del suceso la hora real de la reapertura, sin calcular una hora exacta de vencimiento. Origen: Decisión 007.
- RF-10: SI una fase vence mientras la aplicación está cerrada o el celular está bloqueado, ENTONCES EL SISTEMA no muestra tiempo restante negativo ni traslada el tiempo excedido a la siguiente fase. Origen: Decisión 002; Decisión 006.
- RF-11: SI el reloj del dispositivo retrocede mientras una fase está Corriendo, de modo que el tiempo restante calculado resulta mayor que el que había al iniciar o continuar esa fase, ENTONCES EL SISTEMA da la fase por vencida y aplica la misma regla de vencimiento de RF-08. Origen: Decisión 003; Decisión 010.
- RF-12: MIENTRAS una fase está Pausada, EL SISTEMA nunca la marca como vencida por un cambio del reloj del dispositivo: conserva el tiempo restante congelado. Origen: Decisión 003.
- RF-13: SI el tiempo restante calculado de una fase Corriendo llegó a 0, ENTONCES EL SISTEMA lo trata como un vencimiento normal, sin aplicar la detección de salto anómalo del reloj. Origen: Decisión 003; Decisión 010.
- RF-14: CUANDO el SISTEMA detecta un salto anómalo del reloj, no muestra ni registra ninguna señal visible al estudiante. Origen: Decisión 003; Decisión 010.
- RF-15: EL SISTEMA no ejecuta tareas en segundo plano para mantener la cuenta y no emite avisos de finalización. Origen: Decisión 008.

## Requisitos no funcionales

- RN-01: La recuperación de la sesión en curso, el cálculo del tiempo restante y la detección del salto anómalo del reloj deben mantenerse separados de la interfaz y de la persistencia, y poder comprobarse de forma independiente. Origen: Constitución 9.
- RN-02: La lógica de recuperación, vencimiento y salto anómalo del reloj debe verificarse con pruebas automatizadas antes de considerar terminada su implementación. Origen: Constitución 10.
- RN-03: La sesión en curso debe conservarse al bloquear el celular, cerrar y reabrir la aplicación, sin alterar ni invalidar los datos ya guardados por las specs 001 y 002. Origen: Constitución 3; Constitución 5.
- RN-04: El tiempo restante debe representarse correctamente en todas las transiciones (bloquear, cerrar, reabrir, pausar), sin pérdidas ni alteraciones. Origen: Constitución 3.
- RN-05: La cuenta debe funcionar sin conexión y sin servicios externos, sin exigir permiso ni capacidad alguna de ejecución en segundo plano. Origen: Constitución 6; Constitución 7; Decisión 008.
- RN-06: Las limitaciones de la plataforma para la ejecución en segundo plano deben documentarse; no se debe afirmar que un comportamiento está garantizado si no se ha verificado. Origen: Constitución 7; Decisión 008.

## Casos límite

- Fase que vence con la aplicación cerrada: mientras la aplicación está cerrada solo puede vencer una fase, porque la siguiente nace en estado Inicial y no arranca hasta pulsar "Iniciar"; nunca hay fases vencidas encadenadas ni tiempo excedido que trasladar. (Decisión 002; Decisión 006)
- Fase vencida hace mucho tiempo: al reabrir, el resultado es el mismo (siguiente fase en Inicial con su tiempo completo), sin importar cuánto tiempo pasó desde el vencimiento. (Decisión 006)
- Reloj del dispositivo atrasado con la fase Corriendo: la fase se da por vencida y se aplica la regla de vencimiento, incluso si el tiempo restante parecía haber aumentado. (Decisión 003)
- Reloj del dispositivo atrasado con la fase Pausada: no se marca vencida; se conserva el tiempo restante congelado. (Decisión 003)
- Cambio de zona horaria: se trata igual que un cambio del reloj del dispositivo, con las mismas reglas de RF-11, RF-12 y RF-13. (Decisión 003)
- Cerrar la aplicación con la fase Corriendo y reabrirla antes del vencimiento: se mantiene Corriendo con el tiempo restante descontado y el control "Pausar". (RF-03)
- Aplicación en segundo plano sin cerrarse: al volver al frente se recalcula el tiempo restante por el reloj, sin tareas en segundo plano. (Decisión 008)
- Datos guardados por las specs 001 y 002 (fase y contador del ciclo): se siguen leyendo sin perderlos; si no existe información del temporizador, la fase guardada se muestra en Inicial con su tiempo completo. (Decisión 009)

## Fuera de alcance

- Avisos de finalización, sonido, vibración, pantalla de bloqueo y permisos de notificaciones (HU-004). El escenario "El tiempo termina con la aplicación cerrada" de la HU-003 se cubre aquí solo respecto de la recuperación de la sesión, del estado de la fase y de las reglas del ciclo y del resumen diario (Decisión 002; Decisión 003; Decisión 006; Decisión 007).
- Ejecución de la cuenta en segundo plano (Decisión 008).
- Configuración de las duraciones de estudio y descansos, y de la cantidad de pomodoros por ciclo (HU-005).
- Controles de sesión de la spec 001 (iniciar, pausar, continuar, reiniciar) y las reglas de transición entre fases, del contador del ciclo y del resumen diario de la spec 002; esta spec los reutiliza sin modificarlos (Decisión 002; Decisión 007).

## Criterios de finalización

- Los cuatro escenarios de la HU-003 quedan verificados en la implementación. El escenario "El tiempo termina con la aplicación cerrada" se cubre en cuanto a la recuperación de la sesión, el estado de la fase, el contador del ciclo y el resumen diario; el aviso de fin queda pendiente de la HU-004.
- La lógica de recuperación de la sesión, del cálculo del tiempo restante y del salto anómalo del reloj pasa las pruebas automatizadas con Jest.
- Al bloquear el celular o cerrar y reabrir la aplicación con una fase Corriendo, el tiempo restante mostrado es el correcto.
- Al cerrar y reabrir con una fase Pausada, la fase sigue pausada con el mismo tiempo restante, el control es "Continuar" y no hay aviso.
- Al reabrir con la fase vencida, la aplicación muestra la siguiente fase en Inicial con su tiempo completo y actualiza el contador del ciclo y el resumen diario según la spec 002.
- El retroceso del reloj del dispositivo no provoca un tiempo restante incorrecto en una fase Corriendo ni altera una fase Pausada.
- Verificación manual en Expo Go del bloqueo del celular, del cierre y reapertura de la aplicación y de la fase pausada recuperada.

## Dudas abiertas

Sin dudas abiertas.
