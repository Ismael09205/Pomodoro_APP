# Spec 005 — Ajustar los tiempos del pomodoro

Estado: aprobado
HU de origen: docs/historias/HU-005.md

## Contexto y objetivo

El estudiante necesita adaptar la técnica a su ritmo: cambiar la duración del
estudio, de los descansos y la cantidad de pomodoros antes del descanso largo.
La aplicación debe ofrecer una pantalla de ajustes con validación, con la opción
de volver a los valores por defecto, y garantizar que un cambio no altere la
fase que ya está en curso ni los tiempos ya transcurridos.

## Usuarios

- Estudiante que configura los tiempos de la técnica Pomodoro.

## Historias de usuario

- HU-005: "Ajustar los tiempos del pomodoro" (docs/historias/HU-005.md).

## Definiciones

- Fase: tramo del ciclo Pomodoro (estudio, descanso corto o descanso largo) que
  está corriendo o en pausa.
- Valores por defecto: 25 minutos de estudio, 5 de descanso corto, 15 de
  descanso largo y 4 pomodoros por ciclo.

## Requisitos funcionales

- RF-01: EL SISTEMA ofrece una pestaña "Ajustes" en la navegación principal
  desde la que se accede a la pantalla de ajustes.
  Origen: Decisión 002.

- RF-02: CUANDO el estudiante cambia un tiempo o la cantidad de pomodoros y
  pulsa "Guardar", EL SISTEMA usa el nuevo valor desde la próxima fase.
  Origen: Escenario "Cambiar un tiempo".

- RF-03: EL SISTEMA conserva los valores guardados aunque el estudiante cierre
  y vuelva a abrir la aplicación.
  Origen: Escenario "Cambiar un tiempo".

- RF-04: SI un campo está vacío, contiene cero, no es un número entero, o está
  fuera del rango de 1 a 120 minutos en las duraciones o de 1 a 12 en los
  pomodoros por ciclo, ENTONCES EL SISTEMA lo considera un valor no válido.
  Origen: Escenario "Ingresar un valor no válido" y Decisión 001.

- RF-05: CUANDO el estudiante pulsa "Guardar" y al menos un campo no es válido,
  ENTONCES EL SISTEMA no guarda ningún cambio y señala junto a cada campo no
  válido qué valores admite.
  Origen: Escenario "Ingresar un valor no válido" y Decisiones 004 y 005.

- RF-06: CUANDO el estudiante elige restablecer y confirma, EL SISTEMA rellena
  los campos con 25, 5, 15 y 4; el restablecimiento se conserva únicamente si
  el estudiante pulsa "Guardar".
  Origen: Escenario "Volver a los valores por defecto" y Decisión 008.

- RF-07: MIENTRAS una fase está en curso, ya sea en marcha o en pausa, EL
  SISTEMA mantiene esa fase con el tiempo con que empezó aunque el estudiante
  cambie su duración; el cambio rige desde la siguiente fase.
  Origen: Escenario "Cambiar un tiempo con una fase en curso" y Decisión 007.

- RF-08: CUANDO el estudiante restablece los tiempos con una fase en curso y
  pulsa "Guardar", EL SISTEMA mantiene la fase actual con el tiempo con que
  empezó y aplica los valores por defecto desde la próxima fase; si sale sin
  guardar, no se aplica ningún cambio.
  Origen: Decisión 006 y Decisión 009.

- RF-09: CUANDO el estudiante cambia la cantidad de pomodoros por ciclo, EL
  SISTEMA aplica el nuevo valor desde la próxima fase; si el contador ya
  alcanzó o supera el nuevo valor, el próximo descanso es largo.
  Origen: Decisión 003.

- RF-10: MIENTRAS el estudiante no pulsa "Guardar", EL SISTEMA no aplica ni
  conserva los cambios; al salir de la pantalla sin guardar, descarta lo
  escrito.
  Origen: Decisión 008.

## Requisitos no funcionales

- RNF-01: La pantalla de ajustes y el guardado deben funcionar sin datos
  móviles ni Wi-Fi. Origen: Constitución, principio 6.

- RNF-02: Las reglas de validación, guardado y transición entre fases deben
  comprobarse con pruebas automatizadas. Origen: Constitución, principio 10.

## Casos límite

- El estudiante pulsa "Guardar" con un campo no válido y los demás válidos:
  no se guarda ninguno (RF-05).
- El contador de pomodoros ya alcanza o supera el nuevo valor de pomodoros por
  ciclo (RF-09).
- Restablecer los tiempos con una fase en curso (RF-08).
- Cambiar la duración de una fase que está en pausa (RF-07).
- Salir de la pantalla sin pulsar "Guardar" (RF-10).

## Fuera de alcance

- Aplicar cambios sin pulsar "Guardar": los cambios solo se aplican y conservan
  con el botón "Guardar" (Decisión 008).

## Criterios de finalización

- Los cuatro escenarios de la HU-005 se verifican manualmente en la aplicación.
- Las reglas de validación, guardado y transición se comprueban con pruebas
  Jest (Constitución, principio 10).
- No se afirma ningún comportamiento como verificado sin haberlo comprobado.

## Dudas abiertas

No quedan dudas abiertas.
