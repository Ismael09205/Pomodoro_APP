---
name: rn-conventions
description: Úsala siempre que crees o modifiques pantallas, formularios o componentes de interfaz de la aplicación Pomodoro para estudiantes.
---

# Convenciones de interfaz en React Native

- Estilos con StyleSheet. Sin librerías de interfaz adicionales.
- Evitar diseños genéricos.
- Campos de ajustes (duraciones y cantidad de pomodoros): teclado numérico (`keyboardType="number-pad"`). Los valores y rangos válidos los define la HU-005, no esta skill.
- Los formularios no deben quedar tapados por el teclado. Usa un contenedor que se desplace o ajuste, y permite tocar botones con el teclado abierto.
- Respeta las áreas seguras del dispositivo (muesca y barras del sistema).
- Listas con FlatList y una clave estable por elemento, nunca el índice.
- Objetivos táctiles de al menos 44x44 puntos. Etiquetas de accesibilidad en botones e iconos.
- Eliminar siempre pide confirmación con un diálogo del sistema.
- Todos los textos visibles en español.

## Lista manual de verificación en Expo Go
- [ ] Se ve bien en vertical (la app está fijada a orientación retrato en `app.json`).
- [ ] El teclado no tapa el campo ni el botón que se está usando.
- [ ] El cambio de ajuste se valida, se guarda y se aplica como define la HU-005.
- [ ] Cerrar la app por completo y abrirla conserva los datos.
- [ ] Los textos de estado se leen sin depender del color.