---
name: sdd
description: Úsala siempre que trabajes con Spec-Driven Development en este proyecto: redactar, revisar o cambiar decisiones, specs, planes y tareas, o implementar y validar tareas de una spec.
---

# Spec-Driven Development (SDD)

## Flujo y responsabilidades

Constitución → grill-me → Spec → Plan y tareas → Implementación → Cambio.

| Fase | Responsable | Escribe únicamente |
|---|---|---|
| Decisiones | skill `grill-me` | `specs/NNN-nombre/decisiones.md` |
| Spec | agente `sdd-spec` | `specs/NNN-nombre/spec.md` |
| Plan y tareas | agente `sdd-plan` | `specs/NNN-nombre/plan.md` y `tasks.md` |
| Implementación | agente `sdd-implement` | Código, pruebas y estado de las tareas |

- Nunca avances a la siguiente fase sin aprobación explícita del usuario.
- La constitución establece los principios innegociables del proyecto.
- Las historias de usuario y las decisiones aprobadas definen los requisitos funcionales.
- La spec define qué debe hacer el sistema y por qué.
- El plan define cómo se implementará.
- Las tareas dividen el trabajo en unidades verificables.
- Si un requisito no está definido en la historia de usuario, en una decisión aprobada o en la spec activa, no lo inventes.
- Si falta una decisión, márcala como `[NECESITA ACLARACIÓN]` durante la elaboración de la spec. Al planificar o implementar, detente y solicita aclaración cuando esa decisión sea necesaria.
- Los cambios de requisitos deben reflejarse primero en la spec, después en el plan y las tareas, y finalmente en el código.
- Cada spec vive en `specs/NNN-nombre/`.
- `decisiones.md` se modifica únicamente para añadir, al final y con numeración consecutiva, una decisión expresamente indicada por el usuario para resolver una duda abierta.
- Al terminar cada fase o tarea, actualiza en `MEMORY.md` únicamente las secciones `Estado actual` y `Próximos pasos`. Indica el siguiente agente o fase, sin copiar decisiones ni contenido de la spec.

## Alcance de la skill

Esta skill define el proceso de desarrollo, no las reglas funcionales de la aplicación.

- No establece duraciones, cantidades, valores predeterminados ni reglas del ciclo Pomodoro.
- No decide cómo debe comportarse una funcionalidad concreta.
- No añade requisitos funcionales a las historias de usuario.
- No sustituye la constitución ni las decisiones aprobadas.
- No permite implementar funcionalidades por considerarlas convenientes si no están definidas.
- No establece tecnologías, dependencias ni soluciones de arquitectura por iniciativa propia.

Los valores y comportamientos funcionales deben proceder de la historia de usuario correspondiente o de una decisión aprobada.

## Plantilla de spec (`spec.md`)

```markdown
# Spec NNN — <Nombre>

Estado: borrador | aprobada | implementada
HU de origen: docs/historias/HU-00N.md

## Contexto y objetivo

## Usuarios

## Historias de usuario

## Definiciones (Solo si existen términos que puedan interpretarse de varias formas.)

## Requisitos funcionales

## Requisitos no funcionales

## Casos límite

## Fuera de alcance

## Criterios de finalización

## Dudas abiertas
- [NECESITA ACLARACIÓN] <duda>
```

La spec describe el **QUÉ** y el **POR QUÉ**, no el cómo técnico.

No incluyas stack, arquitectura, formatos de almacenamiento, nombres de archivos ni detalles de implementación en los requisitos funcionales.

Cada requisito funcional debe describir un comportamiento identificable y verificable. No dividas un comportamiento en requisitos artificiales ni añadas comportamientos que no estén respaldados por los requisitos aprobados.

## Requisitos en EARS

Redacta los requisitos en español mediante las siguientes estructuras, según corresponda:

- `RF-x: CUANDO <evento>, EL SISTEMA <respuesta>.`
- `RF-x: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.`
- `RF-x: MIENTRAS <estado>, EL SISTEMA <respuesta>.`
- `RF-x: EL SISTEMA <comportamiento permanente>.`

Reglas:

1. Cada requisito debe ser claro y verificable.
2. Cada requisito debe terminar con `Origen:`, indicando el escenario de la historia de usuario o la decisión aprobada que lo respalda.
3. Cada escenario de la historia de usuario debe quedar cubierto por al menos un requisito funcional.
4. No introduzcas restricciones, excepciones ni comportamientos adicionales que no estén definidos en las fuentes aprobadas.
5. Si una condición necesaria no está especificada, registra la duda como `[NECESITA ACLARACIÓN]`.
6. Los requisitos no funcionales también deben estar respaldados por la constitución, una historia de usuario o una decisión aprobada.

## Revisión final de la spec

Al terminar `spec.md`, presenta una lista de revisión que identifique, sin proponer soluciones:

- Contradicciones entre requisitos.
- Escenarios de la historia de usuario sin cobertura.
- Conflictos con `docs/constitution.md`.
- Decisiones pendientes que impidan comprender el alcance.
- Requisitos sin una fuente aprobada.

Máximo 10 puntos. Si no se encuentran problemas, indícalo expresamente.

Después, detente y espera la aprobación del usuario.

## Plan (`plan.md`)

El plan define cómo implementar los requisitos de la spec aprobada.

Incluye, cuando corresponda:

- Archivos implicados y sus responsabilidades.
- Separación entre lógica de dominio, interfaz y persistencia.
- Funciones puras y sus responsabilidades.
- Persistencia y recuperación de datos.
- Algoritmos en pseudocódigo.
- Interfaz afectada.
- Decisiones técnicas justificadas y alternativas descartadas.
- Estrategia de pruebas con Jest.
- Relación entre cada parte del plan y los requisitos funcionales que cubre.

No inventes archivos, dependencias, requisitos ni decisiones de producto. Si una decisión técnica necesaria no está autorizada o definida, detente y solicita aclaración.

Al terminar el plan y las tareas, espera la aprobación del usuario.

## Tareas (`tasks.md`)

Utiliza el siguiente formato:

```markdown
- [ ] **Tn. <Descripción>.** RF-x, RF-y
  - Hecho cuando: <comprobación verificable>.
```

- Ordena las tareas por dependencias.
- Divide el trabajo en unidades pequeñas, idealmente de 20 a 30 minutos.
- Cada tarea debe tener un resultado verificable y referenciar los requisitos que cubre.
- Si se necesitan más de 10 tareas, propone dividir la spec en unidades más pequeñas y espera aprobación.
- No marques una tarea como terminada sin verificar su condición de finalización.
- No avances a la implementación hasta recibir aprobación explícita del usuario.

## Implementación

Trabaja en una sola tarea cada vez.

1. Lee la tarea, la spec aprobada, el plan y las instrucciones aplicables.
2. Escribe primero las pruebas correspondientes, verificando que detecten el comportamiento pendiente.
3. Implementa únicamente lo necesario para cumplir la tarea.
4. Ejecuta `npx jest` y comprueba el resultado.
5. Ejecuta `npx tsc --noEmit` cuando corresponda.
6. Si hay fallos, corrige los relacionados con la tarea antes de darla por terminada.
7. Marca la tarea como completada únicamente cuando se cumplan sus condiciones verificables.
8. Si la tarea afecta a la interfaz, presenta una lista manual de verificación y espera a que el usuario confirme que la probó en Expo Go antes de marcarla como terminada.
9. Actualiza únicamente `Estado actual` y `Próximos pasos` en `MEMORY.md`.
10. Informa qué se modificó, qué pruebas se ejecutaron y qué escenarios quedan cubiertos o pendientes.

Después de terminar la tarea, detente y espera instrucciones. No continúes automáticamente con la siguiente.

Describe los resultados observados. No afirmes que algo está correcto si no lo has verificado.
