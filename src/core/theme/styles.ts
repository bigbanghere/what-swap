import { ThemeColors } from './config';

export function applyThemeColors(colors: ThemeColors) {
  const root = document.documentElement;
  
  // Apply all theme colors as CSS variables
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });
}

export function createThemeCSSVariables(colors: ThemeColors): string {
  return Object.entries(colors)
    .map(([key, value]) => `--theme-${key}: ${value};`)
    .join('\n  ');
}
