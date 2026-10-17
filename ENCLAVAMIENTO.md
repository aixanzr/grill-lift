# Enclavamiento de relés (seguridad)

## Contexto

El DOMO-18-2G maneja el motor con dos interruptores independientes: `switch_1` sube y `switch_2` baja. Si los dos relés quedan encendidos a la vez, el motor recibe órdenes opuestas al mismo tiempo. La app tiene que evitarlo siempre.

## Ya hecho en el MVP

Al cambiar de sentido, la app manda el OFF y **espera a que el SDK confirme el envío** antes de mandar el ON. Si el OFF falla, no se manda el ON (ver `PLAN.md` §4.1).

Esto confirma que el comando salió, pero no que el relé del dispositivo efectivamente se apagó.

## Qué falta hacer

- **Esperar la confirmación del dispositivo, no solo la del envío.** Antes de encender un canal, la app espera a que el dispositivo reporte que el otro está en OFF (o a que pase un timeout corto). Requiere `ESTADO_REAL.md`.
- **Pausa de unos 300–500 ms** entre el OFF y el ON. También protege al motor cuando cambia de sentido.
- **Desde DETENIDA,** antes de encender un canal, asegurarse de que el otro esté apagado. Por ejemplo, si el control remoto dejó uno encendido sin que la app se entere.
- **Los dos encendidos:** si el dispositivo informa que los dos canales están encendidos (por cualquier motivo), la app manda **apagar todo** de inmediato. Requiere `ESTADO_REAL.md`.
- **Toques repetidos:** mientras un cambio está en curso, la app ignora los toques, para evitar condiciones de carrera.
- **Enclavamiento propio del hardware:** verificar si el DOMO o el control remoto ya traen uno. Aunque lo traigan, la app aplica el suyo.

## Dónde

`src/domain/grillController.ts`, que es la máquina de estados.

## Depende de

`ESTADO_REAL.md`, para la confirmación del dispositivo y la detección de "los dos encendidos".

## Criterios de aceptación

- Nunca se envía un ON mientras el dispositivo no reportó el otro canal en OFF.
- Cuando cambia de sentido (Subiendo → Bajar, Bajando → Subir), el orden es OFF → confirmación del dispositivo → pausa → ON.
- Cuando el dispositivo reporta los dos canales encendidos, la app manda OFF a ambos.
- Los toques que llegan durante una transición no generan comandos extra.

## Tests

- **Unitarios (Jest)** en `grillController`:
  - Orden OFF → confirmación → pausa → ON.
  - Timeout si el dispositivo no confirma el OFF.
  - Reacción ante "los dos encendidos".
  - Toques repetidos ignorados.
- **En la parrilla real:** cambiar de sentido varias veces seguidas y comprobar que el motor nunca recibe dos órdenes a la vez.
