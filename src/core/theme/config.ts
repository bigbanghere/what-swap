export type Theme = 'system' | 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  secondaryBackground: string;
  tertiaryBackground: string;
  
  // Text colors
  text: string;
  secondaryText: string;
  mutedText: string;
  
  // Border colors
  border: string;
  secondaryBorder: string;
  
  // Interactive colors
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  
  // UI specific colors
  cardBackground: string;
  inputBackground: string;
  buttonBackground: string;
  buttonText: string;
  buttonHover: string;
  
  // Divider colors
  top_divider: string;
  divider: string;
  
  // Segmented control colors
  segmentedBackground: string;
  segmentedSelectedBackground: string;
  segmentedSelectedText: string;
  segmentedUnselectedText: string;
  
  // Switch colors
  switchBackground: string;
  switchBackgroundDisabled: string;
  switchThumb: string;
  switchThumbDisabled: string;
}

export const lightTheme: ThemeColors = {
  // Background colors
  background: '#FFFFFF',
  secondaryBackground: '#EFEFEF',
  tertiaryBackground: '#F8F9FA',
  
  // Text colors
  text: '#000000',
  secondaryText: '#616161',
  mutedText: '#9AA0A6',
  
  // Border colors
  border: '#DADCE0',
  secondaryBorder: '#E8EAED',
  
  // Interactive colors
  primary: '#1A73E8',
  primaryHover: '#1557B0',
  secondary: '#EFEFEF',
  secondaryHover: '#E0E0E0',
  
  // Status colors
  success: '#34A853',
  warning: '#FBBC04',
  error: '#EA4335',
  
  // UI specific colors
  cardBackground: '#FFFFFF',
  inputBackground: '#EFEFEF',
  buttonBackground: '#1A73E8',
  buttonText: '#FFFFFF',
  buttonHover: '#1557B0',
  
  // Divider colors
  top_divider: '#EFEFEF',
  divider: '#EFEFEF',
  
  // Segmented control colors
  segmentedBackground: '#F3F3F3',
  segmentedSelectedBackground: '#E5E5E5',
  segmentedSelectedText: '#333333',
  segmentedUnselectedText: '#616161',
  
  // Switch colors
  switchBackground: '#000000',
  switchBackgroundDisabled: '#F3F3F3',
  switchThumb: '#FFFFFF',
  switchThumbDisabled: '#E5E5E5',
};

export const darkTheme: ThemeColors = {
  // Background colors
  background: '#000000',
  secondaryBackground: '#1A1A1A',
  tertiaryBackground: '#2A2A2A',
  
  // Text colors
  text: '#FFFFFF',
  secondaryText: '#E8EAED',
  mutedText: '#9AA0A6',
  
  // Border colors
  border: '#404040',
  secondaryBorder: '#333333',
  
  // Interactive colors
  primary: '#8AB4F8',
  primaryHover: '#AECBFA',
  secondary: '#333333',
  secondaryHover: '#404040',
  
  // Status colors
  success: '#81C995',
  warning: '#FDD663',
  error: '#F28B82',
  
  // UI specific colors
  cardBackground: '#1A1A1A',
  inputBackground: '#1A1A1A',
  buttonBackground: '#8AB4F8',
  buttonText: '#000000',
  buttonHover: '#AECBFA',
  
  // Divider colors
  top_divider: '#000000',
  divider: '#333333',
  
  // Segmented control colors
  segmentedBackground: '#1A1A1A',
  segmentedSelectedBackground: '#262626',
  segmentedSelectedText: '#FFFFFF',
  segmentedUnselectedText: '#686A6C',
  
  // Switch colors
  switchBackground: '#FFFFFF',
  switchBackgroundDisabled: '#1A1A1A',
  switchThumb: '#000000',
  switchThumbDisabled: '#262626',
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export const defaultTheme: Theme = 'dark';
