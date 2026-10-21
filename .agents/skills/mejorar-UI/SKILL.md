---
name: mejorar-ui
description: Úsala cuando se pida elevar el diseño visual de una pantalla de la aplicación Pomodoro a nivel de producción (jerarquía, tarjetas, iconos, diálogos, estados de carga y layout), manteniendo la identidad de cotopaxi-brand.
---

# Skill: Mejorar UI

Complementa `cotopaxi-brand`: esa skill fija la paleta (`#181759`, `#C69214`, `#FFFFFF`) y Claymorphism; esta define los patrones para llevar una pantalla a nivel de producción. Si hay conflicto, manda `cotopaxi-brand`.

No cambia lógica del dominio, persistencia, notificaciones ni textos funcionales aprobados en las HU.

## 1. Jerarquía visual y tipografía

- Tres niveles: título (Bold 700), subtítulo (Medium/SemiBold 600) y texto secundario (Regular 400 con opacidad 0.6–0.75 del azul marino o del blanco).
- El contraste se logra con peso, tamaño y opacidad, no con colores nuevos.
- Dorado solo para iconos, indicadores y acentos; el texto pequeño sobre blanco va en azul marino.
- Retícula de espaciado de 8 px: 8, 16, 24, 32 (usar `Spacing` de `src/constants/theme.ts`).

## 2. Componentes y elevación

- Tarjetas blancas con esquinas redondeadas (`Radii`) y sombras neutras de `Shadows`. Sin bordes duros.
- Glassmorphism sutil solo sobre fondo azul marino: `rgba(255,255,255,0.12)` con borde `rgba(255,255,255,0.18)`. Es el blanco de la paleta con transparencia.
- Una o dos capas de elevación por pantalla; no sombrear todo.

## 3. Controles e interacción

- Botones con icono + etiqueta (`BrandButton` con prop `icon`). Estado presionado: opacidad y ligera escala.
- Iconos: `Ionicons` de `@expo/vector-icons`. Azul marino sobre blanco, dorado como acento, blanco sobre azul marino. Siempre con etiqueta de accesibilidad en el control que los contiene.
- Diálogos y alertas propios con `BrandDialog` (icono en círculo, título, mensaje, acciones). No usar `Alert.alert` para confirmaciones visibles al usuario.
- Estados de carga con `Skeleton` (pulso de opacidad), nunca un indicador plano.
- Objetivos táctiles de al menos 44x44.

## 4. Layout

- `SafeAreaView` + `ScrollView` para que nada quede apretado en pantallas pequeñas.
- Cabecera con saludo según la hora y subtítulo breve.
- Tarjeta principal (hero) con la información clave; tarjetas secundarias para resumen y avisos.
- Márgenes laterales de 24 px.

## Procedimiento

1. Leer la pantalla y los componentes existentes (`src/components/`, `src/constants/theme.ts`).
2. Reutilizar `BrandButton`, `BrandDialog`, `Skeleton` y los tokens antes de crear algo nuevo.
3. Conservar todas las etiquetas de accesibilidad y textos definidos por las HU.
4. Ejecutar `npx tsc --noEmit` y `npx jest`.
5. Informar qué se comprobó y qué requiere revisión manual en el dispositivo.

## Límites

- No añadir colores fuera de la paleta ni gradientes multicolor.
- No instalar dependencias sin autorización (solo `@expo/vector-icons` está aprobada para iconos).
- No añadir funcionalidades ni pantallas no contempladas en las HU.


