import { randomUUID } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// The Tuya account is created silently on first launch and is tied to this phone
// (PLAN.md §2 "Sin usuarios").
const UID_KEY = 'tuya.uid';
const PASSWORD_KEY = 'tuya.password';

export type TuyaAccount = { uid: string; password: string };

export async function loadOrCreateAccount(): Promise<TuyaAccount> {
  const [uid, password] = await Promise.all([
    SecureStore.getItemAsync(UID_KEY),
    SecureStore.getItemAsync(PASSWORD_KEY),
  ]);
  if (uid && password) {
    return { uid, password };
  }

  const account = {
    uid: `grill-${randomUUID().replace(/-/g, '')}`,
    password: randomUUID(),
  };
  await SecureStore.setItemAsync(UID_KEY, account.uid);
  await SecureStore.setItemAsync(PASSWORD_KEY, account.password);
  return account;
}
