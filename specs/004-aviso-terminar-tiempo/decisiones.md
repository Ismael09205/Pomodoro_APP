# Decisiones — 004-aviso-terminar-tiempo (HU-004)

Decisiones tomadas en la entrevista (skill `grill-me`) sobre la HU-004 "Recibir aviso al terminar el tiempo", con base en `docs/constitution.md`, `AGENTS.md` y `docs/historias/HU-004.md`. Fecha: 19/10/2026.

## Decisión 001 — Tipo de aviso

- **Pregunta:** Sobre el aviso con celular en silencio (escenario 2): ¿Qué tipo de mecanismo debe usarse?
- **Respuesta:** A. Notificación con sonido forzado por el sistema (notification channel con importancia alta/sonido).
- **Motivo:** Debe usarse una notificación con sonido forzado por el sistema para cumplir el requisito "incluso con el celular en silencio", tal como se indica en el escenario 2 de la HU-004.

## Decisión 002 — Contenido del aviso

- **Pregunta:** ¿Qué información debe mostrar el aviso cuando termina el tiempo?
- **Respuesta:** B. Debe indicar qué fase terminó ("Estudio terminado" / "Descanso corto terminado" / "Descanso largo terminado"), y además debe indicar la siguiente fase que viene.
- **Motivo:** Permite al estudiante saber qué actividad acaba de terminar y cuál es la siguiente, para cambiar de actividad sin estar mirando la pantalla, tal como se busca en la descripción de la HU-004.

## Decisión 003 — Comportamiento de "detener el aviso"

- **Pregunta:** En el escenario "Detener el aviso", cuando la alarma/notificación está sonando, ¿qué significa exactamente "tocar la notificación o el botón de detener"?
- **Respuesta:** B. Únicamente un botón "Detener" dentro de la app (en alguna pantalla).
- **Motivo:** El aviso se detiene únicamente con un botón "Detener" dentro de la app, según lo indicado.

## Decisión 004 — Transición tras detener el aviso

- **Pregunta:** Cuando se detiene el aviso (alarma silenciada), ¿qué ocurre con la fase?
- **Respuesta:** A. La app se abre mostrando la siguiente fase inmediatamente al detener el aviso (tal como dice el escenario 3).
- **Motivo:** Cumple el escenario 3 de la HU-004: al detener el aviso, la alarma se calla y la aplicación se abre mostrando la siguiente fase.

## Decisión 005 — Permiso de notificaciones

- **Pregunta:** Sobre el escenario "Permiso de notificaciones": ¿Cuándo exactamente se solicita?
- **Respuesta:** B. Solo al iniciar una sesión de estudio por primera vez.
- **Motivo:** Se solicita el permiso de notificaciones únicamente al iniciar una sesión de estudio por primera vez, tal como se define para esta historia.

## Decisión 006 — ¿Qué pasa si se deniega el permiso?

- **Pregunta:** Si el usuario deniega el permiso de notificaciones, ¿qué debe hacer la app?
- **Respuesta:** C. Bloquear el inicio del temporizador hasta que se otorgue el permiso.
- **Motivo:** Al denegarse el permiso, el inicio del temporizador queda bloqueado hasta que el permiso sea otorgado, para garantizar que el aviso pueda cumplirse según lo requerido por la HU-004.

## Decisión 007 — Duración del aviso/alarma

- **Pregunta:** ¿Hasta cuándo debe sonar/vibrar el aviso?
- **Respuesta:** A. Hasta que el usuario lo detenga (sin tiempo límite).
- **Motivo:** El aviso debe sonar y vibrar hasta que el usuario lo detenga, sin tiempo límite.

## Decisión 008 — Ámbito del aviso (app en primer/segundo plano)

- **Pregunta:** ¿Debe funcionar el aviso cuando la app está completamente cerrada (killed), en segundo plano, o solo cuando está abierta/en primer plano?
- **Respuesta:** A. Solo cuando la app está abierta o en segundo plano.
- **Motivo:** El aviso debe funcionar únicamente cuando la app está abierta o en segundo plano. No se requiere funcionalidad con la app completamente cerrada (killed).

## Decisión 009 — Permiso denegado: cómo se vuelve a otorgar

- **Pregunta:** Si el usuario deniega el permiso de notificaciones y el inicio del temporizador queda bloqueado (Decisión 006), ¿cómo puede el usuario otorgar el permiso después?
- **Respuesta:** C. Reintentar la solicitud desde la app y, solo si el sistema ya no la muestra por cualquier motivo, indicar habilitarlo en los ajustes del sistema.
- **Motivo:** El usuario debe tener siempre una salida: se vuelve a solicitar el permiso desde la app y solo se recurre a los ajustes del sistema cuando este ya no muestra la solicitud por cualquier motivo.

## Decisión 010 — Pantalla mientras la alarma suena sin detener el aviso

- **Pregunta:** Mientras la alarma suena porque el temporizador llegó a cero, si el usuario abre la aplicación sin pulsar "Detener", ¿qué debe mostrar la app?
- **Respuesta:** C. Un estado de "fase terminada / aviso activo" sin contador; la siguiente fase se muestra únicamente al pulsar "Detener".
- **Motivo:** Distingue con claridad que hay un aviso pendiente de detener, sin mostrar el reloj en cero ni adelantar la siguiente fase, que aparece al detener según la Decisión 004.

## Decisión 011 — Alcance de sonido y vibración según la plataforma

- **Pregunta:** ¿Qué comportamiento se acepta cuando una notificación estándar no puede garantizar sonido en modo silencio/No molestar ni repetir sonido y vibración indefinidamente?
- **Respuesta:** A. Mantener `expo-notifications` con sonido predeterminado y vibración configurada, sujetos a los permisos y ajustes del sistema. La notificación se entrega una vez; el estado visual dentro de la app permanece activo hasta pulsar "Detener".
- **Motivo:** El usuario autorizó el comportamiento de mejor esfuerzo de la plataforma y el ajuste correspondiente de la spec. La app no debe afirmar que puede eludir de forma fiable los controles de sonido del sistema ni mantener una notificación estándar en alarma continua.
- **Alcance:** Esta decisión sustituye las expectativas de sonido forzado de la Decisión 001 y repetición ilimitada de la Decisión 007. Android usa un canal de alta importancia sin eludir No molestar; iOS usa el sonido predeterminado sin solicitar entitlement de alertas críticas. Las limitaciones concretas quedan sujetas a verificación manual en el dispositivo y deben documentarse conforme a RNF-02.
