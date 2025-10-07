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
      // If no saved theme, use the default (which is now 'dark')
    }
  }, []);

  // Use the useSignal hook to listen to Telegram theme changes
  const telegramIsDark = useSignal(miniApp.isDark);

  // Update theme based on Telegram's theme when using 'system'
  useEffect(() => {
    const updateTheme = () => {
      if (theme === 'system') {
        // Detect if we're on mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isInTelegram = window.location.search.includes('tgWebAppPlatform') || 
                            window.location.hash.includes('tgWebAppPlatform') ||
                            !!(window as any).Telegram?.WebApp;
        
        let detectedDark: boolean = false;
        
        // Always use media query as the primary detection method for system theme
        const mediaQueryDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (isInTelegram) {
          // In Telegram, try to use SDK value first, but fallback to media query
          if (telegramIsDark !== undefined) {
            detectedDark = telegramIsDark;
          } else {
            detectedDark = mediaQueryDark;
          }
        } else {
          // Not in Telegram - use media query
          detectedDark = mediaQueryDark;
        }
        
        
        setIsDark(detectedDark);
      } else {
        const explicitDark = theme === 'dark';
        setIsDark(explicitDark);
      }
    };

    updateTheme();

    // Listen for media query changes when using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateTheme();
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
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

  // Apply theme colors as CSS variables immediately
  useEffect(() => {
    applyThemeColors(colors);
  }, [colors]);

  // Also apply theme colors immediately on mount to prevent white flash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      applyThemeColors(colors);
    }
  }, []);

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
