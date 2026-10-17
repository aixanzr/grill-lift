import {
  ActivatorType,
  createHome,
  getCurrentWifi,
  getHomeDetail,
  getHomeLocalCache,
  initActivator,
  initBluetoothDualModeActivator,
  queryHomeList,
  send,
  stopConfig,
} from '@owowagency/react-native-tuya';
import { NativeModules, PermissionsAndroid, Permission } from 'react-native';

import { PAIRING_MODE, PAIRING_TIMEOUT_SECONDS, TUYA_COUNTRY_CODE } from '../config';
import { DpCommand } from '../domain/grillController';
import { loadOrCreateAccount } from '../storage/account';
import { loadHomeId, saveHomeId } from '../storage/device';

// The only module that talks to @owowagency/react-native-tuya (PLAN.md §5, §5.1).
// The library throws (and crashes the app) when a required param is missing, so every
// call below passes all of them.

const HOME_NAME = 'Casa';

// UID login is implemented natively but not exported by the package. Its JS
// getCurrentUser() also hides users without an email, which UID users never have.
const userModule = NativeModules.TuyaUserModule as {
  getCurrentUser(): Promise<object | null>;
  loginOrRegisterWithUid(params: {
    countryCode: string;
    uid: string;
    password: string;
  }): Promise<object>;
};

async function ensureSession(): Promise<void> {
  const user = await userModule.getCurrentUser();
  if (user) {
    return;
  }
  const { uid, password } = await loadOrCreateAccount();
  await userModule.loginOrRegisterWithUid({ countryCode: TUYA_COUNTRY_CODE, uid, password });
}

async function ensureHome(): Promise<number> {
  try {
    let homes = await queryHomeList();
    if (homes.length === 0) {
      await createHome({ name: HOME_NAME, geoName: '', lon: 0, lat: 0, rooms: [] });
      homes = await queryHomeList();
    }
    const homeId = homes[0].homeId;
    await saveHomeId(homeId);
    return homeId;
  } catch (error) {
    // Offline: fall back to the home we already know about.
    const storedHomeId = await loadHomeId();
    if (storedHomeId === null) {
      throw error;
    }
    return storedHomeId;
  }
}

/** The SDK needs the home loaded in memory before it can send commands to its devices. */
async function loadHome(homeId: number): Promise<void> {
  try {
    await getHomeDetail({ homeId });
  } catch {
    await getHomeLocalCache({ homeId });
  }
}

/** Logs in (creating the account the first time) and loads the home. Call on every launch. */
export async function connect(): Promise<{ homeId: number }> {
  await ensureSession();
  const homeId = await ensureHome();
  await loadHome(homeId);
  return { homeId };
}

/** Asks for the permissions pairing needs. Returns false if any was denied. */
export async function requestPairingPermissions(): Promise<boolean> {
  const permissions: Permission[] = [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
  if (PAIRING_MODE === 'BLE') {
    permissions.push(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    );
  }
  const results = await PermissionsAndroid.requestMultiple(permissions);
  return permissions.every((permission) => results[permission] === 'granted');
}

/** Name of the Wi-Fi the phone is on, or null if Android doesn't let us read it. */
export function getCurrentWifiName(): Promise<string | null> {
  return new Promise((resolve) => {
    getCurrentWifi(
      (ssid) => {
        const name = (ssid ?? '').replace(/^"|"$/g, '').trim();
        resolve(name && name !== '<unknown ssid>' ? name : null);
      },
      () => resolve(null)
    );
  });
}

function withTimeout<T>(promise: Promise<T>, seconds: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Pairing timed out')), seconds * 1000);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/** Pairs the device in pairing mode with the given Wi-Fi. Resolves with its device id. */
export async function pairDevice(params: {
  homeId: number;
  ssid: string;
  password: string;
}): Promise<string> {
  const { homeId, ssid, password } = params;
  if (PAIRING_MODE === 'BLE') {
    // The library has no timeout for BLE pairing and stopConfig() can't cancel it.
    const device = await withTimeout(
      initBluetoothDualModeActivator({ homeId, ssid, password }),
      PAIRING_TIMEOUT_SECONDS
    );
    return device.devId;
  }
  const device = await initActivator({
    homeId,
    ssid,
    password,
    time: PAIRING_TIMEOUT_SECONDS,
    type: ActivatorType.EZ,
  });
  return device.devId;
}

export function cancelPairing(): void {
  stopConfig();
}

/** Resolves when the SDK confirms the command was sent (PLAN.md §4.1). */
export async function sendCommand(devId: string, command: DpCommand): Promise<void> {
  await send({ devId, command });
}
