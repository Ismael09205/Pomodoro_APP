# Decisiones — 001-iniciar-sesion-estudio (HU-001)

Decisiones tomadas en la entrevista inicial (skill `grill-me`) sobre la HU-001 "Iniciar y controlar una sesión de estudio", con base en `docs/constitution.md` y `AGENTS.md`. Fecha: 19/10/2026.

## Decisión 001 — Nombre de la iniciativa

- **Pregunta:** La carpeta propuesta era `001-registrat-materia`, pero la HU-001 trata de iniciar/pausar/reiniciar el temporizador y ninguna HU (001–006) menciona registrar materias. ¿La spec corresponde a la HU-001?
- **Respuesta:** Sí; renombrar la carpeta a `001-iniciar-sesion-estudio`.
- **Motivo:** El nombre de la iniciativa debe reflejar su alcance real; "registrar materias" no está definido en ninguna historia de usuario.

## Decisión 002 — Confirmación antes de reiniciar

- **Pregunta:** La HU-001 exige confirmar el reinicio ("lo confirmo"), pero no define el mecanismo. ¿Cómo se pide esa confirmación?
- **Respuesta:** Diálogo modal con el mensaje "¿Reiniciar el temporizador?" y los botones Cancelar / Reiniciar. Cancelar conserva el tiempo; Reiniciar vuelve al tiempo inicial de la fase.
- **Motivo:** Es el mecanismo estándar en móvil para acciones destructivas; el escenario "cambiar de opinión al reiniciar" de la HU queda cubierto explícitamente.

## Decisión 003 — Alcance de los controles

- **Pregunta:** La HU-001 habla de un "temporizador de estudio", pero el temporizador es el mismo durante los descansos (HU-002). ¿Los controles aplican solo a la fase de estudio?
- **Respuesta:** No; iniciar, pausar, continuar y reiniciar funcionan igual en estudio, descanso corto y descanso largo.
- **Motivo:** El temporizador es uno solo; una máquina de estados única es más simple y coherente (constitución 1).

## Decisión 004 — Comportamiento al llegar a 00:00

- **Pregunta:** La HU-001 no define qué ocurre cuando la cuenta regresiva termina. ¿Qué hace la app dentro de esta spec?
- **Respuesta:** Solo marca la fase como "finalizada" (sin botón pausar). La transición automática a la siguiente fase pertenece a la HU-002 y el aviso/notificación a la HU-004, fuera del alcance de esta spec.
- **Motivo:** Mantiene el alcance limitado a la HU-001 y evita duplicar funcionalidades de otras historias (constitución 2 y 12).

## Decisión 005 — Máquina de estados de la pantalla

- **Pregunta:** La HU define los escenarios pero no la máquina de estados completa. ¿Se aprueba la propuesta?
- **Respuesta:** Aprobada:
  - **Inicial:** botón "Iniciar".
  - **Corriendo:** botones "Pausar" y "Reiniciar".
  - **Pausado:** botones "Continuar" y "Reiniciar".
  - **Finalizado** (llegó a 00:00): solo "Reiniciar", que vuelve al tiempo inicial de la fase (estado Inicial).
  - "Reiniciar" siempre pasa por el diálogo de la decisión 002 y solo está disponible desde Corriendo o Pausado.
- **Motivo:** Deja explícitos los estados que la HU deja implícitos, lo que elimina ambigüedades al implementar y al probar.

## Decisión 006 — Formato del tiempo en pantalla

- **Pregunta:** La HU solo dice "veo los minutos y segundos que faltan". ¿En qué formato se muestra el tiempo restante?
- **Respuesta:** MM:SS por defecto; HH:MM:SS cuando la duración configurada sea de 60 minutos o más.
- **Motivo:** Legible para duraciones típicas y sin perder claridad si la configuración (HU-005) permite sesiones de una hora o más.

## Decisión 007 — Efecto de reiniciar en el contador de pomodoros

- **Pregunta:** La constitución menciona el contador de pomodoros del ciclo y la HU-001 no dice nada sobre él al reiniciar. ¿Reiniciar altera el contador?
- **Respuesta:** Al reiniciar una sesión de estudio, esa sesión se marca como **incompleta** hasta que se retome y se complete. El contador de pomodoros solo cuenta fases completadas; los reinicios no lo incrementan.
- **Motivo:** Preserva la exactitud del conteo (constitución 3 y 4) sin castigar doblemente al usuario, dejando constancia de las sesiones no terminadas.

## Decisión 008 — Registro y visualización de sesiones incompletas

- **Pregunta:** Marcar sesiones como incompletas implica persistir información nueva. ¿El registro queda solo como dato interno o se muestra en la interfaz?
- **Respuesta:** Persistir localmente la marca de sesión incompleta (AsyncStorage) y mostrar un indicador visible en la pantalla principal (ej. "1 pomodoro incompleto"). El indicador se resuelve cuando el usuario retoma la sesión y la completa.
- **Motivo:** El usuario quiere transparencia del estado; la persistencia cumple la constitución 5 (datos locales, sin servidor, funciona sin conexión).

## Decisión 009 — Disponibilidad del control "Reiniciar"

- **Pregunta:** La Decisión 005 se contradice: una frase indica que "Reiniciar" solo está disponible desde Corriendo o Pausado, mientras que la lista de estados lo incluye como único control del estado Finalizado. ¿Desde qué estados está disponible "Reiniciar"?
- **Respuesta:** "Reiniciar" está disponible en Corriendo, Pausado y Finalizado, y siempre pasa por el diálogo de confirmación de la Decisión 002. La frase "solo está disponible desde Corriendo o Pausado" se considera un error de redacción y prevalece la lista de estados.
- **Motivo:** El estado Finalizado no debe quedar sin ningún control: el estudiante necesita poder volver al tiempo inicial de la fase sin salir de la pantalla, y la confirmación del reinicio se mantiene uniforme en todos los estados.

## Decisión 010 — Marca de sesión incompleta al reiniciar descansos

- **Pregunta:** La Decisión 007 define la marca de sesión incompleta para el reinicio de una sesión de estudio y la Decisión 003 aplica los controles también a los descansos. ¿Al reiniciar una fase de descanso se marca también como incompleta?
- **Respuesta:** Solo el reinicio de una fase de estudio marca la sesión como incompleta. Reiniciar un descanso corto o largo no deja marca ni modifica el registro.
- **Motivo:** El registro y sus cifras se refieren a pomodoros, es decir a sesiones de estudio (Decisiones 007 y 008); un descanso reiniciado no es un pomodoro y no debe alterar el conteo (constitución 4).

## Decisión 011 — Contenido del registro visible

- **Pregunta:** La Decisión 008 describe un indicador de sesión incompleta, pero no define qué ocurre cuando existen varias sesiones incompletas al mismo tiempo. ¿Qué informa la pantalla principal?
- **Respuesta:** La pantalla principal muestra un registro de las sesiones de estudio que ha tenido el estudiante, indicando cuáles se completaron y cuáles no. No se limita a una única marca de sesión incompleta.
- **Motivo:** Da transparencia del estado real del estudio y conserva la constancia de cada sesión reiniciada (Decisión 007), sin depender de que exista una sola sesión incompleta.

## Decisión 012 — Forma del registro en pantalla

- **Pregunta:** Definido que la pantalla principal informa de las sesiones de estudio completadas e incompletas, ¿en qué forma se presenta esa información?
- **Respuesta:** Un resumen con cantidades y etiquetas explícitas; no una lista de sesiones ni únicamente la última sesión.
- **Motivo:** Un resumen ocupa poco espacio en la pantalla principal y se lee de un vistazo, sin crecer con el número de sesiones acumuladas.

## Decisión 013 — Límite de los contadores del resumen

- **Pregunta:** ¿Qué alcance tienen los contadores del resumen: acumulan todas las sesiones desde el primer uso, se reinician por período, o tienen un tope máximo de sesiones?
- **Respuesta:** Los contadores se reinician por período diario. No acumulan el histórico completo ni tienen un tope fijo de sesiones.
- **Motivo:** Un resumen diario es acotado y comparable entre días, y evita cifras que crezcan sin límite.

## Decisión 014 — Qué cuenta como "un día"

- **Pregunta:** ¿Cómo se define "un día" para el reinicio de los contadores: día natural del reloj del dispositivo, día de uso desde la primera sesión, u otro criterio?
- **Respuesta:** "Un día" es un día de uso: las 24 horas siguientes a la primera sesión de estudio de ese día.
- **Motivo:** Agrupa una jornada de estudio completa sin cortarla a medianoche, de modo que las sesiones de la madrugada queden junto a las de la tarde anterior.

## Decisión 015 — Fin del día de uso y días sin actividad

- **Pregunta:** ¿Cuándo termina exactamente el día de uso y qué muestran los contadores del registro si el estudiante pasa varios días sin usar la aplicación?
- **Respuesta:** El día de uso termina a las 24 horas exactas desde la primera sesión de estudio. Si pasan más de 24 horas sin que el estudiante inicie una sesión nueva, se conservan los contadores del último día de uso y se muestra la fecha de ese último día de estudio, para que el estudiante sepa cuándo estudió por última vez.
- **Motivo:** Evita mostrar un resumen en cero que contradiga la actividad real del estudiante y le permite saber a qué día corresponden las cifras.

## Decisión 016 — Texto del resumen de sesiones

- **Pregunta:** ¿Cuál es el texto exacto del resumen de sesiones que se muestra en la pantalla principal?
- **Respuesta:** Etiquetas con número y la fecha del último día de estudio en el formato del dispositivo. Ejemplo: "Completadas: 3 · Incompletas: 1 · Última sesión de estudio: 19/10/2026".
- **Motivo:** Es un texto explícito y autocontenido, sin depender de iconos ni abreviaturas, y usa el formato de fecha del dispositivo para no fijar una convención propia (constitución 1).

## Decisión 017 — Resumen cuando aún no hay día de estudio

- **Pregunta:** ¿Qué se muestra en la pantalla principal mientras no exista ningún día de estudio registrado?
- **Respuesta:** Un texto fijo que explica la ausencia de datos: "Aún no hay sesiones de estudio registradas."
- **Motivo:** El estudiante entiende por qué no ve cifras en lugar de encontrar un resumen vacío; la Decisión 008 solo describía el caso con datos.

## Decisión 018 — Sesión de estudio en curso al cumplirse el corte de las 24 horas

- **Pregunta:** La Decisión 015 fija el corte del día de uso a las 24 horas exactas. ¿A qué día de uso pertenece una sesión de estudio que está corriendo en el momento en que se cumple el corte?
- **Respuesta:** El corte espera: la sesión en curso pertenece al día de uso en que se inició y el nuevo día de uso empieza cuando esa sesión se completa o se reinicia. El corte nunca parte una sesión entre dos días de uso.
- **Motivo:** Evita que una misma sesión quede contada en dos días de uso y que el corte interrumpa o altere el temporizador en curso (constitución 3).

## Decisión 019 — Sesión abandonada sin completar ni reiniciar

- **Pregunta:** Si el estudiante deja la sesión de estudio en curso sin completarla ni reiniciarla, el corte de las 24 horas no se produce. ¿Se pone un plazo o una salida automática?
- **Respuesta:** No se pone límite: el día de uso no cambia hasta que la sesión en curso se complete o se reinicie. Mientras tanto se conservan los contadores y la fecha del último día de estudio, según la Decisión 015.
- **Motivo:** No añade plazos ni reglas nuevas y no obliga al sistema a cerrar ni a marcar sesiones por su cuenta; el manejo de una sesión interrumpida al cerrar y reabrir la aplicación corresponde a la HU-003.

## Decisión 020 — Fecha mostrada en el resumen

- **Pregunta:** ¿Qué fecha muestra el resumen de sesiones y cuándo cambia?
- **Respuesta:** La fecha de inicio del día de uso, es decir la de la primera sesión de estudio de ese día de uso. No cambia mientras el día de uso siga vigente; al abrir la aplicación se vuelve a leer lo guardado y solo cambia cuando empieza un día de uso nuevo.
- **Motivo:** Coincide con el día de uso de la Decisión 014 y con el resumen que se reinicia por día de uso, de modo que la fecha y las cifras se refieren siempre al mismo período.

## Decisión 021 — Fecha cuando se estudia de madrugada

- **Pregunta:** Además de la fecha del inicio del día de uso, ¿debe mostrarse una fecha específica para la madrugada?
- **Respuesta:** No se muestra una fecha adicional. Si la primera sesión de estudio del día de uso empieza de madrugada, la fecha mostrada es la de esa madrugada, por ser la fecha de inicio del día de uso. Si el día de uso empezó antes de medianoche y el estudio continúa de madrugada, se sigue mostrando la fecha de inicio.
- **Motivo:** Mantiene una sola fecha por día de uso, en línea con la Decisión 020, y evita que el resumen y sus cifras se refieran a períodos distintos.

## Decisión 022 — Reinicio desde el estado Finalizado no marca sesión incompleta

- **Pregunta:** RF-10 no restringía el estado desde el que el reinicio marca la sesión como incompleta: al llegar a 00:00 (estado Finalizado), pulsar "Reiniciar" marcaría como incompleta una sesión ya completada, lo que contradice la definición de sesión incompleta ("reiniciada antes de completarse", Decisión 007). ¿Desde qué estados el reinicio marca la sesión como incompleta?
- **Respuesta:** Solo el reinicio de una sesión de estudio desde Corriendo o Pausado marca la sesión como incompleta. El reinicio desde Finalizado no deja marca ni modifica el registro.
- **Motivo:** Respeta la definición de sesión incompleta (Decisión 007) y evita que el resumen muestre como incompleta una sesión que sí llegó a 00:00.

## Decisión 023 — Día de uso al que pertenece la sesión en curso al cumplirse el corte

- **Pregunta:** La Decisión 018 asigna la sesión en curso al día de uso en que se inició, pero RF-17 inicia el nuevo día de uso cuando esa sesión se completa o se reinicia y RF-13 reinicia los contadores entonces; la sesión no queda asignada a ningún día de forma verificable. ¿A qué día de uso pertenece esa sesión?
- **Respuesta:** La sesión en curso al cumplirse el corte pertenece al nuevo día de uso y se contabiliza en él al completarse o reiniciarse. Esta decisión prevalece sobre la Decisión 018 en lo que se refiere a la asignación de la sesión; el corte sigue sin partir ni alterar la sesión en curso.
- **Motivo:** El resumen del nuevo día de uso no arranca vacío y la sesión se contabiliza una sola vez, sin contarla en dos días.

## Decisión 024 — Etiqueta de la fecha en el resumen

- **Pregunta:** RF-12 describe el dato como "fecha de inicio del día de uso" mientras que la Decisión 016 fija la etiqueta "Última sesión de estudio", con distinto significado literal. ¿Qué texto se muestra?
- **Respuesta:** Se adopta la etiqueta literal de la Decisión 016: "Última sesión de estudio: <fecha>". El valor sigue siendo la fecha de inicio del día de uso (Decisión 020) y, cuando pasan más de 24 horas sin actividad, la fecha del último día de estudio (Decisión 015). RF-12 se ajusta a esa etiqueta.
- **Motivo:** Mantiene el texto explícito ya aprobado en la Decisión 016 sin añadir una segunda fecha (Decisión 021).

## Decisión 025 — Incremento del contador de sesiones completadas fuera de alcance

- **Pregunta:** RF-12 muestra la cantidad de sesiones completadas, pero ningún RF de esta spec define cuándo incrementa ese contador (RF-10 solo define cuándo no incrementa y RF-16 cuándo decrementa el de incompletas). ¿Dónde se define ese incremento?
- **Respuesta:** El incremento del contador de sesiones completadas pertenece a las reglas del ciclo de pomodoros (HU-002) y queda fuera del alcance de esta spec; esta solo conserva y muestra el registro. Se declara explícitamente en "Fuera de alcance".
- **Motivo:** Respeta el alcance por historia (Constitución 2) sin duplicar reglas del ciclo que se aprobarán aparte.

## Decisión 026 — Recuperación del temporizador en curso al cerrar o reabrir la aplicación

- **Pregunta:** RF-11 solo persiste el registro y los datos del día de uso, no el temporizador en curso, por lo que cerrar o bloquear el teléfono con la cuenta corriendo perdería el tiempo, aunque RNF-01 invoca la Constitución 3. ¿Se amplía esta spec para cumplirla?
- **Respuesta:** Se mantiene el alcance actual. La recuperación del temporizador en curso al cerrar o reabrir la aplicación se declara explícitamente fuera de alcance y corresponde a la HU-003; el cumplimiento total de la Constitución 3 queda pendiente hasta esa historia.
- **Motivo:** Respeta el alcance por historia (Constitución 2 y 12) y deja el conflicto documentado en lugar de ampliar la spec sin aprobación.

## Decisión 027 — Significado de "retomar la sesión incompleta"

- **Pregunta:** RF-16 indica que el estudiante "retoma la sesión incompleta y la completa", pero no define si, tras reiniciar, volver a iniciar la cuenta continúa la misma sesión de estudio o abre una sesión nueva; el resultado cambia las cifras del resumen (RF-12).
- **Respuesta:** "Retomar" significa que, tras reiniciar una sesión de estudio, volver a pulsar Iniciar continúa esa misma sesión. Al llegar a 00:00, la sesión pasa de incompleta a completada y no se crea una segunda sesión; el incremento del contador de sesiones completadas queda fuera de esta spec (Decisión 025).
- **Motivo:** Evita que el resumen muestre una incompleta que ya se completó y cifras duplicadas por la misma sesión, sin invadir las reglas del ciclo (Decisión 025).

---

**Nota:** este archivo usa el nombre `decisiones.md` por convención del proyecto (AGENTS.md y skill `sdd`), aunque se haya solicitado como "desiciones.md"; los comandos `/sdd-*` buscan ese nombre exacto.
