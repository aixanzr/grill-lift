import { StyleSheet, Text } from 'react-native';

import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { colors } from '../theme';

type Props = { onNext: () => void };

export function PrepareDeviceScreen({ onNext }: Props) {
  return (
    <Screen
      title="Conectá tu parrilla"
      footer={<Button label="Listo, continuar" onPress={onNext} />}
    >
      <Text style={styles.text}>
        Antes de empezar, poné el módulo de la parrilla en modo de emparejamiento:
      </Text>
      <Text style={styles.step}>
        1. Si la parrilla estaba agregada en Smart Life, eliminala de ahí primero.
      </Text>
      <Text style={styles.step}>
        2. Mantené presionado el botón del módulo hasta que la luz parpadee rápido.
      </Text>
      <Text style={styles.step}>3. Dejá el teléfono cerca de la parrilla.</Text>
      <Text style={styles.note}>
        El control remoto va a seguir funcionando igual. Smart Life ya no va a poder controlar la
        parrilla.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { color: colors.text, fontSize: 17, lineHeight: 24 },
  step: { color: colors.text, fontSize: 17, lineHeight: 24 },
  note: { color: colors.textMuted, fontSize: 15, lineHeight: 21 },
});
