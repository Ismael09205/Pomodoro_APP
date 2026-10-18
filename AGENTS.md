# AGENTS.md — Aplicación Pomodoro para Estudiantes

Aplicación móvil para estudiantes que permite gestionar sesiones de estudio y descanso mediante el método Pomodoro, controlar el temporizador, recuperar sesiones y configurar duraciones. Proyecto desarrollado con Expo y TypeScript.

## Stack y estructura

- Expo, TypeScript y Expo Router.
- Persistencia local con `@react-native-async-storage/async-storage`. Sin backend ni cuentas de usuario.
- `src/domain/`: lógica pura del dominio, sin React ni AsyncStorage.
- `src/storage/`: persistencia local.
- `app/`: pantallas y navegación.
- Pruebas junto a cada módulo, dentro de `__tests__/`.
- `docs/constitution.md`: principios y restricciones del proyecto.
- `docs/historias/`: historias de usuario.
- `specs/NNN-nombre/`: especificaciones, decisiones, planes, tareas y memoria de cada iniciativa.
- `.opencode/skills/`: skills específicas del proyecto, como `sdd`, `pomodoro-domain` y `cotopaxi-brand`.

## Comandos

- Ejecutar la aplicación: `npx expo start`.
- Ejecutar las pruebas: `npx jest`.
- Verificar TypeScript: `npx tsc --noEmit`.
- No ejecutar comandos adicionales que alteren dependencias o archivos sin autorización.

## Convenciones

- Código, clases, funciones, variables e identificadores en inglés.
- Textos visibles de la interfaz, comentarios y documentación en español.
- Aplicar las reglas funcionales definidas en las HU y las especificaciones aprobadas.
- Las decisiones funcionales se documentan en `specs/NNN-nombre/decisiones.md` y se toman a partir de las HU y las aclaraciones aprobadas.
- Respetar la paleta visual de la skill `cotopaxi-brand`: azul marino `#181759`, dorado `#C69214` y blanco `#FFFFFF`. Aplicar Claymorphism cuando corresponda.
- Utilizar las skills pertinentes para cada tarea: `sdd` para el proceso de desarrollo, `pomodoro-domain` para la lógica del temporizador y `cotopaxi-brand` para la interfaz.

## Forma de trabajar

- Leer `MEMORY.md`, `docs/constitution.md` y la especificación activa antes de modificar código.
- Revisar las HU, decisiones y plan correspondientes a la tarea.
- Inspeccionar el código existente antes de proponer cambios.
- Seguir el flujo SDD: decisiones necesarias, especificación, plan, tareas, implementación y validación.
- Trabajar únicamente en la fase y tarea autorizadas.
- Implementar una tarea a la vez.
- No asumir requisitos funcionales ni tomar decisiones de producto no aprobadas.
- Si falta una definición necesaria, marcarla como `[NECESITA ACLARACIÓN]` y solicitar aclaración antes de continuar con la parte afectada.

## Límites

- Priorizar pruebas antes de implementar o modificar lógica de dominio.
- No instalar dependencias sin autorización.
- No crear archivos fuera del plan aprobado.
- No cambiar formatos de datos persistidos sin autorización.
- No reemplazar archivos existentes sin autorización.
- No añadir funcionalidades, pantallas ni comportamientos que no estén contemplados en las HU o especificaciones aprobadas.
- No introducir backend, cuentas, anuncios ni servicios externos.
- No guardar datos sensibles.
- No realizar commits sin autorización.
- No afirmar que una validación pasó si no se ejecutó.

## Memoria

- Al comenzar, leer el `MEMORY.md` de la iniciativa activa.
- Al terminar una fase SDD o una tarea, actualizar únicamente las secciones `Estado actual` y `Próximos pasos`.
- Indicar en `Próximos pasos` la siguiente fase o el agente que corresponde ejecutar.
- No copiar decisiones, especificaciones ni detalles de implementación a la memoria; remitir a los documentos correspondientes.
- Mantener `MEMORY.md` conciso, con un máximo aproximado de 50 líneas.

## Verificación

- Lógica: ejecutar `npx jest` y revisar las pruebas de los módulos afectados.
- Tipos: ejecutar `npx tsc --noEmit` cuando corresponda.
- Interfaz: comprobar manualmente la tarea en Expo Go y revisar la paleta, legibilidad, adaptación a pantalla y estados interactivos.
- Recuperación, temporizador y notificaciones: verificar los escenarios definidos en las HU y documentar cualquier limitación de la plataforma.
- Informar los archivos modificados, las pruebas ejecutadas, sus resultados y las comprobaciones pendientes.
- No marcar como completada una tarea que todavía requiera una validación manual pendiente.

