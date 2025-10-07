"use client";

import { useEffect } from 'react';
import { useTheme } from '@/core/theme/provider';

export function DynamicFavicon() {
  const { isDark } = useTheme();

  useEffect(() => {
    // Function to update favicon
    const updateFavicon = (href: string) => {
      try {
        // Remove existing favicon links (but keep apple-touch-icon)
        const existingLinks = document.querySelectorAll('link[rel="icon"]');
        existingLinks.forEach(link => link.remove());

        // Create new favicon link
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = href;
        document.head.appendChild(link);

        // Also create a shortcut icon link for better compatibility
        const shortcutLink = document.createElement('link');
        shortcutLink.rel = 'shortcut icon';
        shortcutLink.type = 'image/x-icon';
        shortcutLink.href = href;
        document.head.appendChild(shortcutLink);

        // Update apple-touch-icon for better mobile support
        const appleLink = document.querySelector('link[rel="apple-touch-icon"]');
        if (appleLink) {
          appleLink.setAttribute('href', href);
        } else {
          const newAppleLink = document.createElement('link');
          newAppleLink.rel = 'apple-touch-icon';
          newAppleLink.href = href;
          document.head.appendChild(newAppleLink);
        }

      } catch (error) {
        console.error('Error updating favicon:', error);
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Update favicon based on theme
      if (isDark) {
        updateFavicon('/favicon-dark.png');
      } else {
        updateFavicon('/favicon-light.png');
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isDark]);

  return null; // This component doesn't render anything
}
