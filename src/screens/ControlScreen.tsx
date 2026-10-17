import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GrillButton, GrillState } from '../domain/grillController';
import { useGrill } from '../hooks/useGrill';
import { colors, spacing } from '../theme';

const STATE_LABEL: Record<GrillState, string> = {
  stopped: 'Detenida',
  raising: 'Subiendo…',
  lowering: 'Bajando…',
};

type Props = { devId: string };

export function ControlScreen({ devId }: Props) {
  const { state, busy, press } = useGrill(devId);
  const [error, setError] = useState<string | null>(null);

  const onPress = async (button: GrillButton) => {
    setError(null);
    const result = await press(button);
    if (result.status === 'failed') {
      setError('No se pudo enviar la orden. Revisá que la parrilla y el teléfono tengan internet.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>Mi parrilla</Text>
      <View style={styles.controls}>
        <DirectionButton
          label="▲ SUBIR"
          active={state === 'raising'}
          disabled={busy}
          onPress={() => onPress('up')}
        />
        <Text style={styles.state}>{STATE_LABEL[state]}</Text>
        <DirectionButton
          label="▼ BAJAR"
          active={state === 'lowering'}
          disabled={busy}
          onPress={() => onPress('down')}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </SafeAreaView>
  );
}

type DirectionButtonProps = {
  label: string;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
};

function DirectionButton({ label, active, disabled, onPress }: DirectionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.direction,
        active && styles.directionActive,
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <Text style={[styles.directionLabel, active && styles.directionLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  title: { color: colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  controls: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  state: { color: colors.text, fontSize: 32, fontWeight: '600', textAlign: 'center' },
  direction: {
    height: 160,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  dimmed: { opacity: 0.6 },
  directionLabel: { color: colors.text, fontSize: 30, fontWeight: '700' },
  directionLabelActive: { color: colors.accentText },
  error: { color: colors.danger, fontSize: 15, lineHeight: 21, textAlign: 'center' },
});
