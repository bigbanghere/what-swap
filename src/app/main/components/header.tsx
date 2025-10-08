"use client";

import Image from 'next/image';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';
import { CustomTonConnectButton } from "./full-tc-button";

export function Header() {
  const { isDark } = useTheme();
  const { shouldBeCompact } = useKeyboardDetection();

  // Hide header when keyboard is open OR viewport is expanded
  if (shouldBeCompact) {
    return null;
  }

  return (
    <header 
      className={`z-20 flex items-center justify-between transition-all duration-300 ${shouldBeCompact ? 'p-[20px]' : 'p-[15px]'}`}
      style={{ 
        borderTop: `1px solid #007AFF`,
        borderBottom: `1px solid #007AFF`
      }}
    >
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src={isDark ? '/what-swap-dark.svg' : '/what-swap-light.svg'}
          alt="Whatever"
          width={81}
          height={91}
          priority
        />
      </div>
      <CustomTonConnectButton />
    </header>
  );
}
