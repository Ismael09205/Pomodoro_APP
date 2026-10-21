import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '@/components/brand-button';
import { Brand, Radii, Shadows, Spacing } from '@/constants/theme';

type BrandDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Diálogo propio con el lenguaje visual Cotopaxi: tarjeta blanca redondeada,
 * icono en círculo, título, mensaje y acciones. Sustituye a `Alert.alert`.
 */
export function BrandDialog({
  visible,
  title,
  message,
  icon = 'help-circle',
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: BrandDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={styles.backdrop}
        onPress={onCancel}
        accessibilityLabel="Cerrar diálogo"
      >
        {/* Pressable interno evita que tocar la tarjeta cierre el diálogo. */}
        <Pressable style={styles.card} accessibilityViewIsModal>
          <View style={styles.iconCircle}>
            <Ionicons name={icon} size={32} color={Brand.gold} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <BrandButton
              label={cancelLabel}
              variant="gold"
              onPress={onCancel}
              style={styles.action}
            />
            <BrandButton label={confirmLabel} onPress={onConfirm} style={styles.action} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 23, 89, 0.6)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    backgroundColor: Brand.white,
    borderRadius: Radii.card,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    ...Shadows.card,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Brand.navy,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: Brand.navy,
    opacity: 0.7,
    fontSize: 16,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  action: {
    // Apilados y con el mismo ancho: la etiqueta completa (p. ej.
    // «Restablecer») siempre cabe con aire suficiente, sin crecer según el
    // texto ni recortarse, en cualquier ancho de pantalla o escala de letra.
    alignSelf: 'stretch',
  },
});
