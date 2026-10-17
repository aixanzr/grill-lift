# Pantalla de control: mejoras

## Contexto

En el MVP, la pantalla de control solo tiene los dos botones y el estado en texto. Si la parrilla está sin conexión, la app recién se entera cuando falla un comando.

## Qué hay que hacer

- **Indicador "● En línea / Sin conexión"** en la parte de arriba.
  - Se usa el evento `onStatusChanged` del listener de dispositivo de la librería (`registerDevListener`).
  - Sin conexión, los botones se deshabilitan y aparece el mensaje "La parrilla no está conectada".
  - Al reconectar, se habilitan solos.
- **Dispositivo eliminado:** el evento `onRemoved` del mismo listener (por ejemplo, si se resetea el módulo o se empareja en otra cuenta) lleva de vuelta al emparejamiento.
- **Vibración** al tocar un botón.
- **Animación** del botón activo mientras el motor anda.

## Dónde

- `src/tuya/client.ts`: eventos `onStatusChanged` y `onRemoved`.
- `src/hooks/useGrill.ts` y `src/screens/Control`.

## Criterios de aceptación

- Al desenchufar el módulo, la app lo muestra sin conexión en pocos segundos y deshabilita los botones.
- Al volver a enchufarlo, se habilitan solos.
- Al resetear el módulo, la app vuelve a la pantalla de emparejamiento.

## Tests

- **En la parrilla real:** desenchufar y enchufar el módulo, cortar el WiFi del teléfono y resetear el módulo.
