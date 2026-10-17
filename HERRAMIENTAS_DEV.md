# Herramientas de desarrollo

## Contexto

El MVP cambia de pantalla con un `useState` y se prueba directo en la parrilla. Cuando la app crezca, estas dos cosas ahorran tiempo.

## Qué hay que hacer

- **React Navigation (native-stack):** reemplazar el `useState` de `App.tsx`. Suma el botón "atrás" de Android y transiciones entre pantallas. Conviene cuando haya Bienvenida, Permisos o Ajustes.
- **Modo simulado (`src/tuya/client.mock.ts`):** un dispositivo falso con la misma API que `src/tuya/client.ts`, para probar la UI en el emulador sin la parrilla. Se activa con una variable de entorno o una opción de desarrollo.
  - Simula emparejamiento exitoso y fallido.
  - Simula comandos que funcionan y comandos que fallan.
  - Si ya están hechos `ESTADO_REAL.md` o `CONTROL_EXTRA.md`, simula también los eventos (cambios de DPs, en línea / sin conexión).

## Criterios de aceptación

- La app navega entre pantallas con React Navigation, y el botón "atrás" funciona como se espera.
- Con el modo simulado activo, se puede recorrer toda la app en el emulador sin dispositivo real.

## Tests

- Recorrer el flujo completo en el emulador con el modo simulado.
