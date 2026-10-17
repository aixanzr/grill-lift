# Emparejamiento: mejoras

## Contexto

El MVP empareja con un solo modo, instrucciones en texto y un spinner. Estas mejoras lo hacen más fácil para alguien sin conocimientos previos.

## Qué hay que hacer

- **Pantalla de bienvenida:** "Conectá tu parrilla" → botón **Empezar**.
- **Pantalla de permisos propia:** ubicación (Android la exige para leer el nombre del WiFi) y Bluetooth si el módulo lo usa. Antes del pedido de Android, explicar en una línea para qué se usa cada permiso.
- **Modo AP como respaldo:** si el modo principal falla, ofrecer el modo AP con instrucciones (conectar el teléfono a la red WiFi que crea el módulo).
- **Instrucciones con imagen o animación** en "Preparar el dispositivo" (cómo resetear el módulo y cómo se ve la luz parpadeando).
- **Progreso por pasos** en vez del spinner: "Buscando dispositivo…", "Registrando…". El SDK informa los pasos (`onStep`), pero la librería hoy los ignora en Android: hay que parchearla (`patch-package` o fork) para que los emita a JS.
- **Aviso de redes con portal cautivo** (hoteles, oficinas) en el paso de WiFi.

## Dónde

- `src/tuya/client.ts`: modo AP (`initActivator` con `ActivatorType.AP`).
- Parche a la librería para emitir `onStep`.
- `src/screens/`: `Welcome`, `Permissions`, y cambios en `PrepareDevice` y `Pairing`.

## Criterios de aceptación

- Si falla el modo principal, la app ofrece el modo AP y con él se puede emparejar.
- El usuario ve en qué paso está el emparejamiento.
- Si un permiso se niega, la app explica por qué lo necesita y cómo darlo desde Ajustes de Android.

## Tests

- **En la parrilla real:** emparejar en modo AP, y negar los permisos para ver los mensajes.
