"use client";

import Image from 'next/image';
import { useTheme } from '@/core/theme';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';
import { useTonAddress } from "@tonconnect/ui-react";
import { CustomTonConnectButton } from "./full-tc-button";

export function Header() {
  const { isDark } = useTheme();
  const { shouldBeCompact } = useKeyboardDetection();
  const walletAddress = useTonAddress();

  // Hide header when keyboard is open OR viewport is expanded
  if (shouldBeCompact) {
    return null;
  }

  const isWalletConnected = Boolean(walletAddress);

  return (
    <header 
      className={`z-20 flex items-center justify-center transition-all duration-300 ${shouldBeCompact ? 'p-[20px]' : 'p-[15px]'} ${
        isWalletConnected ? 'justify-between' : 'justify-center'
      }`}
      style={{ 
        borderTop: ``, // 1px solid #007AFF
        borderBottom: `1px solid rgba(0, 122, 255, 0.22)`
      }}
    >
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src={isDark ? '/what-swap-dark.svg' : '/what-swap-light.svg'}
            alt="What Swap"
            // width={60}
            // height={40}
            width={81}
            height={41}
            priority
          />
        </div>
        
        {/* TON Connect Button - only show when wallet is connected */}
        {isWalletConnected && <CustomTonConnectButton />}
    </header>
  );
}
