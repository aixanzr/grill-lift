# Pulido y build de release

## Contexto

El MVP se instala como APK de debug por USB, con el ícono y el splash por defecto de Expo.

## Qué hay que hacer

- **Ícono** propio de la app (`icon` y `android.adaptiveIcon` en `app.config.ts`).
- **Splash** (pantalla de carga, con `expo-splash-screen`).
- **Revisión de textos:** tono, errores y mensajes claros.
- **Tema visual:** colores, tipografía y botones grandes (`src/theme/`).
- **Build de release firmado (APK/AAB):**
  - Crear el keystore de release, fuera de git. Si se compila con EAS Build, EAS genera y guarda su propio keystore.
  - Registrar el SHA-256 de ese keystore en Tuya IoT Platform y descargar el `.aar` que corresponde.
  - Si se usa EAS Build: subir el `.aar` y las claves de Tuya como secretos de EAS.
  - Configurar las reglas de ProGuard del SDK de Tuya.
- **Licencia de Tuya:** confirmar precios antes de distribuir la app a otras personas.

## Criterios de aceptación

- El APK de release se instala y funciona igual que el de debug: emparejar y controlar.
- El ícono y el splash se ven bien en distintos tamaños de pantalla.

## Tests

- Instalar el APK de release en un teléfono limpio y hacer el checklist completo de la parrilla real.
