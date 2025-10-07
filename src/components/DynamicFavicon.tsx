"use client";

import { useEffect } from 'react';
import { useTheme } from '@/core/theme/provider';

export function DynamicFavicon() {
  const { isDark, theme } = useTheme();

  useEffect(() => {
    console.log('🎨 DynamicFavicon: Theme change detected', {
      isDark,
      theme,
      timestamp: new Date().toISOString(),
      willUseFavicon: isDark ? 'favicon-dark.png' : 'favicon-light.png'
    });

    // Function to update favicon
    const updateFavicon = (href: string) => {
      try {
        console.log('🎨 DynamicFavicon: Updating favicon to:', href);
        
        // Remove existing favicon links (but keep apple-touch-icon)
        const existingLinks = document.querySelectorAll('link[rel="icon"]');
        console.log('🎨 DynamicFavicon: Removing existing favicon links:', existingLinks.length);
        existingLinks.forEach(link => link.remove());

        // Create new favicon link
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = href;
        document.head.appendChild(link);
        console.log('🎨 DynamicFavicon: Added new favicon link:', href);

        // Also create a shortcut icon link for better compatibility
        const shortcutLink = document.createElement('link');
        shortcutLink.rel = 'shortcut icon';
        shortcutLink.type = 'image/x-icon';
        shortcutLink.href = href;
        document.head.appendChild(shortcutLink);
        console.log('🎨 DynamicFavicon: Added shortcut icon link:', href);

        // Update apple-touch-icon for better mobile support
        const appleLink = document.querySelector('link[rel="apple-touch-icon"]');
        if (appleLink) {
          appleLink.setAttribute('href', href);
          console.log('🎨 DynamicFavicon: Updated existing apple-touch-icon:', href);
        } else {
          const newAppleLink = document.createElement('link');
          newAppleLink.rel = 'apple-touch-icon';
          newAppleLink.href = href;
          document.head.appendChild(newAppleLink);
          console.log('🎨 DynamicFavicon: Added new apple-touch-icon:', href);
        }

        // Log all favicon links after update
        const allFaviconLinks = document.querySelectorAll('link[rel*="icon"]');
        console.log('🎨 DynamicFavicon: All favicon links after update:', 
          Array.from(allFaviconLinks).map(link => ({
            rel: link.getAttribute('rel'),
            href: link.getAttribute('href'),
            type: link.getAttribute('type')
          }))
        );

      } catch (error) {
        console.error('🎨 DynamicFavicon: Error updating favicon:', error);
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      console.log('🎨 DynamicFavicon: Timeout triggered, updating favicon');
      // Update favicon based on theme
      if (isDark) {
        updateFavicon('/favicon-dark.png');
      } else {
        updateFavicon('/favicon-light.png');
      }
    }, 100);

    return () => {
      console.log('🎨 DynamicFavicon: Cleanup timeout');
      clearTimeout(timeoutId);
    };
  }, [isDark, theme]);

  return null; // This component doesn't render anything
}
