import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Button } from './src/components/Button';
import { ControlScreen } from './src/screens/ControlScreen';
import { PairingScreen } from './src/screens/PairingScreen';
import { PrepareDeviceScreen } from './src/screens/PrepareDeviceScreen';
import { WifiCredentialsScreen } from './src/screens/WifiCredentialsScreen';
import { loadDeviceId, saveDeviceId } from './src/storage/device';
import { colors, spacing } from './src/theme';
import { connect } from './src/tuya/client';

// No navigation library: one piece of state decides the screen (PLAN.md §5).
type Route =
  | { name: 'connecting' }
  | { name: 'connectError' }
  | { name: 'prepare'; homeId: number }
  | { name: 'wifi'; homeId: number }
  | { name: 'pairing'; homeId: number; ssid: string; password: string }
  | { name: 'control'; devId: string };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'connecting' });

  const start = useCallback(async () => {
    setRoute({ name: 'connecting' });
    try {
      const { homeId } = await connect();
      const devId = await loadDeviceId();
      setRoute(devId ? { name: 'control', devId } : { name: 'prepare', homeId });
    } catch {
      setRoute({ name: 'connectError' });
    }
  }, []);

  useEffect(() => {
    start();
  }, [start]);

  const onPaired = useCallback(async (devId: string) => {
    await saveDeviceId(devId);
    setRoute({ name: 'control', devId });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {renderRoute(route, setRoute, start, onPaired)}
    </SafeAreaProvider>
  );
}

function renderRoute(
  route: Route,
  setRoute: (route: Route) => void,
  retry: () => void,
  onPaired: (devId: string) => void
) {
  switch (route.name) {
    case 'connecting':
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      );
    case 'connectError':
      return (
        <View style={styles.center}>
          <Text style={styles.text}>
            No se pudo conectar. Revisá que el teléfono tenga internet.
          </Text>
          <Button label="Reintentar" onPress={retry} />
        </View>
      );
    case 'prepare':
      return (
        <PrepareDeviceScreen onNext={() => setRoute({ name: 'wifi', homeId: route.homeId })} />
      );
    case 'wifi':
      return (
        <WifiCredentialsScreen
          onBack={() => setRoute({ name: 'prepare', homeId: route.homeId })}
          onSubmit={({ ssid, password }) =>
            setRoute({ name: 'pairing', homeId: route.homeId, ssid, password })
          }
        />
      );
    case 'pairing':
      return (
        <PairingScreen
          homeId={route.homeId}
          ssid={route.ssid}
          password={route.password}
          onPaired={onPaired}
          onBack={() => setRoute({ name: 'wifi', homeId: route.homeId })}
        />
      );
    case 'control':
      return <ControlScreen devId={route.devId} />;
  }
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  text: { color: colors.text, fontSize: 17, lineHeight: 24, textAlign: 'center' },
});
