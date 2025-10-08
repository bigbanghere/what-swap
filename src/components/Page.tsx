'use client';

import { backButton } from '@telegram-apps/sdk-react';
import { PropsWithChildren, useEffect } from 'react';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';
// Debug panels removed for production
import { useRouter } from 'next/navigation';

export function Page({ children, back = true }: PropsWithChildren<{
  /**
   * True if it is allowed to go back from this page.
   * @default true
   */
  back?: boolean
}>) {
  console.log('🎯 Page: Component rendering', { back });
  const router = useRouter();
  const { setNavigationFlags } = useKeyboardDetection();

  useEffect(() => {
    console.log('🎯 Page: Setting up backButton', { back });
    try {
      if (back) {
        console.log('🎯 Page: Showing backButton');
        backButton.show();
      } else {
        console.log('🎯 Page: Hiding backButton');
        backButton.hide();
      }
    } catch (error) {
      console.error('❌ Page: Error with backButton:', error);
    }
  }, [back]);

  useEffect(() => {
    console.log('🎯 Page: Setting up backButton onClick');
    try {
      return backButton.onClick(() => {
        console.log('🎯 Page: Back button clicked, navigating to /');
        try { setNavigationFlags(); } catch {}
        // Always navigate to main page instead of using browser history
        router.push('/');
      });
    } catch (error) {
      console.error('❌ Page: Error setting up backButton onClick:', error);
    }
  }, [router, setNavigationFlags]);

  return <>
    {children}
  </>;
}