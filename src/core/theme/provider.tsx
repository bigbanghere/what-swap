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
      console.log('🎨 Theme Detection Debug:', {
        currentTheme: theme,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        windowLocation: window.location.href
      });

      // Additional Chrome-specific debugging
      if (typeof window !== 'undefined') {
        console.log('🎨 Chrome Theme Detection Debug:', {
          isChrome: /Chrome/.test(navigator.userAgent),
          chromeVersion: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1],
          vendor: navigator.vendor,
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          language: navigator.language,
          languages: navigator.languages,
          // Check if we can access system theme
          matchMediaSupported: 'matchMedia' in window,
          prefersColorSchemeSupported: window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all',
          // Check all possible theme-related media queries
          allMediaQueries: {
            dark: window.matchMedia('(prefers-color-scheme: dark)').matches,
            light: window.matchMedia('(prefers-color-scheme: light)').matches,
            noPreference: window.matchMedia('(prefers-color-scheme: no-preference)').matches,
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            highContrast: window.matchMedia('(prefers-contrast: high)').matches,
            lowData: window.matchMedia('(prefers-reduced-data: reduce)').matches
          }
        });
      }

      if (theme === 'system') {
        // Detect if we're on mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isInTelegram = window.location.search.includes('tgWebAppPlatform') || 
                            window.location.hash.includes('tgWebAppPlatform') ||
                            !!(window as any).Telegram?.WebApp;
        
        // Check browser theme detection methods
        const mediaQueryDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const mediaQueryLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        const mediaQueryNoPreference = window.matchMedia('(prefers-color-scheme: no-preference)').matches;
        
        // Additional browser theme detection methods
        const hasSystemTheme = 'matchMedia' in window;
        const canDetectTheme = hasSystemTheme && window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all';
        
        // Check for Chrome-specific theme detection
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isChromeVersion = isChrome ? navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] : null;
        
        // Check for other theme indicators
        const hasDarkModeSupport = window.matchMedia && window.matchMedia('(prefers-color-scheme)').media !== 'not all';
        const systemThemeSupport = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all';
        
        console.log('🎨 Browser Theme Detection Details:', {
          isMobile,
          isInTelegram,
          isChrome,
          chromeVersion: isChromeVersion,
          hasSystemTheme,
          canDetectTheme,
          hasDarkModeSupport,
          systemThemeSupport,
          mediaQueryDark,
          mediaQueryLight,
          mediaQueryNoPreference,
          telegramIsDark,
          windowTelegram: !!(window as any).Telegram?.WebApp,
          locationSearch: window.location.search,
          locationHash: window.location.hash
        });
        
        let detectedDark: boolean = false;
        
        // Always use media query as the primary detection method for system theme
        console.log('🎨 Media Query Detection:', {
          'prefers-color-scheme: dark': mediaQueryDark,
          'prefers-color-scheme: light': mediaQueryLight,
          'prefers-color-scheme: no-preference': mediaQueryNoPreference,
          mediaQuerySupported: hasDarkModeSupport
        });
        
        if (isInTelegram) {
          // In Telegram, try to use SDK value first, but fallback to media query
          console.log('🎨 Telegram Theme Detection:', {
            telegramIsDark,
            telegramIsDarkType: typeof telegramIsDark,
            telegramIsDarkUndefined: telegramIsDark === undefined,
            fallbackToMediaQuery: telegramIsDark === undefined
          });
          
          if (telegramIsDark !== undefined) {
            detectedDark = telegramIsDark;
            console.log('🎨 Using Telegram SDK theme:', detectedDark);
          } else {
            detectedDark = mediaQueryDark;
            console.log('🎨 Fallback to media query theme:', detectedDark);
          }
        } else {
          // Not in Telegram - use media query
          detectedDark = mediaQueryDark;
          console.log('🎨 Using media query theme (not in Telegram):', detectedDark);
        }
        
        console.log('🎨 Final Theme Decision:', {
          detectedDark,
          willSetIsDark: detectedDark,
          themeMode: detectedDark ? 'DARK' : 'LIGHT'
        });
        
        setIsDark(detectedDark);
      } else {
        const explicitDark = theme === 'dark';
        console.log('🎨 Explicit Theme Mode:', {
          theme,
          explicitDark,
          willSetIsDark: explicitDark,
          themeMode: explicitDark ? 'DARK' : 'LIGHT'
        });
        setIsDark(explicitDark);
      }
    };

    updateTheme();

    // Listen for media query changes when using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        console.log('🎨 Media Query Change Detected:', {
          matches: e.matches,
          media: e.media,
          timestamp: new Date().toISOString(),
          willTriggerThemeUpdate: true
        });
        updateTheme();
      };
      
      console.log('🎨 Setting up media query listener:', {
        media: mediaQuery.media,
        matches: mediaQuery.matches,
        addEventListener: 'change'
      });
      
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        console.log('🎨 Removing media query listener');
        mediaQuery.removeEventListener('change', handleChange);
      };
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
