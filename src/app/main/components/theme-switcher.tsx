"use client";

import React from 'react';
import { useTheme } from '@/core/theme';

export function ThemeSwitcher() {
  const { theme, setTheme, isDark } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '🔄' },
  ] as const;

  return (
    <div className="flex items-center gap-2">
      {themes.map(({ value, label, icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value as any)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            theme === value ? 'scale-105' : 'hover:scale-105'
          }`}
          style={{
            backgroundColor: theme === value ? '#1ABCFF' : 'transparent',
            color: theme === value ? '#FFFFFF' : isDark ? '#F0F6FC' : '#212529',
            border: `1px solid ${theme === value ? '#1ABCFF' : isDark ? '#30363D' : '#DEE2E6'}`,
          }}
        >
          <span className="mr-1">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
