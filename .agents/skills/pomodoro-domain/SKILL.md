---
name: pomodoro-domain
description: Utiliza esta skill al diseñar, implementar, modificar o probar la lógica de dominio del temporizador Pomodoro en la aplicación Expo. Orienta el manejo de estados, tiempo transcurrido, transiciones de fase, pausas, recuperación de sesiones y consistencia del dominio, respetando las especificaciones aprobadas.
---

# Skill: Pomodoro Domain

## Objetivo

Implementar la lógica del dominio Pomodoro de forma coherente, predecible, comprobable y desacoplada de la interfaz, la persistencia y las particularidades del ciclo de vida de React Native.

Esta skill define cómo implementar la lógica, no qué funcionalidades debe tener el producto.

## Fuentes de verdad

Antes de modificar la lógica:

1. Leer `MEMORY.md` y `docs/constitution.md`, si están presentes en el proyecto.
2. Identificar la especificación activa y sus historias de usuario de origen.
3. Revisar las decisiones funcionales aprobadas y el plan de implementación.
4. Inspeccionar el código y las pruebas existentes antes de proponer cambios.

Las HU, las especificaciones aprobadas y las decisiones autorizadas definen el comportamiento funcional.

No inventar duraciones, cantidades, transiciones, políticas de recuperación ni comportamientos adicionales. Si falta una definición necesaria, marcarla como `[NECESITA ACLARACIÓN]` y detener la parte del trabajo que dependa de ella.

## Principios del dominio

### 1. Separación de responsabilidades

- Mantener la lógica de dominio en `src/domain/`.
- Evitar dependencias de React, componentes visuales, AsyncStorage y APIs de plataforma dentro del dominio.
- Representar las operaciones del temporizador mediante funciones o módulos con responsabilidades claras.
- Mantener la persistencia en `src/storage/` y la interacción con las pantallas en `app/`.
- No introducir nuevas dependencias sin autorización.

### 2. Modelado de estados

- Identificar explícitamente los estados y las transiciones que establezca la especificación.
- Evitar representar estados incompatibles mediante múltiples booleanos independientes.
- Definir qué operaciones son válidas en cada estado.
- Evitar transiciones implícitas o efectos secundarios no documentados.
- Mantener coherentes el estado actual, el tiempo restante y la fase activa.

No agregar estados ni transiciones funcionales que no estén justificados por los requisitos aprobados.

### 3. Precisión temporal

- No depender exclusivamente de decrementar un contador cada segundo para determinar el tiempo real restante.
- Cuando corresponda, utilizar una referencia temporal y el tiempo transcurrido para calcular el tiempo restante.
- Diferenciar el tiempo restante calculado del intervalo utilizado para actualizar la interfaz.
- Evitar que retrasos del hilo de JavaScript provoquen que el temporizador acumule errores temporales.
- Definir el comportamiento ante valores límite, como el vencimiento del tiempo, según la especificación.

Las referencias temporales deben ser compatibles con el mecanismo de recuperación definido para la aplicación.

### 4. Pausa, reanudación y reinicio

- Implementar cada operación como una transición explícita del dominio.
- Al pausar, conservar el tiempo restante conforme a las reglas aprobadas.
- Al reanudar, evitar contar como tiempo activo el intervalo durante el cual la sesión estuvo pausada.
- Al reiniciar, restablecer únicamente los datos que correspondan a la operación autorizada.
- Evitar que una operación repetida genere transiciones duplicadas o efectos secundarios inesperados.

### 5. Transiciones entre fases

- Centralizar las reglas de transición en la lógica de dominio.
- Evitar duplicar la misma lógica entre pantallas, notificaciones y mecanismos de recuperación.
- Determinar la siguiente fase a partir del estado y las reglas aprobadas, no mediante condiciones dispersas en la interfaz.
- Mantener consistentes los contadores y el ciclo cuando se produzca una transición.
- No asumir que la siguiente fase debe iniciarse automáticamente: aplicar exactamente el comportamiento especificado.

### 6. Cierre, recuperación y concurrencia

Cuando la especificación requiera recuperar una sesión:

- Identificar qué información es necesaria para reconstruir su estado.
- Distinguir entre el estado del dominio y el estado temporal de la interfaz.
- Calcular el tiempo transcurrido desde una referencia temporal persistida cuando corresponda.
- Evitar que la recuperación procese dos veces una misma transición o vencimiento.
- Considerar que los temporizadores, los efectos de React y las notificaciones pueden producir eventos repetidos.
- No asumir que un temporizador de JavaScript seguirá ejecutándose cuando la aplicación esté suspendida o cerrada.

La ejecución en segundo plano, las notificaciones y las restricciones del sistema operativo deben resolverse en la capa de plataforma, respetando la arquitectura aprobada y sin prometer garantías que Expo o el sistema operativo no proporcionen.

### 7. Validación de entradas

- Validar los datos en el límite correspondiente.
- Mantener invariantes del dominio definidos por las especificaciones.
- Evitar propagar valores inválidos o estados imposibles.
- No establecer límites de configuración arbitrarios.
- No sustituir silenciosamente datos inválidos por valores predeterminados sin una regla aprobada.

## Pruebas del dominio

Antes de implementar o modificar una regla de dominio, identificar las pruebas necesarias y seguir el enfoque de pruebas establecido por el proyecto.

Comprobar, según corresponda:

- Transiciones válidas e inválidas.
- Pausa y reanudación.
- Reinicio.
- Cálculo del tiempo restante.
- Vencimiento del tiempo y transiciones de fase.
- Límites temporales y valores de entrada.
- Recuperación de una sesión.
- Eventos repetidos y prevención de transiciones duplicadas.

Las pruebas deben verificar comportamientos definidos en las especificaciones, no reglas inventadas por el agente.

Preferir pruebas deterministas mediante referencias temporales controlables, en lugar de depender de esperas reales prolongadas.

## Procedimiento de implementación

1. Identificar los requisitos de dominio afectados.
2. Revisar el modelo actual y sus pruebas.
3. Identificar las reglas conocidas y las ambigüedades.
4. Proponer el cambio mínimo compatible con la arquitectura.
5. Implementar primero las pruebas de los comportamientos afectados.
6. Implementar la lógica necesaria sin ampliar el alcance.
7. Ejecutar las pruebas y las comprobaciones pertinentes.
8. Revisar que no existan regresiones ni reglas duplicadas.
9. Informar los archivos modificados, las pruebas ejecutadas y las limitaciones pendientes.

Seguir el flujo SDD del proyecto y trabajar únicamente en la fase o tarea autorizada.

## Restricciones

- No modificar las HU para justificar una implementación.
- No reemplazar las especificaciones por esta skill.
- No inventar requisitos ni decisiones funcionales.
- No mezclar lógica de dominio con almacenamiento, interfaz o APIs de plataforma.
- No modificar formatos de datos persistidos sin autorización.
- No añadir dependencias, archivos fuera del alcance aprobado ni funcionalidades adicionales sin autorización.
- No afirmar que una prueba o validación pasó si no se ejecutó.
