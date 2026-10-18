---
name: cotopaxi-brand
description: Utiliza esta skill al diseñar, crear, modificar o revisar la interfaz visual de la aplicación Pomodoro para estudiantes. Define la paleta de colores institucional, el uso de Claymorphism, la consistencia visual y las buenas prácticas de interfaz en Expo y React Native.
---

# Skill: Cotopaxi Brand

## Objetivo

Mantener una interfaz visual coherente, moderna, accesible y agradable para la aplicación Pomodoro para estudiantes, utilizando exclusivamente la paleta de colores definida y aplicando Claymorphism cuando sea apropiado.

Esta skill establece criterios visuales y técnicos de interfaz. No define la lógica funcional del Pomodoro, no sustituye las historias de usuario y no autoriza cambios en los requisitos del producto.

## Contexto del proyecto

- Aplicación móvil desarrollada con Expo, React Native, TypeScript y Expo Router.
- Las pantallas y la navegación se encuentran en `app/`.
- La lógica de dominio se encuentra en `src/domain/`.
- La persistencia local se encuentra en `src/storage/`.
- La interfaz debe respetar las historias de usuario, las especificaciones aprobadas y la constitución del proyecto.
- Los textos visibles de la interfaz deben estar en español, salvo nombres propios o términos que deban conservarse en otro idioma.

Antes de modificar una pantalla, revisar la estructura existente, los componentes reutilizables, los estilos actuales y las instrucciones del proyecto.

## Paleta cromática obligatoria

La interfaz debe utilizar los siguientes colores como paleta principal:

| Nombre | Código | Uso principal |
|---|---|---|
| Azul marino | `#181759` | Texto principal, contornos, montañas, marcos de puntos e iconografía principal. |
| Dorado oscuro | `#C69214` | Rayos del sol, acentos visuales, elementos destacados e indicadores que necesiten énfasis. |
| Blanco | `#FFFFFF` | Fondo principal, superficies claras y texto sobre fondos oscuros, cuando exista contraste suficiente. |

### Reglas de aplicación del color

- No sustituir estos colores por otros tonos de azul, amarillo o dorado.
- No introducir colores decorativos adicionales en gradientes, fondos, ilustraciones o componentes.
- Los estados de interacción pueden expresarse mediante cambios de elevación, opacidad, borde o sombra, siempre que se conserve la paleta autorizada.
- Las sombras deben ser neutras y sutiles, sin introducir tintes cromáticos que alteren la identidad visual.
- No utilizar el dorado como color de texto pequeño sobre blanco si el contraste resulta insuficiente.
- El azul marino debe priorizarse para textos que necesiten máxima legibilidad sobre superficies blancas.
- El blanco puede utilizarse para texto sobre azul marino cuando el contraste sea suficiente.
- El dorado debe emplearse con criterio para conservar su función de acento y evitar saturar la interfaz.

No asumir que todos los elementos deben mostrar los tres colores simultáneamente. Distribuirlos de manera equilibrada según su función visual.

## Estilo visual: Claymorphism

Aplicar Claymorphism como lenguaje visual de la interfaz cuando resulte apropiado para el componente.

Claymorphism se caracteriza por superficies suaves, redondeadas y con una apariencia ligeramente tridimensional, similar a piezas de arcilla moldeada.

### Características visuales

- Superficies redondeadas y suaves.
- Tarjetas con volumen sutil mediante sombras exteriores e interiores cuando la plataforma lo permita.
- Botones con apariencia táctil y estados visuales claros.
- Controles con profundidad moderada, sin excesos decorativos.
- Jerarquía visual clara y espacios consistentes.
- Formas suaves que mantengan una apariencia juvenil, moderna y apropiada para una aplicación estudiantil.

### Adaptación a la paleta

- Utilizar superficies blancas para tarjetas y contenedores principales.
- Utilizar el azul marino para textos, contornos e iconos importantes.
- Utilizar el dorado para acentos y elementos que deban destacar.
- Construir el efecto tridimensional principalmente con luz, sombras neutras y variaciones de elevación.
- No depender de gradientes multicolor ni de tonos adicionales para producir el efecto Claymorphism.

### Moderación del efecto

- No aplicar sombras pronunciadas a todos los elementos.
- No sacrificar legibilidad para conseguir volumen.
- Evitar que las tarjetas, botones o controles parezcan deshabilitados por el uso excesivo de sombras.
- Mantener los elementos interactivos reconocibles y sus estados comprensibles.
- Preferir profundidad sutil antes que una interfaz recargada.

Claymorphism es un recurso visual, no una obligación para cada componente. Cuando perjudique la legibilidad, la accesibilidad o la usabilidad, priorizar estas últimas.

## Aplicación en la interfaz

### Temporizador

- El tiempo restante debe tener una jerarquía visual clara.
- La fase actual debe poder identificarse fácilmente mediante los elementos definidos por las especificaciones.
- Los controles deben distinguirse visualmente de la información del temporizador.
- El volumen visual de las sombras no debe competir con la lectura del tiempo.

No decidir desde esta skill qué controles, fases o indicadores debe tener la pantalla. Estos elementos deben provenir de las HU y las especificaciones aprobadas.

### Botones y controles

- Mantener estilos coherentes entre botones equivalentes.
- Diferenciar visualmente los estados normal, presionado, deshabilitado y enfocado cuando correspondan.
- Utilizar el azul marino para los elementos principales y el dorado para destacar acciones o indicadores cuando sea apropiado.
- Asegurar áreas de interacción cómodas para pantallas táctiles.
- Conservar las etiquetas y acciones definidas por las especificaciones funcionales.

### Tarjetas y contenedores

- Utilizar superficies blancas con radios consistentes y elevación sutil.
- Evitar contenedores decorativos innecesarios.
- Mantener márgenes y espaciados uniformes.
- No utilizar tarjetas para elementos que no las necesiten.

### Iconografía e ilustraciones

- Respetar la paleta autorizada.
- Utilizar el azul marino para contornos, montañas y elementos gráficos principales.
- Utilizar el dorado para los rayos del sol y los acentos correspondientes.
- Mantener consistencia en el grosor de los contornos y el estilo de los iconos.
- No alterar ilustraciones o recursos de marca sin autorización.

## Implementación en Expo y React Native

- Utilizar componentes y APIs compatibles con las versiones de Expo y React Native instaladas.
- Inspeccionar primero los estilos y componentes existentes antes de crear otros nuevos.
- Reutilizar componentes visuales cuando esto reduzca duplicación.
- Centralizar los colores y tokens visuales para evitar valores repetidos en múltiples archivos.
- Mantener separados los estilos de la interfaz y la lógica del dominio.
- No introducir bibliotecas de componentes, motores de animación o dependencias nuevas sin autorización.
- No reemplazar la navegación ni modificar la estructura de pantallas como parte de una tarea exclusivamente visual.
- Verificar el comportamiento en distintas dimensiones de pantalla y considerar las áreas seguras del dispositivo.
- Si una técnica de sombras no funciona igual en Android e iOS, utilizar una alternativa compatible con la plataforma sin alterar la identidad visual.

### Tokens visuales

Cuando el proyecto lo permita, centralizar los valores visuales en un módulo compartido. Por ejemplo:

- `colors`: colores autorizados.
- `radii`: radios de borde reutilizables.
- `spacing`: espaciados consistentes.
- `shadows`: niveles de elevación compatibles con las plataformas.

Estos nombres son referencias conceptuales, no una autorización para crear archivos fuera del plan aprobado. Respetar la estructura existente y solicitar aprobación si se requiere modificarla.

## Accesibilidad y legibilidad

- Mantener contraste suficiente entre texto y fondo.
- No comunicar estados únicamente mediante color.
- Conservar etiquetas comprensibles para los controles interactivos.
- Considerar escalado de texto y diferentes tamaños de pantalla.
- Evitar sombras, bordes o adornos que dificulten identificar el área interactiva.
- No reducir el tamaño del texto para encajar una composición visual.
- Mantener una jerarquía tipográfica consistente.

## Límites de esta skill

- No agregar funcionalidades ni controles que no estén respaldados por las HU o las especificaciones aprobadas.
- No cambiar la lógica del temporizador para mejorar la presentación.
- No alterar las reglas de negocio, la persistencia o las notificaciones durante una tarea exclusivamente visual.
- No inventar colores adicionales ni modificar los códigos de la paleta.
- No imponer pantallas, animaciones, ilustraciones o componentes que no hayan sido solicitados o aprobados.
- No añadir dependencias sin autorización.
- No modificar archivos fuera del alcance de la tarea aprobada.
- Si una decisión visual afecta al comportamiento funcional o no está suficientemente definida, marcarla como `[NECESITA ACLARACIÓN]`.

## Procedimiento de trabajo

1. Identificar la pantalla o el componente que se debe modificar.
2. Leer las HU, la especificación y las decisiones relacionadas con esa pantalla.
3. Revisar la constitución, las instrucciones del proyecto y los componentes existentes.
4. Identificar las inconsistencias visuales respecto de esta skill.
5. Proponer el cambio visual mínimo necesario.
6. Implementar los cambios respetando la arquitectura y la paleta autorizada.
7. Comprobar legibilidad, contraste, consistencia y adaptación a pantallas.
8. Ejecutar las validaciones pertinentes, como `npx tsc --noEmit`, cuando corresponda.
9. Informar qué archivos se modificaron, qué se validó y qué requiere comprobación manual en Expo Go.

Seguir el flujo SDD del proyecto y trabajar únicamente en la fase o tarea autorizada.

## Criterio de finalización

La tarea visual se considera terminada cuando:

- Claymorphism se aplica de forma coherente y moderada cuando corresponde.
- La interfaz conserva legibilidad y usabilidad.
- No se introducen cambios funcionales no autorizados.
- Los componentes modificados mantienen consistencia con el resto de la aplicación.
- Las validaciones ejecutadas y las comprobaciones pendientes se informan con precisión.
