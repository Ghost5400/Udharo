// Udharo Design System — Color Tokens (extracted from HTML references)
export const Colors = {
  // Primary (Forest Green)
  primary: '#006b2c',
  primaryContainer: '#00873a',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#f7fff2',
  primaryFixed: '#7ffc97',
  primaryFixedDim: '#62df7d',
  onPrimaryFixed: '#002109',
  onPrimaryFixedVariant: '#005320',
  inversePrimary: '#62df7d',

  // Secondary (Danger Red — "Given" money)
  secondary: '#bb0112',
  secondaryContainer: '#e02928',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#fffbff',
  secondaryFixed: '#ffdad6',
  secondaryFixedDim: '#ffb4ab',
  onSecondaryFixed: '#410002',
  onSecondaryFixedVariant: '#93000b',

  // Tertiary (Accent Pink)
  tertiary: '#a72d51',
  tertiaryContainer: '#c74668',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#fffbff',
  tertiaryFixed: '#ffd9de',
  tertiaryFixedDim: '#ffb2bf',
  onTertiaryFixed: '#3f0016',
  onTertiaryFixedVariant: '#8a143c',

  // Error
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  // Surface
  surface: '#f7f9fb',
  surfaceBright: '#f7f9fb',
  surfaceDim: '#d8dadc',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f4f6',
  surfaceContainer: '#eceef0',
  surfaceContainerHigh: '#e6e8ea',
  surfaceContainerHighest: '#e0e3e5',
  surfaceVariant: '#e0e3e5',
  onSurface: '#191c1e',
  onSurfaceVariant: '#3e4a3d',
  inverseSurface: '#2d3133',
  inverseOnSurface: '#eff1f3',

  // Background
  background: '#f7f9fb',
  onBackground: '#191c1e',

  // Outline
  outline: '#6e7b6c',
  outlineVariant: '#bdcaba',

  // Surface Tint
  surfaceTint: '#006e2d',

  // Semantic Aliases
  given: '#bb0112',       // Money you gave (red)
  received: '#006b2c',    // Money you received (green)
  pending: '#6e7b6c',     // Neutral pending state
  settled: '#005320',     // Fully settled
  warning: '#a72d51',     // Overdue warning

  // Utility
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const DarkColors = {
  ...Colors,
  primary: '#62df7d',
  primaryContainer: '#005320',
  onPrimary: '#003914',
  background: '#191c1e',
  surface: '#191c1e',
  onSurface: '#e2e3e5',
  surfaceContainer: '#2d3133',
  surfaceContainerLow: '#252829',
  surfaceContainerHigh: '#383b3d',
} as const;

export type ColorToken = keyof typeof Colors;
