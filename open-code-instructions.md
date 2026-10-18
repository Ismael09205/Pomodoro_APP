# Instrucciones para OpenCode --- Aplicación Pomodoro

Aplicación móvil para estudiantes que permite gestionar sesiones de
estudio y descanso mediante la técnica Pomodoro. El estudiante puede
controlar el temporizador, alternar entre fases, recibir avisos, ajustar
las duraciones y utilizar la aplicación sin registro, conexión a
internet ni publicidad.

## Stack y estructura

-   Expo, TypeScript y Expo Router.
-   Persistencia local con `@react-native-async-storage/async-storage`.
    Sin backend ni cuentas.
-   `src/domain/`: lógica pura, sin React ni AsyncStorage.
-   `src/storage/`: persistencia local.
-   `app/`: pantallas y navegación.
-   Pruebas junto a cada módulo, en `__tests__/`.

Respeta la estructura y las dependencias que ya existan en el
repositorio. No des por hecho que una ruta o archivo existe sin
comprobarlo.

## Comandos

-   Pruebas: `npx jest`
-   Tipos: `npx tsc --noEmit`
-   Ejecutar la aplicación: `npx expo start` (solo cuando yo lo pida).

## Dónde está cada cosa

-   `docs/constitution.md`: principios del proyecto.
-   `docs/historias/`: historias de usuario en Gherkin; son la entrada
    del desarrollo.
-   `specs/NNN-nombre/`: `decisiones.md`, `spec.md`, `plan.md` y
    `tasks.md` de cada historia.
-   `MEMORY.md`: estado actual del trabajo.
-   `.github/skills/`: método SDD, reglas y convenciones del proyecto.

Comprueba la estructura real del repositorio y sigue sus archivos
existentes; no crees archivos ni directorios adicionales sin
autorización.

## Historias de usuario

Las historias de usuario originales y sus criterios de aceptación son la
fuente de verdad. No inventes reglas, comportamientos, rangos de
validación, pantallas ni requisitos que no estén definidos en ellas o en
las decisiones aprobadas.

## Cómo trabajar

1.  Al empezar, lee `MEMORY.md` y `docs/constitution.md`, y revisa las
    instrucciones y skills aplicables.
2.  Sigue el flujo SDD del proyecto: Constitución → análisis de la
    historia → Spec → plan y tareas → implementación y pruebas →
    cambios. Respeta las aprobaciones explícitas entre fases.
3.  Trata las historias de usuario como la entrada del trabajo. La spec
    define qué se necesita y por qué; el plan define cómo hacerlo; las
    tareas deben ser verificables.
4.  Haz únicamente la fase o tarea que te pida. No avances a la
    siguiente fase sin mi aprobación.
5.  Antes de implementar, inspecciona el código existente y las
    decisiones aprobadas. No reemplaces decisiones o estructuras
    existentes por preferencias propias.
6.  En la lógica, escribe primero las pruebas.
7.  Si falta una definición de producto o diseño, o hay una
    contradicción entre los requisitos, márcala como
    `[NECESITA ACLARACIÓN]` y avísame. No elijas una interpretación por
    tu cuenta.
8.  Pregunta antes de instalar dependencias, crear archivos fuera del
    plan aprobado o cambiar el formato de los datos guardados.
9.  Mantén el código y los nombres de identificadores en inglés; los
    textos de interfaz, comentarios y documentos en español.
10. No añadas backend, cuentas, publicidad ni dependencia de internet:
    la HU-006 establece que la aplicación debe funcionar sin ellos.
11. No modifiques funcionalidades ajenas a la historia o tarea
    solicitada. No guardes datos sensibles y no hagas commit.
12. Al terminar, informa brevemente qué cambió, qué pruebas ejecutaste y
    qué queda pendiente. No afirmes que una prueba pasó si no la
    ejecutaste.

## MEMORY.md

Debe contener únicamente las secciones **Estado actual** y **Próximos
pasos**. Al terminar una fase o tarea, actualiza solo esas dos
secciones. No copies decisiones ni contenido de la spec. Mantén el
archivo en unas 50 líneas.
