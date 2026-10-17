# Pantalla de Ajustes

## Contexto

El MVP no tiene Ajustes. El sentido de los canales queda fijo en el código, y para volver a emparejar hay que borrar los datos de la app desde Android.

## Qué hay que hacer

Agregar una pantalla de Ajustes (botón ⚙ en la pantalla de control) con:

- **Nombre de la parrilla**, que se muestra como título en la pantalla de control.
- **Invertir subir/bajar**, por si los canales están cableados al revés.
- **Desvincular / volver a emparejar.** Usa `removeDevice({ devId })` de la librería, borra el `devId` guardado y vuelve al emparejamiento. Explicar que, si se desinstala la app, hay que resetear el módulo y emparejar de nuevo.

Con esta pantalla hace falta guardar también el nombre y la opción de invertir (por ejemplo, en `src/storage/settings.ts`).

## Dónde

- `src/tuya/client.ts`: `removeDevice`.
- `src/screens/Settings`, `src/storage/settings.ts`.
- `src/domain/grillController.ts`: leer el mapeo de canales desde los ajustes en vez de tenerlo fijo.

## Criterios de aceptación

- El nombre y la opción de invertir se mantienen después de cerrar y abrir la app.
- Con "invertir" activo, SUBIR maneja `switch_2` y BAJAR maneja `switch_1`.
- Al desvincular, la app vuelve al emparejamiento y se puede emparejar de nuevo.

## Tests

- **Unitarios (Jest):** transiciones con el mapeo invertido.
- **En la parrilla real:** desvincular y volver a emparejar.

## Depende de

`HERRAMIENTAS_DEV.md`: con 4 o más pantallas conviene sumar React Navigation.
