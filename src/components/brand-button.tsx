import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Brand, Radii, Shadows, Spacing } from '@/constants/theme';

/** Nombre de icono Ionicons admitido por los botones de marca. */
export type BrandButtonIcon = ComponentProps<typeof Ionicons>['name'];

/**
 * Botón reutilizable con el lenguaje visual Cotopaxi (skill `cotopaxi-brand`):
 * superficie redondeada y suave, volumen sutil con sombra neutra y estados
 * diferenciados sin salir de la paleta autorizada.
 *
 * - Variante `navy`: acción principal, fondo azul marino con texto blanco.
 * - Variante `gold`: acción destacada, fondo dorado con texto azul marino
 *   (el blanco sobre dorado no alcanza contraste suficiente).
 * - `icon`: icono Ionicons junto a la etiqueta (patrón `mejorar-UI`).
 */
export type BrandButtonVariant = 'navy' | 'gold';

type BrandButtonProps = {
  label: string;
  onPress: () => void;
  variant?: BrandButtonVariant;
  icon?: BrandButtonIcon;
  /** Etiqueta de accesibilidad alternativa a la etiqueta visible. */
  accessibilityLabel?: string;
  /** Contorno dorado (usado para destacar controles secundarios). */
  bordered?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function BrandButton({
  label,
  onPress,
  variant = 'navy',
  icon,
  accessibilityLabel,
  bordered = false,
  disabled = false,
  style,
}: BrandButtonProps) {
  const isGold = variant === 'gold';
  const contentColor = isGold ? Brand.navy : Brand.white;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        isGold ? styles.gold : styles.navy,
        bordered && styles.bordered,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={20} color={contentColor} /> : null}
      <Text style={[styles.label, { color: contentColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: 120,
    minHeight: 48,
    paddingHorizontal: Spacing.four,
    borderRadius: Radii.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    ...Shadows.control,
  },
  navy: {
    backgroundColor: Brand.navy,
  },
  gold: {
    backgroundColor: Brand.gold,
  },
  bordered: {
    borderWidth: 2,
    borderColor: Brand.gold,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
