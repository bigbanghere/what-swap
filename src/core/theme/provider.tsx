"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSignal, miniApp } from '@telegram-apps/sdk-react';
import { Theme, ThemeColors, themes, lightTheme, darkTheme, defaultTheme } from './config';
import { applyThemeColors } from './styles';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [isDark, setIsDark] = useState(false);

  // Get theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('WHATEVER_THEME') as Theme;
      if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
    }
  }, []);

  // Use the useSignal hook to listen to Telegram theme changes
  const telegramIsDark = useSignal(miniApp.isDark);

  // Update theme based on Telegram's theme when using 'system'
  useEffect(() => {
    if (theme === 'system') {
      // Detect if we're on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isInTelegram = window.location.search.includes('tgWebAppPlatform') || 
                          window.location.hash.includes('tgWebAppPlatform') ||
                          !!(window as any).Telegram?.WebApp;
      
      let detectedDark: boolean | undefined = undefined;
      
      // Mobile-specific theme detection
      if (isMobile && isInTelegram) {
        // For mobile Telegram, use media query detection as primary method
        // Mobile Telegram apps often don't provide reliable theme info through SDK
        const mediaQueryDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        detectedDark = mediaQueryDark;
      } else if (isInTelegram) {
        // Desktop Telegram - use SDK value as primary method
        detectedDark = telegramIsDark;
        
        // Fallback to media query if SDK value is undefined
        if (detectedDark === undefined) {
          const mediaQueryDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          detectedDark = mediaQueryDark;
        }
      } else {
        // Not in Telegram - use media query
        const mediaQueryDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        detectedDark = mediaQueryDark;
      }
      
      // Ensure we have a boolean value
      const finalDark = !!detectedDark;
      setIsDark(finalDark);
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme, telegramIsDark]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('WHATEVER_THEME', newTheme);
    }
  };

  // Get current colors based on theme
  const colors = theme === 'system' 
    ? (isDark ? darkTheme : lightTheme)
    : themes[theme];

  // Apply theme colors as CSS variables
  useEffect(() => {
    applyThemeColors(colors);
  }, [colors]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    colors,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
