"use client";

import { useEffect } from 'react';
import { initializeTelegramAnalytics } from '@/lib/telegram-analytics';

export function TelegramAnalyticsInitializer() {
  useEffect(() => {
    console.log('🔄 TelegramAnalyticsInitializer: Starting initialization...');
    // Initialize Telegram Analytics on the client side
    initializeTelegramAnalytics();
    console.log('🔄 TelegramAnalyticsInitializer: Initialization call completed');
  }, []);

  // This component doesn't render anything
  return null;
}
