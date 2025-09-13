'use client';

import React from 'react';
import { Header } from './main/components/header';
import { Swap } from './main/components/swap';
import { Footer } from './main/components/footer';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';
import { useTheme } from '@/core/theme';

export default function Home() {
  const { colors } = useTheme();


  return (
    <div style={{ backgroundColor: colors.background, color: colors.text }} className="min-h-screen flex flex-col">
      <Header />
      <Swap />
      <Footer />
    </div>
  );
}
