// Custom theme configuration for Whatever app
export interface ThemeColors {
  background: string;
  text: string;
}

export const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  text: '#000000',
};

export const darkTheme: ThemeColors = {
  background: '#000000',
  text: '#FFFFFF',
};

export type Theme = 'light' | 'dark' | 'system';

export const themes: Record<Theme, ThemeColors> = {
  light: lightTheme,
  dark: darkTheme,
  system: lightTheme, // Will be overridden based on system preference
};

export const defaultTheme: Theme = 'system';
