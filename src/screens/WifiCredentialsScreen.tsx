import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { colors, spacing } from '../theme';
import { getCurrentWifiName, requestPairingPermissions } from '../tuya/client';

type Props = {
  onSubmit: (credentials: { ssid: string; password: string }) => void;
  onBack: () => void;
};

export function WifiCredentialsScreen({ onSubmit, onBack }: Props) {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const granted = await requestPairingPermissions();
      if (cancelled) return;
      setPermissionDenied(!granted);
      const name = granted ? await getCurrentWifiName() : null;
      if (!cancelled && name) {
        setSsid((current) => current || name);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const canContinue = ssid.trim().length > 0;

  return (
    <Screen
      title="Red WiFi"
      footer={
        <>
          <Button
            label="Conectar"
            disabled={!canContinue}
            onPress={() => onSubmit({ ssid: ssid.trim(), password })}
          />
          <Button label="Volver" variant="secondary" onPress={onBack} />
        </>
      }
    >
      <Text style={styles.text}>
        La parrilla se conecta a tu WiFi de casa. Tiene que ser una red de 2.4 GHz.
      </Text>
      {permissionDenied ? (
        <Text style={styles.warning}>
          Sin el permiso de ubicación no se puede emparejar la parrilla. Activalo desde los Ajustes
          de Android para esta app.
        </Text>
      ) : null}
      <Text style={styles.label}>Nombre de la red</Text>
      <TextInput
        style={styles.input}
        value={ssid}
        onChangeText={setSsid}
        placeholder="Nombre del WiFi"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña del WiFi"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { color: colors.text, fontSize: 17, lineHeight: 24 },
  warning: { color: colors.danger, fontSize: 15, lineHeight: 21 },
  label: { color: colors.textMuted, fontSize: 15, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.text,
    fontSize: 17,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
