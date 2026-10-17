# Grill Lift

App Android para subir y bajar la parrilla con el módulo DEMASLED DOMO-18-2G (Tuya). El plan está en [`PLAN.md`](PLAN.md); lo que quedó para después, en los otros `.md` de la raíz.

## Requisitos

- Node 22 (`nvm use`, el repo tiene `.nvmrc`)
- JDK 17 y Android SDK (`JAVA_HOME` y `ANDROID_HOME` configurados)
- Un teléfono Android ARM con depuración USB. En WSL hace falta [`usbipd-win`](https://github.com/dorssel/usbipd-win) para que `adb` lo vea.

## Credenciales de Tuya (no se suben al repo)

1. `.env` en la raíz, a partir de `.env.example`, con `TUYA_APP_KEY` y `TUYA_APP_SECRET` (Tuya Developer Platform → App → SDK Development → Grill Lift → Get Key → Android).
2. `tuya/security-algorithm.aar`: el componente de seguridad que se descarga desde Get SDK → Download SDK Android (viene dentro de `security-algorithm.tar.gz`).

El paquete Android (`com.aixanzr.grilllift`) y el SHA-256 del keystore de debug ya están registrados en Tuya.

## Comandos

```bash
npm install            # aplica también el parche de patches/ (patch-package)
npm run prebuild       # genera android/ (no se versiona)
npm run android        # compila e instala en el teléfono conectado
npm start              # Metro para el development build

npm test               # tests de la máquina de estados
npm run lint
npm run typecheck
```

Para compilar solo el APK sin teléfono:

```bash
cd android
taskset -c 0-3 ./gradlew assembleRelease --max-workers=2 \
  -PreactNativeArchitectures=arm64-v8a \
  -Pkotlin.compiler.execution.strategy=in-process
# → android/app/build/outputs/apk/release/app-release.apk
```

- `assembleRelease` incluye el JavaScript en el APK, así que se puede instalar pasando el archivo al teléfono, sin PC ni Metro. Está firmado con el keystore de debug, que es el que está registrado en Tuya.
- `assembleDebug` necesita Metro corriendo (`npm start`) para cargar la app.
- `taskset`, `--max-workers` y Kotlin `in-process` evitan que la compilación se quede sin memoria en una máquina con 8 GB.

## Configuración del dispositivo

`src/config.ts` tiene los valores que hay que confirmar con la parrilla real: qué canal sube (`GRILL_CHANNELS`) y el modo de emparejamiento (`PAIRING_MODE`, EZ o BLE).
