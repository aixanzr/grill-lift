# Mostrar el estado real del dispositivo

## Contexto

En la versión básica, la pantalla muestra el estado según los comandos que mandó la propia app. El control remoto RF sigue funcionando, así que si alguien lo usa, la app no se entera y muestra un estado viejo.

## Qué hay que hacer

- Usar `registerDevListener({ devId })` y `addEvent('onDpUpdate', ...)` de la librería. Cada vez que cambian `switch_1` o `switch_2` (desde la app, el control remoto o un timer del dispositivo), llega el evento `onDpUpdate`.
- Al abrir la app o reconectar, leer el estado inicial con `getDeviceData` o `getDp` de la librería, que traen los DPs actuales.
- `grillController` deriva el estado (DETENIDA / SUBIENDO / BAJANDO) de los DPs reportados, no de lo que la app supone:
  - `switch_1=on` → SUBIENDO
  - `switch_2=on` → BAJANDO
  - los dos apagados → DETENIDA
- Cuando la app manda un comando, la UI puede mostrar el cambio enseguida (optimista), pero el evento del dispositivo manda.
- Quitar el listener (`unRegisterAllDevListeners`) cuando la pantalla se desmonta o la app pasa a segundo plano.

## Dónde

- `src/tuya/client.ts`: suscripción al listener de la librería.
- `src/domain/grillController.ts`: mapeo de DPs a estado.
- `src/hooks/useGrill.ts`: suscripción.

## Relación con otros tickets

- **ENCLAVAMIENTO.md:** la regla "si llegan los dos encendidos, apagar todo" y la espera de confirmación del OFF necesitan estos eventos. Este ticket va antes, o se hace junto.
- **AUTO_APAGADO.md:** si el apagado lo hace la cuenta regresiva del dispositivo, la pantalla solo se entera de que volvió a "Detenida" con estos eventos. Sin ellos, hay que usar un temporizador en la app.

## Criterios de aceptación

- Al usar el control remoto con la app abierta, la pantalla se actualiza en uno o dos segundos.
- Al abrir la app con el motor andando, se muestra el estado correcto.
- Si un comando de la app falla pero el dispositivo reporta otro estado, la pantalla muestra lo que reporta el dispositivo.

## Tests

- **Unitarios (Jest):** mapeo de DPs a estado, y cambios externos (por ejemplo, de DETENIDA a SUBIENDO sin que la app toque nada).
- **En la parrilla real:** usar el control remoto y ver que la app se actualiza sola.
