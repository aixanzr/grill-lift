// Device-specific values. Confirm them against the real DOMO-18-2G (PLAN.md §6, stage 1).

/** Data point ids of the two relay channels. */
export const GRILL_CHANNELS = {
  up: '1',
  down: '2',
} as const;

/** Pairing mode the module supports: 'EZ' (Wi-Fi only) or 'BLE' (Wi-Fi + Bluetooth combo). */
export const PAIRING_MODE: 'EZ' | 'BLE' = 'EZ';

export const PAIRING_TIMEOUT_SECONDS = 120;

/** Phone country code used for the Tuya account (Argentina). */
export const TUYA_COUNTRY_CODE = '54';
