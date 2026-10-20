# Plan — 006-usar-app-noR-noI (HU-006)

## 1. Archivos que se crean o modifican y responsabilidad

| Archivo | Acción | Responsabilidad | RF cubiertos |
|---------|--------|-----------------|--------------|
| `src/app/index.tsx` | Modificar | Pantalla temporizador. Asegurar primer arranque directo al temporizador (sin pantallas intermedias). Solicitar permiso de notificaciones **una sola vez** al llegar al temporizador (Decisión 001). Si se rechaza, continuar normalmente (RF-03). Inicializar con valores por defecto de HU-005 (RF-05, Decisión 007). No introducir red/publicidad. | RF-01, RF-02, RF-03, RF-05 |
| `src/app/settings.tsx` | Modificar | UI de Ajustes. Mostrar opción con texto visible `"Activar avisos"` **únicamente** cuando los avisos NO estén concedidos (rechazo, nunca concedido o revocado) (Decisión 009). Al tocarla, abrir ajustes del sistema con `Linking.openSettings()` (RF-11). Actualizar visibilidad al volver a la app (AppState/resume) para que desaparezca si ya concedido (Decisión 010). Sin indicadores de red, sin banners/promocionales. | RF-04, RF-11, RF-12 |
| `src/app/_layout.tsx` | Revisar (posiblemente sin cambios) | Verificar que no añade pantallas intermedias ni indicadores de red. Si ya redirige directo a `index`, no modificar. | RF-01, RF-09 |
| `src/storage/*` | Revisar (sin cambios obligatorios) | Gestionar flag persistente `notifications.permissionRequestedOnce` en AsyncStorage (sin cambiar formato de datos existentes). Ajustes ya se conservan (RF-07). | RF-02, RF-07 |
| `src/domain/*`, `src/components/*`, `app-tabs.web.tsx`, `components/external-link.tsx`, `package.json` | Revisar (sin modificar código) | Verificación transversal: cero peticiones de red, sin SDKs de anuncios/analíticas, sin indicadores de red, elementos web ajenos no constituyen publicidad (Decisión 003). | RF-08, RF-09, RF-10 |

## 2. Funciones puras de lógica (dominio)

**No se identifican funciones puras nuevas.** La regla "mostrar Activar avisos" depende del estado del permiso del sistema (`permissionGranted`), no de transformaciones de dominio del temporizador/ciclo. 

- **Alternativa descartada:** Crear `src/domain/notifications-policy.ts` con `shouldShowActivateAlerts(permissionGranted: boolean): boolean` (retorna `!permissionGranted`). Razón: regla de 1 línea, ligada al permiso del sistema (no a reglas Pomodoro), sin valor para pruebas de dominio existentes. Se mantiene la separación (Constitución 9) sin sobreingeniería.

RF cubiertos: RF-04, RF-12.

## 3. Persistencia

- **Nueva clave:** `notifications.permissionRequestedOnce` (boolean/string) en AsyncStorage. Se guarda **true** inmediatamente después de solicitar el permiso en el primer arranque (aunque el usuario lo rechace), para garantizar que **solo se pide una sola vez** (Decisión 001, RF-02).
- **Existente:** Persistencia de ajustes ya implementada (RF-07). No se cambia el formato de datos guardados.
- **Alternativa descartada:** Solo estado en memoria (se perdería al cerrar app, podría volver a pedir).
- **Alternativa descartada:** Inferir desde estado de permiso (si rechazado, el sistema no indica "ya pedido antes", no es fiable).

RF cubiertos: RF-02, RF-07.

## 4. Algoritmo en pseudocódigo

### A) Primer arranque y solicitud de permiso (`src/app/index.tsx`)
```
al montar index.tsx:
  - asegurar navegación directa al temporizador (sin rutas intermedias) [RF-01]
  - leer flag `notifications.permissionRequestedOnce` desde AsyncStorage
  - si NO solicitado:
      - marcar como solicitando
      - solicitar permiso de notificaciones al sistema (Expo Notifications)
      - guardar `notifications.permissionRequestedOnce = true` en AsyncStorage (aunque sea rechazado) [RF-02]
      - si rechazado: continuar normalmente sin avisos [RF-03]
  - si YA solicitado: no volver a pedir
  - inicializar sesión con valores por defecto de HU-005 (reutilizar lógica existente) [RF-05]
```

### B) Visibilidad "Activar avisos" en Ajustes (`src/app/settings.tsx`)
```
al montar settings.tsx:
  - obtener estado actual del permiso de notificaciones (sistema)
  - shouldShow = (!permissionGranted)  [Decisión 009: solo cuando NO concedido]
  - renderizar "Activar avisos" solo si shouldShow [RF-04, Decisión 012]

al volver a foco (AppState change a 'active' / focus):
  - volver a obtener estado del permiso
  - actualizar shouldShow [RF-12, Decisión 010]
```

### C) Acción "Activar avisos" (`src/app/settings.tsx`)
```
al tocar "Activar avisos":
  - abrir ajustes del sistema de la app: Linking.openSettings() [RF-11]
  (no se vuelve a solicitar permiso; el usuario lo gestiona desde el sistema)
```

### D) Verificación transversal (sin código)
```
verificación:
  - modo avión (sin datos móviles ni wifi): temporizador, avisos y ajustes funcionan igual [RF-06]
  - sin indicadores de estado de red [RF-09]
  - sin anuncios de terceros ni contenido promocional propio [RF-10]
  - grep: sin fetch/axios/XMLHttpRequest/navigator.sendBeacon relevantes en src/ [RF-08]
  - package.json: sin SDKs de anuncios ni analíticas [RF-08, RF-10]
```

## 5. Cómo se pinta en la interfaz

- **`src/app/index.tsx`**: Sin cambios visuales obligatorios. Solo comportamiento (solicitud de permiso una sola vez). Mantener paleta (`#181759`, `#C69214`, `#FFFFFF`) y Claymorphism según skill `cotopaxi-brand`.
- **`src/app/settings.tsx`**: Añadir/mostrar condicionalmente una opción con **texto visible exactamente `"Activar avisos"`**. Ubicarla en una sección relacionada con notificaciones/avisos, manteniendo estilo, espaciados y componentes existentes. Solo visible cuando `!permissionGranted` (Decisión 009). Al volver desde ajustes del sistema con permiso concedido, desaparece (Decisión 010). Sin banners, sin enlaces promocionales.
- **Layout/tabs**: Sin cambios. No añadir pantallas intermedias.
- **Restricciones visuales**: Ningún indicador de red, ningún anuncio, ningún mensaje tipo "valora la app" (RF-09, RF-10).

## 6. Decisiones técnicas justificadas (con alternativa descartada)

| DT | Decisión técnica | Justificación | Alternativa descartada |
|----|-------------------|---------------|--------------------------|
| DT-001 | Solicitar permiso una sola vez en primer arranque (`index.tsx`) | Decisión 001. Mantiene "directo al temporizador" y evita preguntas repetidas. | Preguntar en Ajustes siempre que no concedido – rompería "una sola vez", añade complejidad innecesaria. |
| DT-002 | Persistir `notifications.permissionRequestedOnce` en AsyncStorage | Necesario para recordar entre aperturas que ya se pidió (RF-02). | Solo memoria – se perdería al cerrar app. Inferir desde permiso – no fiable si rechazado. |
| DT-003 | Visibilidad = `!permissionGranted` únicamente | Decisión 009 y 013. Solo cubre permiso de notificaciones. | Mostrar siempre – ensucia UI. Ampliar a canal/No molestar/sonido – inalcanzable con este criterio, añade lógica inestable/difícil de verificar (Constitución 7). |
| DT-004 | `Linking.openSettings()` al tocar "Activar avisos" | Decisión 008/011. Tras rechazo explícito el diálogo no vuelve a mostrarse; hay que ir a ajustes del sistema. | Volver a llamar `requestPermissionsAsync()` – no vuelve a mostrar diálogo tras rechazo, no cumple recuperación deseada. |
| DT-005 | Refrescar estado al volver (AppState) en Ajustes | Decisión 010. La opción debe desaparecer inmediatamente al volver si ya concedido. | Solo al montar – no refleja cambio tras volver de ajustes del sistema. |
| DT-006 | No añadir funciones puras de dominio nuevas | Constitución 9; regla trivial y ligada a permiso del sistema, no a reglas Pomodoro. | Crear módulo de dominio para política de notificaciones – sobreingeniería, sin valor para tests existentes. |
| DT-007 | Verificación sin código para red/publicidad (grep + revisión) | RF-08/RF-10, Decisiones 002/003/005. Restricción transversal. | Tests automatizados frágiles; verificación manual + grep acorde a "restricción y verificación" (Decisión 004). |

## 7. Estrategia de pruebas con Jest

- **Lógica de dominio nueva:** No hay. No se añaden archivos de test nuevos.
- **Lógica afectada existente:** Inicialización/sesión/temporizador ya cubiertos por specs 001-005. Cambios son mayoritariamente UI + permiso + flag persistente.
- **Verificación obligatoria:** Ejecutar `npx jest` tras cambios (T6). Deben pasar todas las suites existentes sin fallos (Constitución 10).
- **Tipado:** Ejecutar `npx tsc --noEmit` (T6).
- **Verificación manual:** Según Decisión 005/RNF-01: Expo Go en modo avión, revisar ausencia de SDKs/anuncios, grep de red. Documentar resultados y limitaciones (RNF-02).
- **Casos límite:** Rechazo de permiso, permiso revocado, volver de ajustes del sistema, uso sin conexión, persistencia de ajustes.

## Cobertura RF
RF-01 a RF-12 cubiertos por los puntos anteriores. RNF-01, RNF-02, RNF-03 contemplados en verificación.
