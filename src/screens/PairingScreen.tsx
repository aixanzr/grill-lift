import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { colors } from '../theme';
import { cancelPairing, pairDevice } from '../tuya/client';

type Props = {
  homeId: number;
  ssid: string;
  password: string;
  onPaired: (devId: string) => void;
  onBack: () => void;
};

export function PairingScreen({ homeId, ssid, password, onPaired, onBack }: Props) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    pairDevice({ homeId, ssid, password }).then(
      (devId) => {
        if (!cancelled) onPaired(devId);
      },
      () => {
        if (!cancelled) setFailed(true);
      }
    );
    return () => {
      cancelled = true;
      cancelPairing();
    };
  }, [homeId, ssid, password, onPaired, attempt]);

  const retry = useCallback(() => {
    setFailed(false);
    setAttempt((value) => value + 1);
  }, []);

  if (failed) {
    return (
      <Screen
        title="No se pudo conectar"
        footer={
          <>
            <Button label="Reintentar" onPress={retry} />
            <Button label="Volver" variant="secondary" onPress={onBack} />
          </>
        }
      >
        <Text style={styles.text}>Revisá que:</Text>
        <Text style={styles.text}>• La luz del módulo esté parpadeando rápido.</Text>
        <Text style={styles.text}>• La red sea de 2.4 GHz y la contraseña sea correcta.</Text>
        <Text style={styles.text}>• El teléfono esté cerca de la parrilla.</Text>
      </Screen>
    );
  }

  return (
    <Screen
      title="Conectando…"
      footer={<Button label="Cancelar" variant="secondary" onPress={onBack} />}
    >
      <ActivityIndicator size="large" color={colors.accent} style={styles.spinner} />
      <Text style={styles.text}>Esto puede tardar hasta dos minutos. No cierres la app.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  spinner: { marginVertical: 48 },
  text: { color: colors.text, fontSize: 17, lineHeight: 24 },
});
