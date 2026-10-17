import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'grill.devId';
const HOME_ID_KEY = 'grill.homeId';

export async function loadDeviceId(): Promise<string | null> {
  return AsyncStorage.getItem(DEVICE_ID_KEY);
}

export async function saveDeviceId(devId: string): Promise<void> {
  await AsyncStorage.setItem(DEVICE_ID_KEY, devId);
}

export async function loadHomeId(): Promise<number | null> {
  const value = await AsyncStorage.getItem(HOME_ID_KEY);
  return value === null ? null : Number(value);
}

export async function saveHomeId(homeId: number): Promise<void> {
  await AsyncStorage.setItem(HOME_ID_KEY, String(homeId));
}
