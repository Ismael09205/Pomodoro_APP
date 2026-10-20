# Spec 006 — Usar la aplicación sin registro, sin internet y sin publicidad

Estado: aprobado
HU de origen: docs/historias/HU-006.md

## Contexto y objetivo

La HU-006 no describe ninguna pantalla propia: su valor está en garantizar restricciones transversales sobre las pantallas existentes y las futuras. El objetivo es que el estudiante pueda usar la aplicación apenas la instala, sin crear una cuenta, sin datos móviles ni wifi y sin anuncios, empezando a estudiar sin trabas. Esta spec es, por tanto, de restricción y verificación.

## Usuarios

Estudiante (HU-006).

## Historias de usuario

**HU-006 — Usar la aplicación sin registro, sin internet y sin publicidad.**

Como estudiante, quiero usar la aplicación apenas la instalo, sin crear una cuenta, sin datos móviles y sin anuncios, para empezar a estudiar sin trabas.

- Escenario «Abrir la aplicación por primera vez»: habiendo instalado la aplicación, al abrirla por primera vez se llega directo al temporizador, sin pantallas de registro ni de inicio de sesión.
- Escenario «Usarla sin conexión»: sin datos móviles ni wifi, el temporizador, los avisos y los ajustes funcionan igual y los ajustes quedan guardados en el celular.
- Escenario «Usarla sin publicidad»: recorriendo cualquier pantalla de la aplicación no aparece ningún anuncio.

## Definiciones

- **Sin internet:** cero peticiones de red en toda la aplicación; nada de analíticas, telemetría, fuentes ni imágenes remotas (Decisión 002).
- **Publicidad:** tanto los anuncios de terceros como el contenido promocional propio de la aplicación: banners, enlaces de terceros y mensajes tipo «valora la app» (Decisión 003).

## Requisitos funcionales

- RF-01: CUANDO el estudiante abre la aplicación por primera vez, EL SISTEMA lo lleva directamente al temporizador, sin pantallas de registro ni de inicio de sesión.
  Origen: Escenario «Abrir la aplicación por primera vez» (HU-006).

- RF-02: CUANDO la aplicación se abre por primera vez, EL SISTEMA solicita el permiso de notificaciones al llegar al temporizador, una sola vez y sin pantallas intermedias propias de la aplicación.
  Origen: Decisión 001.

- RF-03: SI el estudiante rechaza el permiso de notificaciones, ENTONCES EL SISTEMA continúa funcionando normalmente, sin avisos.
  Origen: Decisión 001 y Decisión 008.

- RF-04: CUANDO los avisos no están concedidos, sea por rechazo del permiso, porque nunca se concedió o porque se revocó desde el sistema, EL SISTEMA muestra en la pantalla de ajustes una opción con el texto visible «Activar avisos», que abre los ajustes del sistema.
  Origen: Decisión 008, Decisión 009 y Decisión 012.

- RF-05: CUANDO la aplicación se abre por primera vez, EL SISTEMA inicia la sesión con los valores por defecto definidos en la HU-005.
  Origen: Decisión 007.

- RF-06: MIENTRAS el estudiante usa el temporizador, los avisos y los ajustes sin datos móviles ni wifi, EL SISTEMA funciona igual que con conexión.
  Origen: Escenario «Usarla sin conexión» (HU-006).

- RF-07: CUANDO el estudiante cambia sus ajustes, EL SISTEMA los conserva guardados en el celular.
  Origen: Escenario «Usarla sin conexión» (HU-006).

- RF-08: EL SISTEMA no realiza ninguna petición de red en toda la aplicación, sin analíticas, telemetría, fuentes ni imágenes remotas.
  Origen: Decisión 002.

- RF-09: EL SISTEMA no muestra indicadores ni avisos de estado de red.
  Origen: Decisión 006.

- RF-10: MIENTRAS el estudiante recorre cualquier pantalla de la aplicación, EL SISTEMA no muestra anuncios de terceros ni contenido promocional propio, sin banners, sin enlaces de terceros y sin mensajes tipo «valora la app».
  Origen: Escenario «Usarla sin publicidad» (HU-006) y Decisión 003.

- RF-11: CUANDO el estudiante toca la opción «Activar avisos», EL SISTEMA abre los ajustes del sistema para habilitar el permiso de notificaciones.
  Origen: Decisión 008 y Decisión 013.

- RF-12: CUANDO el estudiante vuelve a la aplicación desde los ajustes del sistema, EL SISTEMA actualiza la pantalla de ajustes al momento: si los avisos ya están concedidos, la opción «Activar avisos» desaparece.
  Origen: Decisión 010.

## Requisitos no funcionales

- RNF-01: Los criterios de aceptación se verifican con validación manual en Expo Go en modo avión sobre temporizador, avisos y ajustes, más revisión de que no existan SDKs de anuncios ni llamadas de red, documentando resultados y limitaciones.
  Origen: Decisión 005.

- RNF-02: El rechazo del permiso de notificaciones se documenta como limitación de plataforma, sin afirmar que los avisos están garantizados cuando no se ha verificado.
  Origen: Decisión 001 y Constitución 7.

- RNF-03: La lógica afectada se somete a las pruebas obligatorias exigidas por la Constitución 10, sin avanzar con pruebas fallidas.
  Origen: Constitución 10.

## Casos límite

- El estudiante rechaza el permiso de notificaciones en el primer arranque: la aplicación continúa funcionando normalmente y sin avisos (Decisión 001 y Decisión 008).
- Cuando los avisos no están concedidos, ya sea por rechazo del permiso, porque nunca se concedió o porque se revocó desde el sistema, el estudiante puede recuperarlos desde la pantalla de ajustes con la opción «Activar avisos»; si no lo hace, la aplicación funciona igual sin avisos (Decisión 008 y Decisión 009).
- Primer arranque: la HU-006 no define tiempos nuevos, por lo que la sesión comienza con los valores por defecto de la HU-005 (Decisión 007).
- Cualquier pantalla usada sin datos móviles ni wifi debe comportarse igual que con conexión, sin indicadores de estado de red (Escenario «Usarla sin conexión», Decisión 002 y Decisión 006).

## Fuera de alcance

- Crear pantallas nuevas, con la única excepción del mecanismo de permiso de la Decisión 001 (Decisión 004).
- Definir duraciones, conteos o valores por defecto nuevos; corresponden a la HU-005 (Decisión 007).
- Añadir funcionalidades de red, cuentas, registro, inicio de sesión o publicidad (Constitución 6 y 8, Decisión 002 y Decisión 003).
- Establecer una categoría de «publicidad permitida» que ninguna HU apruebe (Decisión 003).
- Detectar o compensar otros bloqueos del sistema que impiden los avisos (canal de notificaciones, «No molestar», sonido, vibración); se tratan como limitación de plataforma documentada (Decisión 013).

## Criterios de finalización

- Los tres escenarios de la HU-006 verificados con el método de la Decisión 005 y con sus resultados y limitaciones documentados.
- Verificado que la primera apertura llega directo al temporizador, con el permiso solicitado una sola vez y con los valores por defecto de la HU-005.
- Verificado que el rechazo del permiso no bloquea el uso de la aplicación; que la opción «Activar avisos» aparece en la pantalla de ajustes cuando los avisos no están concedidos y desaparece al volver de activarlos en el sistema; y que abre los ajustes del sistema para habilitar el permiso de notificaciones.
- Las pruebas exigidas por la Constitución 10 ejecutadas y sin fallos.

## Dudas abiertas

- Ninguna.
