# Plan: Grill Lift — app Android para subir/bajar la parrilla

## Estado (17/10/2026)

**Hecho:**
- **Tuya:** cuenta creada con aixanzr@gmail.com.
- **App SDK "Grill Lift" en Tuya** (id 219071882):
  - Edición de desarrollo: gratis, hasta 100 usuarios, no se puede publicar en tiendas.
  - Región: fuera de China continental.
  - Paquete `com.aixanzr.grilllift`, con el SHA-256 del keystore de debug registrado.
  - Las claves están en `.env` y el componente de seguridad en `tuya/security-algorithm.aar`. Ninguno de los dos se sube al repo.
- **Etapas 2 a 5:**
  - Proyecto Expo.
  - Sesión y hogar.
  - Emparejamiento EZ.
  - Máquina de estados con tests.
  - Pantalla de control.
- **Herramientas:** Node 22 (nvm), JDK 17 en `~/.local/jdk-17` y Android SDK en `~/Android/Sdk` (variables en `~/.bashrc`).

**Pendiente (necesita la parrilla o el teléfono):**
- Etapa 1: confirmar qué canal sube, si el módulo es EZ o BLE y cómo se resetea. Los valores por defecto están en `src/config.ts`.
- Etapa 6: instalar el APK en el teléfono. El APK de release ya está compilado y copiado a `Descargas\grill-lift-mvp.apk` en Windows. Trae el JavaScript adentro, así que alcanza con pasarlo al teléfono e instalarlo. `usbipd-win` solo hace falta para desarrollar con Metro.
- Etapa 7: las pruebas en la parrilla real (§8).

**A tener en cuenta en la primera prueba:**
- El portal de Tuya generó el SDK 7.8.0, pero la librería usa la 7.5.1. Si al arrancar aparece "illegal client" o "Permission verification failed", lo primero a probar es forzar `com.thingclips.smart:thingsmart:7.8.0`.
- La edición de prueba de Tuya muestra un aviso (Toast) al abrir la app y puede pedir el permiso de ubicación al inicio. Es esperable.

## 1. Contexto

La parrilla ya tiene un motor conectado a un módulo **DEMASLED DOMO-18-2G**, que funciona bien con **Smart Life** y con el **control remoto**. Smart Life es genérica y confusa para un usuario común, así que queremos una app Android propia, en **React Native**, que haga solo dos cosas:

1. **Emparejar** el dispositivo de forma guiada, sin conocimientos previos.
2. **Controlar** la parrilla con dos botones: **SUBIR** y **BAJAR**.

Restricciones: sin manejo de usuarios visible, sin backend propio, una sola parrilla por app.

### Lo que ya sabemos (por tus respuestas)


| Tema                     | Respuesta                          | Qué implica                                                                                                                                     |
| ------------------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Cómo se ve en Smart Life | **2 interruptores** independientes | La app maneja dos canales: `switch_1` y `switch_2`. Uno sube y el otro baja. |
| Finales de carrera       | **Sí tiene**                       | El motor se corta solo arriba y abajo. Con eso es suficiente.                                                                                   |
| Cantidad de parrillas    | **Una sola**                       | Después de emparejar, la app abre directo en la pantalla de control.                                                                            |
| Conexión                 | **SDK de Tuya**                    | Ver §2.                                                                                                                                         |


---

## 2. ¿Cómo habla la app con el DOMO-18-2G?

El DOMO-18-2G es un dispositivo **Tuya** (por eso funciona con Smart Life). Cualquier app que lo empareje tiene que pasar por la plataforma de Tuya al menos una vez, porque el módulo se registra en la nube de Tuya y de ahí salen sus claves.

### SDK oficial de Tuya para apps (Smart Life App SDK / "Thing SDK")

- **Cómo funciona:** la app trae el SDK de Tuya para Android. El SDK empareja el dispositivo por WiFi (modo EZ o AP, y BLE si el módulo es combo) y después lo controla por la nube de Tuya o por la red local cuando el teléfono está en el mismo WiFi.
- **"Sin usuarios":** la primera vez que se abre, la app genera un ID y una contraseña aleatorios, los guarda en el teléfono y hace login con ese ID (`loginOrRegisterWithUid`). El usuario nunca ve un login.
- **"Sin backend":** no hay servidor propio. Se usa la nube de Tuya, la misma que ya usa Smart Life.
- **Lo que necesitás:**
  - Crear una cuenta gratuita de desarrollador en **platform.tuya.com**.
  - Registrar la app con su *package name* y la huella SHA-256 del certificado de firma.
  - Descargar el `security-algorithm.aar` que genera Tuya para esa app.
- **Costo:** es gratis para desarrollo y pruebas. Para publicar o distribuir a otros usuarios, Tuya cobra una licencia. **Hay que verificar los precios vigentes antes de distribuir.**
- **Puente a React Native:** Tuya no tiene un paquete oficial para apps en React Native. Usamos la librería de la comunidad **[`@owowagency/react-native-tuya`](https://github.com/owowagency/react-native-tuya)**:
  - Está activa (v2.0.3, septiembre de 2026) y funciona con la nueva arquitectura de React Native.
  - Usa el SDK actual de Tuya (`com.thingclips.smart:thingsmart:7.5.1`).
  - Trae un **plugin de Expo** que configura solo los repositorios de Tuya, el `.aar`, los permisos y la inicialización del SDK.
  - Casi no tiene documentación: la referencia es su código fuente (`src/*.ts`).

> ⚠️ **Importante:** un dispositivo Tuya pertenece a **una sola cuenta a la vez**. Cuando se empareja con la nueva app, **deja de aparecer en Smart Life**. El control remoto RF sigue funcionando igual, porque no depende de la app.

---

## 3. Experiencia de usuario (MVP)

### 3.1 Primer uso (emparejamiento)

1. **Preparar el dispositivo:** instrucciones en texto.
   - "Si estaba en Smart Life, eliminalo de ahí primero."
   - "Mantené presionado el botón del módulo hasta que la luz parpadee rápido." *(El procedimiento exacto del DOMO-18-2G está por confirmar.)*
2. **WiFi:** el nombre de la red se completa solo y el usuario escribe la contraseña. Aviso: **solo redes de 2.4 GHz**. En este paso la app pide los permisos con el diálogo estándar de Android (`PermissionsAndroid`): ubicación, y Bluetooth si hace falta. Si no se puede leer el nombre de la red, el usuario lo escribe a mano.
3. **Conectando…:** un spinner mientras empareja, en **un solo modo** (el que corresponda según la etapa 1: EZ, o BLE si el módulo es combo). Si falla, se muestra un error y el botón "Reintentar".
4. **¡Listo!** Se guarda el dispositivo y se pasa a la pantalla de control.

### 3.2 Pantalla de control (uso diario)

```
┌──────────────────────────┐
│       Mi parrilla        │
│                          │
│   ┌──────────────────┐   │
│   │      ▲ SUBIR      │   │  ← resaltado mientras sube
│   └──────────────────┘   │
│                          │
│        Subiendo…         │  ← estado en texto grande
│                          │
│   ┌──────────────────┐   │
│   │      ▼ BAJAR      │   │
│   └──────────────────┘   │
└──────────────────────────┘
```

- Botones grandes. El botón que está activo se ve resaltado.
- La pantalla muestra el estado según los comandos que mandó la app. Un comando se da por aplicado cuando el SDK confirma que se envió bien. Si falla (por ejemplo, porque la parrilla está sin conexión), la pantalla vuelve al estado anterior y muestra un aviso.
- Para volver a emparejar, se borran los datos de la app desde Ajustes de Android.

---

## 4. Lógica de control

### 4.1 Máquina de estados

Hay tres estados: **DETENIDA**, **SUBIENDO** y **BAJANDO**. El canal de cada sentido queda fijo en el código (por defecto, `switch_1` sube y `switch_2` baja; se confirma en la etapa 1).


| Estado actual | Botón | Nuevo estado | Comandos al dispositivo                  |
| ------------- | ----- | ------------ | ---------------------------------------- |
| DETENIDA      | SUBIR | SUBIENDO     | `switch_1=on`                            |
| DETENIDA      | BAJAR | BAJANDO      | `switch_2=on`                            |
| SUBIENDO      | SUBIR | DETENIDA     | `switch_1=off`                           |
| SUBIENDO      | BAJAR | BAJANDO      | `switch_1=off` → `switch_2=on`           |
| BAJANDO       | BAJAR | DETENIDA     | `switch_2=off`                           |
| BAJANDO       | SUBIR | SUBIENDO     | `switch_2=off` → `switch_1=on`           |


No hay que mantener el botón presionado: **un toque cambia el estado**.

Cuando cambia de sentido, la app manda el OFF y **espera a que el SDK confirme el envío** antes de mandar el ON. Si el OFF falla, no se manda el ON. Así nunca se piden los dos relés encendidos a la vez. El enclavamiento completo está en `ENCLAVAMIENTO.md`.

---

## 5. Arquitectura técnica

- **Expo con development build, TypeScript, solo Android.**
  - Expo Go no sirve, porque no puede cargar el SDK de Tuya.
  - La carpeta `android/` la genera `npx expo prebuild` a partir de `app.config.ts` y del plugin de la librería. **No se sube a git.**
- **Tuya:** `@owowagency/react-native-tuya` y su plugin de Expo. No hay código nativo propio.
- **Navegación:** sin librería. Un `useState` en `App.tsx` decide qué pantalla mostrar.
- **Persistencia local:**
  - `expo-secure-store` para el UID y la contraseña de la cuenta Tuya.
  - AsyncStorage para el `devId`.
  - No hay backend.
- **Idioma UI:** español.
- Idioma código: 100% inglés, incluidos los code comments

### Estructura propuesta

```
app.config.ts                  # config de Expo + plugin de Tuya (AppKey/Secret desde variables de entorno)
tuya/security-algorithm.aar    # generado por Tuya (no se sube al repo)
patches/                       # correcciones a la librería (patch-package, §5.2)
plugins/withGradleFixes.js     # config plugin: android.uniquePackageNames=false (§5.2)
src/
  App.tsx                      # elige la pantalla según haya o no dispositivo guardado
  tuya/client.ts               # capa fina sobre la librería: sesión, hogar, emparejar, enviar comandos
  domain/grillController.ts    # máquina de estados (TS puro, testeable)
  hooks/useGrill.ts            # estado de la parrilla para la UI
  screens/PrepareDevice, WifiCredentials, Pairing, Control
  storage/device.ts, storage/account.ts
__tests__/grillController.test.ts
```

`src/tuya/client.ts` es la única parte de la app que importa la librería. Si algún día hay que cambiarla o parchearla, se toca solo ese archivo.

### Funciones de la librería que usa el MVP

| Para qué | Función |
|---|---|
| Sesión invisible | `loginOrRegisterWithUid({ countryCode, uid, password })` y `getCurrentUser()`, llamadas directo a `NativeModules.TuyaUserModule` (ver §5.1) |
| Hogar | `queryHomeList()`, `createHome({ name, lon, lat, geoName, rooms })`, `getHomeDetail({ homeId })` |
| Nombre del WiFi | `getCurrentWifi(...)` |
| Emparejar | `initActivator({ homeId, ssid, password, time, type: ActivatorType.EZ })`, o `initBluetoothDualModeActivator(...)` si el módulo es WiFi+BLE; `stopConfig()` |
| Comandos | `send({ devId, command: { "1": true } })`. La promesa se resuelve cuando el SDK confirma el envío (ver §4.1). |

### 5.1 Detalles verificados en el código de la librería

- **Login por UID:** `loginOrRegisterWithUid` existe en el módulo nativo pero el paquete no lo exporta. Se llama con `NativeModules.TuyaUserModule.loginOrRegisterWithUid(...)`. Lo mismo con `getCurrentUser`: el wrapper del paquete devuelve `null` si el usuario no tiene email, y las cuentas por UID no lo tienen.
- **Parámetros obligatorios:** si a una función le falta un parámetro, la librería lanza una excepción en lugar de rechazar la promesa, y la app se cierra. Por ejemplo, `createHome` necesita `name`, `lon`, `lat`, `geoName` y `rooms` aunque sean valores vacíos o cero. `src/tuya/client.ts` siempre los pasa completos.
- **Cargar el hogar al arrancar:** en cada inicio, después del login, llamar a `getHomeDetail({ homeId })`, para que el SDK tenga el dispositivo en memoria antes de mandarle comandos.
- **Nombre del WiFi:** `getCurrentWifi` necesita el permiso de ubicación concedido y la ubicación del teléfono activada. Si no, devuelve un valor vacío o `<unknown ssid>`.
- **Emparejamiento BLE** (solo si el módulo es WiFi+BLE): la librería no tiene timeout ni se puede cancelar con `stopConfig()`, así que la app pone su propio timeout. En Android 12 o más nuevo hay que pedir `BLUETOOTH_SCAN` y `BLUETOOTH_CONNECT`.
- **Solo ARM:** la librería compila el SDK de Tuya solo para teléfonos ARM (`armeabi-v7a` y `arm64-v8a`). En el emulador de Android de la PC no corre: se prueba en el teléfono.

### 5.2 Compatibilidad verificada (prueba de compilación)

Se armó un proyecto de prueba con Expo SDK 58 (React Native 0.88, Android Gradle Plugin 9.2.1) y `@owowagency/react-native-tuya@2.0.3`, con el plugin y un `.aar` falso. **El APK de debug compila** y el bundle de JavaScript se arma. Para lograrlo hicieron falta 3 correcciones:

1. **`proguard-android.txt`:** Android Gradle Plugin 9 ya no lo acepta. Se cambia por `proguard-android-optimize.txt` en el `build.gradle` de la librería.
2. **`currentActivity`:** en React Native 0.88 pasó a ser una función (`getCurrentActivity()`). Es una línea en `TuyaActivatorModule.kt`.
3. **Namespaces duplicados:** varios módulos del SDK de Tuya usan el mismo namespace y Android Gradle Plugin 9 corta la compilación. Se resuelve con `android.uniquePackageNames=false` en `android/gradle.properties`.

Las correcciones 1 y 2 ya están en `patches/@owowagency+react-native-tuya+2.0.3.patch`. Se aplican solas con `patch-package` en `postinstall`. La 3 va en un config plugin local (`plugins/withGradleFixes.js`, con `withGradleProperties`), porque `android/` se regenera.

Al compilar el proyecto real aparecieron dos más, que también resuelve `plugins/withGradleFixes.js`:

4. **R8 en release:** Expo 58 activa la minificación en release, y R8 falla con el SDK de Tuya porque le faltan reglas de ProGuard. Se desactiva con `android.enableMinifyInReleaseBuilds=false`. Las reglas quedan para `PULIDO.md`.
5. **Arquitecturas:** el SDK de Tuya solo trae binarios ARM, así que se compila solo `armeabi-v7a` y `arm64-v8a` (`reactNativeArchitectures`).

**Lo que no se pudo verificar sin tu cuenta de Tuya y la parrilla:** que el SDK arranque con el `.aar` real, el login por UID, el emparejamiento y los comandos. Eso queda para las etapas 1 y 7.

### Secretos

- `TUYA_APP_KEY` y `TUYA_APP_SECRET` van en un `.env` local, fuera de git.
- `app.config.ts` los lee y se los pasa al plugin (`androidAppKey`, `androidSecretKey`, `androidAarPath`).
- Al `.gitignore` se agregan `.env`, `android/` y el `.aar`.

---

## 6. Etapas de trabajo

1. **Prerrequisitos y descubrimiento** (con vos):
   - Entorno: **Node 22 o más nuevo** (Expo 58 no funciona con Node 18), **JDK 17** y **Android SDK** (alcanza con las command-line tools; Gradle baja el resto).
   - Teléfono en WSL: WSL está en modo de red NAT y no ve el USB. Instalar [`usbipd-win`](https://github.com/dorssel/usbipd-win) en Windows y conectar el teléfono a WSL (`usbipd attach --wsl`). Así `adb` lo ve y `adb reverse` le da acceso a Metro.
   - Crear la cuenta en Tuya IoT Platform y registrar la app SDK (package name, por ejemplo `com.grilllift`, y SHA-256 del keystore de debug que genera Expo).
   - Descargar el `.aar`.
   - Confirmar que la app de Tuya acepta login con UID.
   - Confirmar los DPs reales del DOMO-18-2G (ids de `switch_1/2` y qué canal sube), si es WiFi o WiFi+BLE y el procedimiento de reset.
2. **Esqueleto del proyecto:** Expo (template TypeScript), `expo-dev-client`, ESLint, Prettier y Jest. Instalar la librería, `patch-package` (con el parche de `patches/`), el plugin de Tuya y `plugins/withGradleFixes.js`, y correr `npx expo prebuild`.
3. **Sesión y hogar:** `src/tuya/client.ts` con login por UID, creación del hogar y `getHomeDetail` al arrancar (§5.1).
4. **Emparejamiento:** un solo modo, con las pantallas de §3.1.
5. **Control:** `grillController` con tests y pantalla de control.
6. **APK de debug** instalado por USB en el teléfono (`npx expo run:android`).
7. **Pruebas en la parrilla real** (ver §8).

---

## 7. Riesgos y puntos a verificar


| Riesgo                                                                                   | Mitigación                                                                        |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| El dispositivo deja Smart Life al emparejarse con la app                                 | Avisar en el paso "Preparar el dispositivo". El control remoto sigue funcionando. |
| La licencia de Tuya tiene costo para producción                                          | Confirmar precios antes de distribuir. Desarrollar y probar es gratis.            |
| La cuenta por UID queda atada al teléfono: si se desinstala la app o se borran sus datos, se pierde el vínculo | Re-emparejar (reset del módulo y repetir el asistente).                           |
| La librería es de la comunidad y la mantiene una sola agencia | Toda la app la usa a través de `src/tuya/client.ts`. Si algo falla, se corrige con `patch-package` o con un fork. |
| El plugin de Expo falla en alguna versión | Se puede generar `android/` una vez y seguir como proyecto bare. |
| Un segundo teléfono no puede controlar la misma parrilla                                 | Fuera de alcance en v1. En el futuro se podría compartir el dispositivo.          |
| WiFi de 5 GHz o redes con portal cautivo                                                 | Aviso claro en el paso de WiFi.                                                   |
| Canales cableados al revés                                                               | Se confirma en la etapa 1 y se fija en el código.                                 |


---

## 8. Verificación

- **Tests unitarios (Jest)** de `grillController`:
  - Todas las transiciones de la tabla de §4.1.
  - Al cambiar de sentido, el ON se manda solo después de que el OFF se confirmó.
- **Checklist en la parrilla real:**
  - Emparejar desde cero.
  - Subir y parar.
  - Bajar y parar.
  - Subiendo → tocar Bajar, y Bajando → tocar Subir.
  - Cortar el WiFi del teléfono y ver el aviso de error.
  - Desenchufar el módulo y ver el aviso de error.
  - Cerrar la app con el motor andando.

## 9. Fuera de alcance (MVP)

Tickets para después, cada uno en su `.md` en la raíz:
- `ENCLAVAMIENTO.md`
- `AUTO_APAGADO.md`
- `ESTADO_REAL.md`
- `EMPAREJAMIENTO_EXTRA.md`
- `CONTROL_EXTRA.md`
- `AJUSTES.md`
- `HERRAMIENTAS_DEV.md`
- `PULIDO.md`

Otras ideas: iOS, varias parrillas, altura en % o posiciones memorizadas, widgets, compartir con otros teléfonos.
