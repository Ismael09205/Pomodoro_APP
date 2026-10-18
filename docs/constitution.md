# Constitución - Aplicación Pomodoro

**Principios innegociables del proyecto. Toda historia de usuario, spec, decisión, plan, tarea e implementación debe cumplir esta constitución. Ninguna decisión técnica puede contradecirla sin una modificación explícita y aprobada de la constitución.**

## 1. Simplicidad primero

La aplicación debe mantener una arquitectura simple, comprensible y adecuada a su propósito. No se añaden dependencias, servicios externos ni complejidad innecesaria sin aprobación explícita.

## 2. Las historias de usuario definen el alcance

Ninguna funcionalidad puede implementarse si no está definida en una spec aprobada que la desarrolle. Si falta una decisión de producto o existe una contradicción, se debe marcar como `[NECESITA ACLARACIÓN]` y solicitar una definición antes de continuar.

## 3. El tiempo debe ser exacto

El temporizador debe representar correctamente el tiempo transcurrido y restante. Pausar, reanudar, bloquear el celular, cerrar la aplicación y recuperar una sesión no deben provocar pérdidas ni alteraciones incorrectas del tiempo.

## 4. Las fases Pomodoro deben respetar el ciclo

La alternancia entre estudio, descanso corto y descanso largo debe respetar las reglas definidas en las historias de usuario y la configuración del estudiante. El contador de pomodoros debe reflejar correctamente el avance del ciclo.

## 5. Los datos del estudiante son sagrados

Los ajustes y el estado de sesión que deban conservarse deben persistir localmente según las historias de usuario. Cerrar o reabrir la aplicación no debe provocar pérdidas de información que deban mantenerse. Los cambios de código no pueden invalidar ni eliminar datos existentes sin autorización.

## 6. La aplicación funciona sin conexión

Las funcionalidades definidas para el temporizador, los avisos y los ajustes deben funcionar sin datos móviles ni Wi-Fi. No se puede introducir una dependencia obligatoria de un servidor, una cuenta o un servicio remoto para cumplir estas funciones.

## 7. Las notificaciones forman parte de la experiencia esencial

Los avisos de finalización deben respetar los requisitos definidos para sonido, vibración, pantalla de bloqueo y permisos. Las limitaciones propias del sistema operativo deben identificarse y documentarse; nunca se debe afirmar que un comportamiento está garantizado si no se ha verificado.

## 8. Sin registro, sin cuentas y sin publicidad

La aplicación debe permitir el acceso directo al temporizador, sin registro ni inicio de sesión. No debe mostrar anuncios ni incorporar mecanismos publicitarios.

## 9. La lógica debe estar separada de la interfaz

Las reglas del temporizador, el conteo de pomodoros y las transiciones entre fases deben mantenerse separadas de los componentes visuales y de la persistencia. La lógica de dominio debe ser comprobable de forma independiente, sin depender de React ni del almacenamiento local.

## 10. Las pruebas son obligatorias

La lógica debe probarse con Jest. Los criterios de aceptación de cada historia deben verificarse antes de considerar terminada su implementación. No se debe avanzar con pruebas fallidas ni afirmar que una validación se completó si no se ejecutó.

## 11. La configuración del estudiante debe respetarse

Las duraciones de estudio, descanso corto y descanso largo, así como la cantidad de pomodoros por ciclo, deben utilizar los valores configurados dentro de la HU donde se especifican estos tiempos. 

## 12. Los cambios deben ser controlados

Solo se implementa la fase o tarea solicitada. No se avanza a la siguiente fase del proceso SDD sin autorización. No se modifican funcionalidades ajenas al alcance aprobado, no se instalan dependencias ni se cambia el formato de los datos guardados sin aprobación, y no se realizan commits sin autorización.

---

**Regla suprema:** ante cualquier conflicto entre una implementación propuesta y esta constitución, se debe verificar el contexto en el que se esta aplicando y como se va a aplciar, esta vertificacion SIEMPRE me pides confirmacion, NUNCA se debe implementar algo que no este aprobado por mi, de ser el caso de que exista confucion o ambiguedad al momento de aplicar cualquier cambio primero debes hacermelo saber antes de aplciar nada y preguntarme como debes proceder, dandome las opciones para realizar el procediento ambiguo.  