import { useMemo, useSyncExternalStore } from 'react';

import { GRILL_CHANNELS } from '../config';
import { GrillController } from '../domain/grillController';
import { sendCommand } from '../tuya/client';

export function useGrill(devId: string) {
  const controller = useMemo(
    () => new GrillController((command) => sendCommand(devId, command), GRILL_CHANNELS),
    [devId]
  );
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  return { ...snapshot, press: controller.press.bind(controller) };
}
