// ─── Udharo Design System — Color Tokens ─────────────────────────────────────

// Generic color type for dark/light theme switching without literal type conflicts
export interface ThemeColors {
  primary: string; primaryContainer: string; onPrimary: string; onPrimaryContainer: string;
  primaryFixed: string; primaryFixedDim: string; onPrimaryFixed: string; onPrimaryFixedVariant: string;
  inversePrimary: string;
  secondary: string; secondaryContainer: string; onSecondary: string; onSecondaryContainer: string;
  secondaryFixed: string; secondaryFixedDim: string; onSecondaryFixed: string; onSecondaryFixedVariant: string;
  tertiary: string; tertiaryContainer: string; onTertiary: string; onTertiaryContainer: string;
  tertiaryFixed: string; tertiaryFixedDim: string; onTertiaryFixed: string; onTertiaryFixedVariant: string;
  error: string; errorContainer: string; onError: string; onErrorContainer: string;
  surface: string; surfaceBright: string; surfaceDim: string;
  surfaceContainerLowest: string; surfaceContainerLow: string; surfaceContainer: string;
  surfaceContainerHigh: string; surfaceContainerHighest: string; surfaceVariant: string;
  onSurface: string; onSurfaceVariant: string; inverseSurface: string; inverseOnSurface: string;
  background: string; onBackground: string;
  outline: string; outlineVariant: string; surfaceTint: string;
  given: string; received: string; pending: string; settled: string; warning: string;
  white: string; black: string; transparent: string;
}

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

  // Surface (Light Mode)
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
  given: '#bb0112',
  received: '#006b2c',
  pending: '#6e7b6c',
  settled: '#005320',
  warning: '#a72d51',

  // Utility
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ─── Full Dark Color Palette ──────────────────────────────────────────────────
export const DarkColors = {
  primary: '#62df7d',
  primaryContainer: '#005320',
  onPrimary: '#003914',
  onPrimaryContainer: '#7ffc97',
  primaryFixed: '#7ffc97',
  primaryFixedDim: '#62df7d',
  onPrimaryFixed: '#002109',
  onPrimaryFixedVariant: '#005320',
  inversePrimary: '#006b2c',

  secondary: '#ffb4ab',
  secondaryContainer: '#93000b',
  onSecondary: '#690005',
  onSecondaryContainer: '#ffdad6',
  secondaryFixed: '#ffdad6',
  secondaryFixedDim: '#ffb4ab',
  onSecondaryFixed: '#410002',
  onSecondaryFixedVariant: '#93000b',

  tertiary: '#ffb2bf',
  tertiaryContainer: '#8a143c',
  onTertiary: '#5e1129',
  onTertiaryContainer: '#ffd9de',
  tertiaryFixed: '#ffd9de',
  tertiaryFixedDim: '#ffb2bf',
  onTertiaryFixed: '#3f0016',
  onTertiaryFixedVariant: '#8a143c',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  // Dark surfaces
  surface: '#0f1210',
  surfaceBright: '#343a36',
  surfaceDim: '#0f1210',
  surfaceContainerLowest: '#0a0e0b',
  surfaceContainerLow: '#171c18',
  surfaceContainer: '#1b2019',
  surfaceContainerHigh: '#262b23',
  surfaceContainerHighest: '#31362d',
  surfaceVariant: '#3e4a3d',
  onSurface: '#e2e4e0',
  onSurfaceVariant: '#c0c9bd',
  inverseSurface: '#e2e4e0',
  inverseOnSurface: '#2e332b',

  background: '#0f1210',
  onBackground: '#e2e4e0',

  outline: '#8a9388',
  outlineVariant: '#3e4a3d',

  surfaceTint: '#62df7d',

  // Semantic Aliases (dark-adjusted)
  given: '#ffb4ab',
  received: '#62df7d',
  pending: '#8a9388',
  settled: '#4acf6a',
  warning: '#ffb2bf',

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof Colors;
