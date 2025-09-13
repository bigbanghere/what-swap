"use client";

import Image from 'next/image';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';

export function Header() {
  const { isDark } = useTheme();
  const { shouldBeCompact } = useKeyboardDetection();

  // Hide header when keyboard is open OR viewport is expanded
  if (!shouldBeCompact) {
    return null;
  }

  return (
    <header 
      className="flex items-center justify-between px-4 py-3 transition-all duration-300"
      style={{ 
        borderBottom: `1px solid #1ABCFF`
      }}
    >
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src={isDark ? '/whatever_dark.svg' : '/whatever_light.svg'}
          alt="Whatever"
          width={73}
          height={40}
          priority
        />
      </div>
    </header>
  );
}
