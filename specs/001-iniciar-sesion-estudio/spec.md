# Spec 001 — Iniciar y controlar una sesión de estudio

Estado: aprobada
HU de origen: docs/historias/HU-001.md

## Contexto y objetivo

El estudiante necesita concentrarse durante un tiempo definido iniciando, pausando,
reanudando y reiniciando un temporizador de estudio desde la pantalla principal. Esta
spec define el control visible del temporizador: los estados y controles disponibles,
la confirmación del reinicio, el formato del tiempo restante, el comportamiento al
llegar a 00:00 y el registro de sesiones de estudio incompletas.

## Usuarios

- Estudiante: única persona usuaria. Usa la aplicación directamente en su dispositivo,
  sin registro ni cuentas (constitución 8).

## Historias de usuario

- HU-001: Iniciar y controlar una sesión de estudio (`docs/historias/HU-001.md`)

## Definiciones

- Fase: el tramo de tiempo en curso (estudio, descanso corto o descanso largo) junto
  con su duración configurada.
- Estado del temporizador: Inicial, Corriendo, Pausado o Finalizado (Decisión 005).
- Sesión incompleta: sesión de estudio que se reinició antes de completarse (Decisión 007).

## Requisitos funcionales

- RF-01: CUANDO el estudiante presiona "Iniciar" estando en la pantalla principal,
  EL SISTEMA comienza la cuenta regresiva con la duración de estudio configurada y
  muestra los minutos y segundos que faltan. Origen: Escenario "Iniciar el
  temporizador" (HU-001).

- RF-02: CUANDO el estudiante pausa el temporizador en funcionamiento y después lo
  reanuda, EL SISTEMA continúa la cuenta desde el tiempo en que se pausó. Origen:
  Escenario "Pausar y continuar" (HU-001).

- RF-03: CUANDO el estudiante activa el control "Reiniciar", EL SISTEMA muestra una
  confirmación con el mensaje "¿Reiniciar el temporizador?" y las opciones "Cancelar"
  y "Reiniciar". Origen: Escenario "Reiniciar el temporizador" (HU-001) y Decisión 002.

- RF-04: CUANDO el estudiante confirma el reinicio, EL SISTEMA devuelve el temporizador
  al tiempo inicial de la fase en la que se encuentra y lo deja en estado Inicial.
  Origen: Escenario "Reiniciar el temporizador" (HU-001) y Decisiones 002 y 005.

- RF-05: CUANDO el estudiante cancela la confirmación de reinicio, EL SISTEMA conserva
  el tiempo que llevaba el temporizador. Origen: Escenario "Cambiar de opinión al
  reiniciar" (HU-001) y Decisión 002.

- RF-06: EL SISTEMA ofrece los controles iniciar, pausar, continuar y reiniciar de la
  misma manera en la fase de estudio, en el descanso corto y en el descanso largo.
  Origen: Decisión 003.

- RF-07: MIENTRAS el temporizador está en un estado determinado, EL SISTEMA muestra
  únicamente los controles de ese estado: "Iniciar" en Inicial; "Pausar" y
  "Reiniciar" en Corriendo; "Continuar" y "Reiniciar" en Pausado; "Reiniciar" en
  Finalizado. Origen: Decisión 005.

- RF-08: CUANDO la cuenta regresiva llega a 00:00, EL SISTEMA marca la fase como
  finalizada y no muestra el control de pausar. Origen: Decisión 004.

- RF-09: EL SISTEMA muestra el tiempo restante en formato MM:SS, y en formato
  HH:MM:SS cuando la duración configurada de la fase sea de 60 minutos o más.
  Origen: Decisión 006.

- RF-10: CUANDO el estudiante reinicia una sesión de estudio estando Corriendo o
  Pausado, EL SISTEMA la marca como incompleta y no incrementa el contador de
  pomodoros por ese reinicio; el reinicio desde Finalizado no deja marca ni modifica
  el registro. Origen: Decisión 007 y Decisión 022.

- RF-11: EL SISTEMA conserva localmente el registro de sesiones de estudio completadas
  e incompletas, junto con los datos del día de uso vigente, de forma que sigan
  disponibles al cerrar y reabrir la aplicación. Origen: Decisiones 008, 011 y 015.

- RF-12: MIENTRAS exista al menos un día de estudio registrado, EL SISTEMA muestra en la
  pantalla principal un resumen con la cantidad de sesiones de estudio completadas y de
  sesiones incompletas del día de uso, con la etiqueta "Última sesión de estudio:" y la
  fecha de inicio del día de uso en el formato del dispositivo. Origen: Decisiones 008,
  011, 012, 016, 020 y 024.

- RF-13: CUANDO empieza un nuevo día de uso, EL SISTEMA reinicia los contadores de
  sesiones completadas e incompletas del resumen. Origen: Decisiones 013 y 014.

- RF-14: SI pasan más de 24 horas desde la primera sesión de estudio del último día de
  uso sin que el estudiante inicie una sesión de estudio nueva, ENTONCES EL SISTEMA
  conserva los contadores y la fecha de ese último día de estudio. Origen: Decisión 015.

- RF-15: MIENTRAS no exista ningún día de estudio registrado, EL SISTEMA muestra en la
  pantalla principal el texto "Aún no hay sesiones de estudio registradas." Origen:
  Decisión 017.

- RF-16: CUANDO el estudiante, tras reiniciar una sesión de estudio, vuelve a iniciar la
  cuenta y la completa, EL SISTEMA deja de contarla como incompleta, considerándola la
  misma sesión de estudio y sin crear una sesión nueva. Origen: Decisiones 008, 011 y 027.

- RF-17: SI al cumplirse las 24 horas desde la primera sesión de estudio del día de uso
  hay una sesión de estudio en curso, ENTONCES EL SISTEMA espera a que esa sesión se
  complete o se reinicie para empezar el nuevo día de uso, y contabiliza esa sesión en el
  nuevo día de uso. Origen: Decisiones 019 y 023.

## Requisitos no funcionales

- RNF-01: EL SISTEMA representa con exactitud el tiempo transcurrido y restante;
  pausar, reanudar y reiniciar no provocan pérdidas ni alteraciones incorrectas del
  tiempo. Origen: Constitución 3.

- RNF-02: EL SISTEMA permite iniciar, pausar, reiniciar, ver el tiempo, mostrar el
  resumen de sesiones de estudio y conservar el registro sin conexión a internet.
  Origen: Constitución 6.

- RNF-03: EL SISTEMA funciona sin registro, sin cuentas y sin anuncios. Origen:
  Constitución 8.

## Casos límite

- Fase con duración configurada de 60 minutos o más: el tiempo restante se muestra
  en HH:MM:SS (Decisión 006).
- Llegada a 00:00: la fase queda finalizada, sin control de pausar y sin transición
  automática dentro de esta spec (Decisión 004).
- Reinicio estando Corriendo o Pausado: siempre pasa por la confirmación
  (Decisiones 002 y 005).
- Pausas y reanudaciones sucesivas: la cuenta continúa sin perder tiempo
  (Escenario "Pausar y continuar" y Constitución 3).
- Cancelar la confirmación de reinicio desde cualquier estado en que "Reiniciar"
  esté disponible: el tiempo se conserva (Escenario "Cambiar de opinión al reiniciar").

## Fuera de alcance

- Transición automática a la siguiente fase al llegar a 00:00 (HU-002; Decisión 004).
- Avisos de finalización, sonido, vibración, pantalla de bloqueo y permisos
  (HU-004; Decisión 004).
- Configuración de duraciones y de la cantidad de pomodoros por ciclo (HU-005).
- Reglas completas del ciclo de pomodoros más allá del efecto del reinicio sobre el
  contador (HU-002; Decisión 007).
- Incremento del contador de sesiones completadas, que pertenece a las reglas del ciclo
  de pomodoros (HU-002; Decisión 025).
- Recuperación del temporizador en curso al cerrar o reabrir la aplicación (HU-003;
  Decisión 026).
- Registrar materias o cualquier funcionalidad no mencionada en la HU-001
  (Decisión 001).

## Criterios de finalización

- Los cuatro escenarios de la HU-001 se cumplen en la verificación manual en Expo Go.
- La lógica del temporizador tiene pruebas con Jest que pasan (Constitución 10).
- El código TypeScript compila sin errores.
- Las dudas abiertas necesarias para el alcance quedan resueltas antes de solicitar
  la aprobación de la spec.

## Dudas abiertas

- Resuelta (Decisión 009): Decisión 005 indica que "Reiniciar" solo está disponible
  desde Corriendo o Pausado, pero también lista "Reiniciar" como único control del
  estado Finalizado. ¿Desde qué estados está disponible "Reiniciar"?
- Resuelta (Decisión 010): Decisión 007 define la marca de sesión incompleta para el
  reinicio de una sesión de estudio, y la Decisión 003 aplica los controles también a
  los descansos. ¿Al reiniciar una fase de descanso se marca también como incompleta?
- Resuelta (Decisión 016): Decisión 008: el texto del indicador aparece como ejemplo
  ("1 pomodoro incompleto"). ¿Cuál es el texto exacto que debe mostrarse?
- Resuelta (Decisión 011): Decisión 008: no se define el comportamiento del indicador
  si existen varias sesiones incompletas al mismo tiempo.
- Resuelta (Decisión 013): ¿Qué límite o alcance tienen los contadores del registro de
  sesiones de estudio: acumulan todas las sesiones desde el primer uso, se reinician
  por período, o tienen un tope máximo de sesiones?
- Resuelta (Decisión 014): ¿Cómo se define "un día" para el reinicio de los contadores
  del registro de sesiones: día natural del reloj del dispositivo, día de uso desde la
  primera sesión, u otro criterio?
- Resuelta (Decisión 015): ¿Cuándo termina exactamente el día de uso (a las 24 horas
  desde la primera sesión o al iniciar la primera sesión siguiente) y qué muestran los
  contadores del registro si el estudiante pasa varios días sin usar la aplicación?
- Resuelta (Decisión 018): Al elegir el día de uso con corte a las 24 horas exactas
  (Decisión 015), no queda definido a qué día de uso pertenece una sesión de estudio
  que está corriendo en el momento en que se cumple el corte.
- Resuelta (Decisión 019): ¿Qué ocurre si el estudiante deja la sesión de estudio en
  curso sin completarla ni reiniciarla y el corte de las 24 horas nunca se produce?
- Resuelta (Decisión 020): ¿Qué fecha muestra el resumen y cuándo cambia?
- Resuelta (Decisión 021): Además de la fecha del inicio del día de uso, ¿debe mostrarse
  una fecha específica para la madrugada?
- Resuelta (Decisión 027): RF-16: ¿qué significa "retomar la sesión incompleta"? Si, tras
  reiniciar, volver a iniciar la cuenta continúa la misma sesión de estudio o inicia una
  sesión nueva (RF-12, RF-16, Decisiones 007 y 011).
