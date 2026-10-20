# Tareas — 001-iniciar-sesion-estudio

Requisito previo a T1: **autorizado por el usuario el 19/10/2026** para
instalar `jest`, `ts-jest`, `@types/jest` y
`@react-native-async-storage/async-storage`
(AGENTS.md: no se instalan dependencias sin autorización).

Orden por dependencias. Tareas de lógica verificadas con `npx jest`;
tareas de interfaz verificadas con la lista manual de `rn-conventions` en
Expo Go. Actualmente 9 tareas (≤ 10, no se propone dividir la spec).

- [ ] **T1. Configurar Jest y las dependencias del proyecto.** Constitución 10
  - Hecho cuando: `npx jest` termina sin errores ejecutando al menos un caso de humo en `src/domain/__tests__/` y `npx tsc --noEmit` no reporta errores nuevos; `package.json` incluye el script `test` y la configuración de Jest con el mock de AsyncStorage.

- [ ] **T2. Dominio del temporizador: estados, transiciones, restante y formato.** RF-01, RF-02, RF-04, RF-06, RF-07, RF-08, RF-09, RNF-01
  - Hecho cuando: `npx jest` pasa en `src/domain/__tests__/timer.test.ts` cubriendo: iniciar usa la duración configurada; pausar y continuar siguen sin perder tiempo; reiniciar vuelve al tiempo inicial de la fase; `controlsFor` da exactamente los controles de cada estado (idéntico para estudio y descansos); llegar a 00:00 pasa a Finalizado sin control de pausar; `formatRemaining` produce MM:SS y HH:MM:SS con duración ≥ 60 min.

- [ ] **T3. Dominio del registro: marca de sesión incompleta.** RF-10, RF-16
  - Hecho cuando: `npx jest` pasa en `src/domain/__tests__/session-record.test.ts` cubriendo: reiniciar estudio desde Corriendo o Pausado suma una sola vez la incompleta aunque se repita el ciclo; reiniciar desde Finalizado y reiniciar descansos no modifican el registro; completar la sesión marcada retira la marca sin crear sesión nueva y sin incrementar `completed`.

- [ ] **T4. Dominio del registro: día de uso y resumen.** RF-12, RF-13, RF-14, RF-15, RF-17
  - Hecho cuando: `npx jest` pasa en la misma suite cubriendo: el primer inicio de estudio crea el día; sin día, `deriveSummary` devuelve el estado vacío; corte de 24 h vencido sin sesión en curso conserva contadores y fecha hasta el siguiente iniciar, que crea el día nuevo a cero; corte con sesión de estudio en curso no cambia nada hasta que se complete o reinicie y entonces el día nuevo nace en ese instante con la sesión contabilizada en él.

- [ ] **T5. Persistencia del registro con AsyncStorage.** RF-11
  - Hecho cuando: `npx jest` pasa en `src/storage/__tests__/study-record.test.ts` (roundtrip guardar/recuperar, sin dato previo devuelve registro vacío, JSON inválido no lanza) y `npx tsc --noEmit` no reporta errores en `src/storage/`.

- [ ] **T6. Pantalla principal: tiempo restante y controles por estado.** RF-01, RF-02, RF-06, RF-07, RF-08, RF-09, RF-16, RNF-01, RNF-02
  - Hecho cuando: en Expo Go se confirman los puntos aplicables de la lista manual de `rn-conventions` (se ve bien en vertical, áreas seguras, textos en español, estados legibles sin depender del color) y además: solo se muestran los controles del estado actual; el tiempo avanza, pausa y continúa desde donde se pausó; al 00:00 desaparece "Pausar" y queda "Reiniciar"; la tarjeta de resumen refleja la sesión tras completarla.

- [ ] **T7. Confirmación del reinicio con diálogo del sistema.** RF-03, RF-04, RF-05, RF-10
  - Hecho cuando: en Expo Go "Reiniciar" muestra el diálogo del sistema con "¿Reiniciar el temporizador?" y las opciones "Cancelar" y "Reiniciar"; Cancelar conserva el tiempo en cualquier estado; Reiniciar vuelve al tiempo inicial de la fase y el resumen refleja la marca de incompleta; los botones cumplen 44×44 con etiqueta de accesibilidad (`rn-conventions`).

- [ ] **T8. Tarjeta de resumen de sesiones de estudio.** RF-11, RF-12, RF-13, RF-14, RF-15, RF-17
  - Hecho cuando: en Expo Go se confirman de la lista manual de `rn-conventions` "Cerrar la app por completo y abrirla conserva los datos" y "los textos de estado se leen sin depender del color", y además: con datos se muestra `Completadas: X · Incompletas: X · Última sesión de estudio: <fecha del dispositivo>`; sin registros se muestra "Aún no hay sesiones de estudio registradas."; al iniciar una sesión tras más de 24 h el resumen empieza de cero con la fecha nueva.

- [ ] **T9. Verificación integral de la HU-001.** RF-01 a RF-17, RNF-01 a RNF-03, criterios de finalización
  - Hecho cuando: `npx jest` y `npx tsc --noEmit` pasan completos sin errores y los cuatro escenarios de la HU-001 (iniciar, pausar y continuar, reiniciar, cambiar de opinión) se confirman manualmente en Expo Go con la lista de `rn-conventions`; cualquier limitación no verificada queda documentada en el informe.
