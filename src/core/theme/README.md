# Whatever Theme System

A comprehensive theme system for the Whatever Telegram Mini App with support for light, dark, and system themes.

## Features

- **Multiple Theme Support**: Light, Dark, and System themes
- **Telegram Integration**: Automatically syncs with Telegram's theme
- **Custom Color Palette**: Comprehensive color system for all UI elements
- **CSS Variables**: All colors available as CSS custom properties
- **TypeScript Support**: Fully typed theme configuration
- **Theme Persistence**: Remembers user's theme preference
- **Smooth Transitions**: Animated theme switching

## Usage

### Basic Usage

```tsx
import { useTheme } from '@/core/theme';

function MyComponent() {
  const { colors, theme, setTheme, isDark } = useTheme();
  
  return (
    <div style={{ backgroundColor: colors.background, color: colors.text }}>
      <h1>Hello World</h1>
      <button 
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        style={{ backgroundColor: colors.primary }}
      >
        Toggle Theme
      </button>
    </div>
  );
}
```

### Using CSS Variables

```css
.my-component {
  background-color: var(--whatever-background);
  color: var(--whatever-text);
  border: 1px solid var(--whatever-border);
}

.my-button {
  background-color: var(--whatever-primary);
  color: var(--whatever-text-inverse);
}

.my-button:hover {
  background-color: var(--whatever-primary-hover);
}
```

### Theme Switcher Component

```tsx
import { ThemeSwitcher } from '@/components/theme-switcher';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeSwitcher />
    </header>
  );
}
```

## Color Palette

### Primary Colors
- `primary`: Main brand color (#007AFF)
- `primaryHover`: Hover state
- `primaryActive`: Active/pressed state

### Background Colors
- `background`: Main background
- `secondaryBackground`: Secondary background (cards, modals)
- `tertiaryBackground`: Tertiary background (inputs, buttons)

### Text Colors
- `text`: Primary text
- `textSecondary`: Secondary text (labels, hints)
- `textTertiary`: Tertiary text (disabled, placeholders)
- `textInverse`: Text on dark backgrounds

### Border Colors
- `border`: Primary borders
- `borderSecondary`: Secondary borders
- `borderFocus`: Focus state borders

### Status Colors
- `success`: Success states
- `warning`: Warning states
- `error`: Error states
- `info`: Info states

### Interactive Colors
- `hover`: Hover states
- `active`: Active states
- `disabled`: Disabled states

### Special Colors
- `accent`: Accent color
- `accentHover`: Accent hover state
- `accentActive`: Accent active state

### Swap-Specific Colors
- `swapPrimary`: Primary swap color
- `swapSecondary`: Secondary swap color
- `swapAccent`: Swap accent color
- `swapBackground`: Swap background
- `swapBorder`: Swap border color

## Theme Configuration

### Adding New Colors

1. Add the color to the `ThemeColors` interface in `config.ts`
2. Add the color value to both `lightTheme` and `darkTheme` objects
3. The color will automatically be available as a CSS variable

### Customizing Existing Colors

Edit the color values in `config.ts`:

```typescript
export const lightTheme: ThemeColors = {
  primary: '#YOUR_COLOR', // Change this
  // ... other colors
};
```

## CSS Variables

All theme colors are automatically available as CSS custom properties:

```css
:root {
  --whatever-primary: #007AFF;
  --whatever-background: #FFFFFF;
  --whatever-text: #212529;
  /* ... all other colors */
}
```

## Theme Provider Setup

The theme provider is already set up in the Root component. It automatically:

1. Detects Telegram's theme preference
2. Applies the appropriate color scheme
3. Sets CSS custom properties
4. Handles theme switching
5. Persists user preferences

## Utilities

### Color Conversion

```typescript
import { percentToHexAlpha, hexToRgba } from '@/core/theme/utils';

// Convert percentage to hex alpha
const alpha = percentToHexAlpha(50); // "80"

// Convert hex to RGBA
const rgba = hexToRgba('#007AFF', 0.5); // "rgba(0, 122, 255, 0.5)"
```

### CSS Variable Helpers

```typescript
import { getThemeColorVar, getThemeColorVarWithFallback } from '@/core/theme/utils';

// Get CSS variable
const bgVar = getThemeColorVar('background'); // "var(--whatever-background)"

// Get CSS variable with fallback
const bgVarWithFallback = getThemeColorVarWithFallback('background', '#ffffff');
// "var(--whatever-background, #ffffff)"
```

## Best Practices

1. **Use the theme hook**: Always use `useTheme()` instead of hardcoded colors
2. **CSS Variables**: Use CSS variables for static styles
3. **Consistent Naming**: Follow the established color naming convention
4. **Accessibility**: Ensure sufficient contrast ratios
5. **Testing**: Test all themes during development

## Examples

### Button Component

```tsx
function Button({ children, variant = 'primary' }) {
  const { colors } = useTheme();
  
  const buttonStyles = {
    primary: {
      backgroundColor: colors.primary,
      color: colors.textInverse,
    },
    secondary: {
      backgroundColor: colors.secondaryBackground,
      color: colors.text,
      border: `1px solid ${colors.border}`,
    }
  };
  
  return (
    <button style={buttonStyles[variant]}>
      {children}
    </button>
  );
}
```

### Card Component

```tsx
function Card({ children }) {
  const { colors } = useTheme();
  
  return (
    <div 
      style={{
        backgroundColor: colors.secondaryBackground,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      {children}
    </div>
  );
}
```
