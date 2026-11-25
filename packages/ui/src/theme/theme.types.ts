export type ThemeMode = 'dark' | 'light' | 'system';

export interface ColorPaletteTokens {
  bgRoot: string;
  bgSurface: string;
  bgSubtle: string;
  borderSubtle: string;
  borderStrong: string;
  textPrimary: string;
  textMuted: string;
  textTertiary: string;
}

export interface CustomThemeConfig {
  dark: ColorPaletteTokens;
  light: ColorPaletteTokens;
}

export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  customTokens: CustomThemeConfig;
  updateCustomTokens: (updater: Partial<CustomThemeConfig> | ((prev: CustomThemeConfig) => CustomThemeConfig)) => void;
  resetCustomTokens: () => void;
}
