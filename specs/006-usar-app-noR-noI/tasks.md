# Tasks — 006-usar-app-noR-noI (HU-006)

Formato según skill SDD. Tareas de 20-30 minutos máximo, ordenadas por dependencia. Lógica → `npx jest`. Interfaz → puntos de lista manual de `rn-conventions`.

**Total tareas:** 7  
**No se propone dividir la spec** (≤ 10 tareas).

## Orden y dependencias
T1 → T2 → T3 → T4 → T5 → T6 → T7

## Tareas

### T1. Revisar restricciones transversales (sin código) — 20-30 min
- **Estado:** Completada (HU-006).
- **Dependencia:** ninguna
- **RF:** RF-08, RF-09, RF-10
- **Descripción:**
  1. Ejecutar grep para detectar peticiones de red en `src/`: `fetch`, `axios`, `http.get`, `XMLHttpRequest`, `navigator.sendBeacon`.
  2. Revisar `package.json` (sin SDKs de anuncios/analíticas).
  3. Revisar elementos web residuales (`app-tabs.web.tsx`, `components/external-link.tsx`) para confirmar que no constituyen publicidad (Decisión 003).
- **Hecho cuando:**
  - [x] Se ejecutó `grep -rn "fetch\|axios\|http\.get\|XMLHttpRequest\|navigator\.sendBeacon" src 2>&1 | head -40` y no hay resultados relevantes (documentar si no hay coincidencias). *Resultado: sin coincidencias; cero peticiones de red en `src/`.*
  - [x] `package.json` revisado: sin dependencias de publicidad, analíticas o telemetría. *Confirmado.*
  - [x] `app-tabs.web.tsx` y `components/external-link.tsx` revisados y confirmados como ajenos a publicidad. *Residuos de plantilla; enlace a `docs.expo.dev` solo web (Decisión 003).*
  - [x] Resultado registrado para verificación.

### T2. Añadir flag persistente para "permiso solicitado una sola vez" (storage) — 20-30 min
- **Estado:** Completada (HU-006).
- **Dependencia:** T1
- **RF:** RF-02
- **Descripción:**
  1. Verificar cómo se gestiona AsyncStorage en `src/storage/`.
  2. Añadir/gestionar clave `notifications.permissionRequestedOnce` (lectura/escritura) sin cambiar formato de datos existentes.
- **Hecho cuando:**
  - [x] Clave `notifications.permissionRequestedOnce` gestionada desde el código sin romper persistencia existente. *Nuevo módulo `src/storage/notifications-permission.ts`; 8 pruebas nuevas en verde.*
  - [x] No se modifica el formato de datos guardados. *Clave nueva; prueba de que no altera settings/cycle-state/study-record.*
  - [x] `npx tsc --noEmit` sin errores.

### T3. Solicitar permiso una sola vez en primer arranque (`src/app/index.tsx`) — 20-30 min
- **Estado:** Implementada; pendiente de verificación manual en Expo Go. Nota (aclaración del usuario, 20/10/2026): se mantiene el bloqueo de inicio de la RF-07 de la spec 004 ante rechazo, por lo que el punto «Rechazo del permiso no bloquea el uso» queda parcial (solo afecta al inicio del temporizador); el pedido al abrir sustituye al de 004 RF-06.
- **Dependencia:** T2
- **RF:** RF-01, RF-02, RF-03, RF-05
- **Descripción:**
  1. Asegurar navegación directa al temporizador (sin pantallas intermedias).
  2. Al montar, leer flag `notifications.permissionRequestedOnce`. Si no solicitado, pedir permiso de notificaciones (Expo Notifications), guardar flag en `true` (aunque sea rechazado), si rechazado continuar normalmente.
  3. Inicializar sesión con valores por defecto de HU-005 reutilizando lógica existente.
- **Hecho cuando:**
  - [ ] Primer arranque llega directo al temporizador (RF-01).
  - [ ] Permiso solicitado **únicamente** la primera vez (persistido). RF-02 cumplido.
  - [ ] Rechazo del permiso no bloquea el uso. RF-03 cumplido.
  - [ ] Sesión inicia con valores por defecto HU-005. RF-05 cumplido.
  - [ ] Sin pantallas intermedias añadidas.
  - [ ] `npx tsc --noEmit` sin errores.
  - [ ] `npx jest` ejecutado sobre módulos afectados sin fallos (si aplica).

### T4. Añadir lógica de visibilidad "Activar avisos" en Ajustes (`src/app/settings.tsx`) — 20-30 min
- **Estado:** Implementada; pendiente de verificación manual en Expo Go.
- **Dependencia:** T3
- **RF:** RF-04, RF-09
- **Descripción:**
  1. Obtener estado del permiso de notificaciones en `settings.tsx`.
  2. Mostrar opción con **texto visible exactamente `"Activar avisos"`** únicamente cuando `!permissionGranted` (Decisión 009).
  3. Mantener estilo, paleta (`#181759`, `#C69214`, `#FFFFFF`) y Claymorphism según `cotopaxi-brand`. Sin indicadores de red.
- **Hecho cuando:**
  - [ ] Texto visible exactamente `"Activar avisos"`.
  - [ ] Solo aparece cuando NO concedido (rechazo/nunca concedido/revocado). No aparece cuando concedido.
  - [ ] Sin indicadores de estado de red.
  - [ ] Respeta paleta y Claymorphism (revisar con puntos `rn-conventions`).
  - [ ] Legibilidad, adaptación a pantalla y estados interactivos correctos.
  - [ ] `npx tsc --noEmit` sin errores.

### T5. Abrir ajustes sistema y refrescar al volver (`src/app/settings.tsx`) — 20-30 min
- **Estado:** Implementada; pendiente de verificación manual en Expo Go.
- **Dependencia:** T4
- **RF:** RF-11, RF-12
- **Descripción:**
  1. Al tocar "Activar avisos", llamar `Linking.openSettings()` (RF-11).
  2. Añadir listener AppState/resume para reconsultar permiso al volver y actualizar visibilidad (RF-12). Si ya concedido, la opción desaparece al momento.
- **Hecho cuando:**
  - [ ] Tocar la opción abre los ajustes del sistema de la app.
  - [ ] Al volver con permiso concedido, la opción `"Activar avisos"` desaparece inmediatamente.
  - [ ] No se vuelve a solicitar permiso al tocar la opción.
  - [ ] Interactividad correcta según `rn-conventions`.
  - [ ] `npx tsc --noEmit` sin errores.

### T6. Verificación transversal (Jest + tipos) — 20-30 min
- **Estado:** Completada (HU-006).
- **Dependencia:** T5
- **RF:** RNF-01, RNF-03
- **Descripción:**
  1. Ejecutar `npx jest`.
  2. Ejecutar `npx tsc --noEmit`.
- **Hecho cuando:**
  - [x] `npx jest` ejecutado. **Sin fallos** en todas las suites existentes. *Resultado: 11 suites / 139 pruebas, todas pasan.*
  - [x] `npx tsc --noEmit` sin errores.
  - [x] Resultados registrados.

### T7. Verificación manual HU-006 (modo avión + escenarios) — 20-30 min
- **Estado:** Pendiente; requiere validación del usuario en Expo Go.
- **Dependencia:** T6
- **RF:** RF-06, RF-07, RF-01–RF-12 (completo), RNF-01, RNF-02
- **Descripción:**
  1. Validación manual en Expo Go con **modo avión**.
  2. Verificar los 3 escenarios de HU-006: primer arranque directo al temporizador, usar sin conexión, usar sin publicidad.
  3. Verificar recuperación de avisos: aparece solo cuando no concedido, abre ajustes, desaparece al volver si concedido, rechazo no bloquea.
  4. Verificar persistencia de ajustes (RF-07).
  5. Documentar resultados y limitaciones (RNF-02: rechazo/revocado = limitación de plataforma).
- **Hecho cuando:**
  - [ ] Escenario "Abrir la aplicación por primera vez": directo al temporizador, permiso solicitado una sola vez, con valores por defecto HU-005.
  - [ ] Escenario "Usarla sin conexión": temporizador, avisos y ajustes funcionan igual; ajustes guardados; sin indicadores de red.
  - [ ] Escenario "Usarla sin publicidad": sin anuncios de terceros, sin contenido promocional propio (sin banners, sin enlaces de terceros, sin "valora la app").
  - [ ] Opción `"Activar avisos"` aparece solo cuando no concedido, abre ajustes del sistema, desaparece al volver si concedido.
  - [ ] Rechazo del permiso no bloquea el uso.
  - [ ] Criterios de finalización de spec 006 cumplidos.
  - [ ] Resultados y limitaciones documentados.
