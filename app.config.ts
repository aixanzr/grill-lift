import { existsSync } from 'fs';
import { ConfigContext, ExpoConfig } from 'expo/config';

// Tuya credentials come from .env (never committed). See PLAN.md §5 "Secretos".
const TUYA_AAR_PATH = './tuya/security-algorithm.aar';
const tuyaAppKey = process.env.TUYA_APP_KEY ?? '';
const tuyaAppSecret = process.env.TUYA_APP_SECRET ?? '';

if (!tuyaAppKey || !tuyaAppSecret || !existsSync(TUYA_AAR_PATH)) {
  console.warn(
    `[grill-lift] Missing Tuya credentials: set TUYA_APP_KEY and TUYA_APP_SECRET in .env and put the security component at ${TUYA_AAR_PATH}. The app will build but the Tuya SDK will not work.`
  );
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Grill Lift',
  slug: 'grill-lift',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  android: {
    package: 'com.aixanzr.grilllift',
    adaptiveIcon: {
      backgroundColor: '#1C1917',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-secure-store',
    [
      '@owowagency/react-native-tuya',
      {
        androidAppKey: tuyaAppKey,
        androidSecretKey: tuyaAppSecret,
        androidAarPath: TUYA_AAR_PATH,
      },
    ],
    './plugins/withGradleFixes.js',
  ],
});
