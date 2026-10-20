# Spec 004 — Aviso al terminar el tiempo

Estado: aprobada; alcance de sonido y vibración refinado por la Decisión 011
HU de origen: docs/historias/HU-004.md

## Contexto y objetivo

Cuando el temporizador llega a cero, el estudiante debe enterarse del fin de la fase aunque no esté mirando la pantalla. La aplicación solicita permiso, programa una notificación local al vencimiento y permite detener el estado de aviso desde la app. El sonido y la vibración dependen de las capacidades y ajustes del sistema operativo.

## Usuarios

- Estudiante que usa la aplicación para sesiones de estudio y descanso.

## Historias de usuario

- HU-004: "Recibir aviso al terminar el tiempo" (docs/historias/HU-004.md). El alcance de sonido y vibración se concreta mediante la Decisión 011.

## Requisitos funcionales

- RF-01: CUANDO el temporizador llega a cero, EL SISTEMA presenta una notificación con el sonido predeterminado y la vibración configurada, si el sistema operativo y los ajustes del usuario lo permiten. Origen: Escenario "Aviso con el celular en sonido" y Decisión 011.
- RF-02: CUANDO el temporizador llega a cero, EL SISTEMA solicita una notificación de alta importancia y visibilidad en pantalla de bloqueo donde la plataforma lo permita. La aplicación no elude el modo silencio, No molestar ni las preferencias de notificación del usuario. Origen: Decisión 001, Decisión 011 y RNF-02.
- RF-03: CUANDO el temporizador llega a cero, EL SISTEMA indica en el aviso qué fase terminó y cuál es la siguiente fase. Origen: Decisión 002.
- RF-04: CUANDO se entrega la notificación, EL SISTEMA reproduce una vez el sonido y la vibración según el comportamiento del sistema operativo; no se garantiza repetición continua. La app mantiene el estado visual de aviso activo hasta que el usuario pulse "Detener". Origen: Decisiones 007 y 011.
- RF-05: CUANDO el usuario pulsa el botón "Detener" dentro de la aplicación, EL SISTEMA detiene el aviso y muestra la siguiente fase de inmediato. Origen: Escenario "Detener el aviso" y Decisiones 003 y 004.
- RF-06: CUANDO el usuario inicia una sesión de estudio por primera vez sin haber dado el permiso de notificaciones, EL SISTEMA explica para qué necesita el permiso y se lo solicita. Origen: Escenario "Permiso de notificaciones" y Decisión 005.
- RF-07: SI el usuario deniega el permiso de notificaciones, ENTONCES EL SISTEMA bloquea el inicio del temporizador hasta que el permiso sea otorgado; al reintentar el inicio, el sistema vuelve a solicitar el permiso y, solo si el sistema ya no lo muestra por cualquier motivo, le indica habilitarlo en los ajustes del sistema. Origen: Decisión 006 y Decisión 009.
- RF-08: MIENTRAS la aplicación está abierta o en segundo plano, EL SISTEMA programa una notificación local para el vencimiento y permite que el sistema operativo la entregue aunque la app esté suspendida. La entrega depende de permisos y restricciones del sistema. Origen: Decisiones 008 y 011.
- RF-09: MIENTRAS el estado de aviso permanece activo tras haber llegado el temporizador a cero y el usuario abre la aplicación sin pulsar "Detener", EL SISTEMA muestra la fase terminada sin contador y sin mostrar todavía la siguiente fase. Origen: Decisiones 010 y 011.

## Requisitos no funcionales

- RNF-01: El aviso debe funcionar sin datos móviles ni Wi-Fi. Origen: Constitución, principio 6.
- RNF-02: Las limitaciones del sistema operativo propias del aviso deben identificarse y documentarse; no se debe afirmar que un comportamiento del aviso está garantizado si no se ha verificado. Origen: Constitución, principio 7.
- RNF-03: El alcance aprobado es de mejor esfuerzo: una notificación estándar no garantiza sonido en silencio/No molestar ni sonido/vibración repetidos hasta detener. Origen: Decisión 011.

## Casos límite

- El temporizador llega a cero con la app en segundo plano: el sistema operativo recibe una notificación local programada, sujeta a permisos y restricciones del dispositivo (RF-08).
- El usuario no detiene el aviso: la app conserva el estado visual de aviso activo; la duración del sonido y la vibración la controla el sistema operativo (RF-04).
- El usuario ha denegado el permiso de notificaciones: el inicio del temporizador queda bloqueado (RF-07).
- El celular está en modo silencio, vibración o No molestar: el sistema puede silenciar o limitar el sonido/vibración; la app no elude esos ajustes (RF-02, RNF-03).

## Fuera de alcance

- Emitir el aviso con la aplicación completamente cerrada (Decisión 008).
- Detener el aviso tocando la notificación: la detención ocurre únicamente con el botón "Detener" dentro de la app (Decisión 003).

## Criterios de finalización

- Los escenarios se verifican conforme al alcance refinado por la Decisión 011; el sonido en silencio y la repetición ilimitada no son criterios garantizados.
- La lógica del aviso se comprueba con pruebas Jest (Constitución, principio 10).
- El comportamiento del aviso en el dispositivo se verifica manualmente y no se afirma nada sin verificar (Constitución, principio 7).

## Dudas abiertas

No quedan dudas abiertas.
