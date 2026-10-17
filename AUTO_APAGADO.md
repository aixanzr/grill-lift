# Auto-apagado del relé

## Contexto

Gracias a los finales de carrera, el motor se detiene solo arriba y abajo. Pero el relé sigue encendido, y la app seguiría mostrando "Subiendo…" o "Bajando…" para siempre.

## Qué hay que hacer

- Verificar si el DOMO-18-2G tiene **cuenta regresiva por canal** (`countdown_1` / `countdown_2`, que es habitual en los Tuya de 2 canales).
- Si la tiene, la app la programa en cada encendido con el **tiempo máximo de recorrido**:
  - El relé se apaga solo y la pantalla vuelve a "Detenida".
  - Funciona aunque la app se cierre o el teléfono pierda la conexión, porque lo ejecuta el dispositivo.
- Si no la tiene, la app usa un temporizador propio mientras está abierta.
- Agregar en **Ajustes** la opción **Tiempo máximo de recorrido**.

## Criterios de aceptación

- Pasado el tiempo configurado, el relé queda apagado y la UI muestra "Detenida".
- Si se cambia de sentido o se detiene a mano, la cuenta regresiva anterior no apaga el canal nuevo.
- El valor elegido en Ajustes se guarda y se respeta después de reiniciar la app.

## Tests

- **Unitarios (Jest):** al encender un canal se programa la cuenta regresiva, y al cambiar de estado se cancela o reemplaza.
- **En la parrilla real:**
  - Comprobar el auto-apagado con la app abierta.
  - Comprobar el auto-apagado con la app cerrada mientras el motor anda.
