"use client";

import TelegramAnalytics from '@telegram-apps/analytics';

// Initialize Telegram Analytics
// This should be called before the app starts rendering
export function initializeTelegramAnalytics() {
  try {
    // Initialize with the provided token
    TelegramAnalytics.init({
      token: 'eyJhcHBfbmFtZSI6IndoYXRfc3dhcCIsImFwcF91cmwiOiJodHRwczovL3QubWUvd2hhdF9zd2FwX2JvdCIsImFwcF9kb21haW4iOiJodHRwczovL3doYXQtc3dhcC52ZXJjZWwuYXBwLyJ9!uxYV3XHq2mzYKZPap/PtGcgmvhC5hC1KTwrqBt6gyHk=',
      appName: 'what_swap',
    });
    
    console.log('✅ Telegram Analytics initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Telegram Analytics:', error);
  }
}

// Export the analytics instance for use throughout the app
// Note: Telegram Analytics automatically tracks 99% of events without manual control
export { TelegramAnalytics };
