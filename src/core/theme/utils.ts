import { ThemeColors } from './config';

/**
 * Convert percentage to hex alpha channel value
 * @param percentage - Percentage value (0-100)
 * @returns Hex alpha channel value (00-FF)
 */
export function percentToHexAlpha(percentage: number): string {
  const alpha = Math.round((percentage / 100) * 255);
  return alpha.toString(16).padStart(2, '0').toUpperCase();
}

/**
 * Convert hex color to RGBA
 * @param hex - Hex color (e.g., #007AFF)
 * @param alpha - Alpha value (0-1)
 * @returns RGBA string
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get CSS variable for a theme color
 * @param colorKey - Key from ThemeColors interface
 * @returns CSS variable string
 */
export function getThemeColorVar(colorKey: keyof ThemeColors): string {
  return `var(--whatever-${colorKey.replace(/([A-Z])/g, '-$1').toLowerCase()})`;
}

/**
 * Get CSS variable with fallback
 * @param colorKey - Key from ThemeColors interface
 * @param fallback - Fallback color value
 * @returns CSS variable with fallback
 */
export function getThemeColorVarWithFallback(
  colorKey: keyof ThemeColors, 
  fallback: string
): string {
  return `var(--whatever-${colorKey.replace(/([A-Z])/g, '-$1').toLowerCase()}, ${fallback})`;
}

/**
 * Generate CSS custom properties for a theme
 * @param colors - Theme colors object
 * @returns CSS custom properties string
 */
export function generateThemeCSS(colors: ThemeColors): string {
  return Object.entries(colors)
    .map(([key, value]) => {
      const cssVar = `--whatever-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      return `${cssVar}: ${value};`;
    })
    .join('\n  ');
}
