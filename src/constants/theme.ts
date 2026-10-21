/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Paleta obligatoria de la skill `cotopaxi-brand`. Únicos colores de marca
 * autorizados en la interfaz: las pantallas y componentes deben importar
 * estos tokens y no usar hexadecimales sueltos.
 */
export const Brand = {
  /** Texto principal, contornos, marcos e iconografía. */
  navy: '#181759',
  /** Acentos visuales, rayos del sol e indicadores destacados. */
  gold: '#C69214',
  /** Fondo de superficies claras y texto sobre azul marino. */
  white: '#FFFFFF',
} as const;

/**
 * Rojo reservado exclusivamente al mensaje de validación junto al campo
 * (Decisión 005). No forma parte de la paleta `cotopaxi-brand`.
 */
export const ValidationError = '#C62828' as const;

/** Radios de borde reutilizables para superficies Claymorphism. */
export const Radii = {
  card: 28,
  button: 24,
  input: 16,
} as const;

/**
 * Elevaciones neutras y sutiles (sin tintes cromáticos), compatibles con
 * iOS (`shadow*`) y Android (`elevation`).
 */
export const Shadows = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardSoft: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  control: {
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
