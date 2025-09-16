import { mockTelegramEnv, isTMA, emitEvent } from '@telegram-apps/sdk-react';

let mockViewportExpanded = false;

// Function to update viewport state (call this after changing mockViewportExpanded)
export function updateMockViewport() {
  emitEvent('viewport_changed', {
    height: window.innerHeight,
    width: window.innerWidth,
    is_expanded: mockViewportExpanded,
    is_state_stable: true,
  });
  
  // Also dispatch custom event for our hook to listen to
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mockViewportChanged', {
      detail: { isExpanded: mockViewportExpanded }
    }));
  }
}

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).updateMockViewport = updateMockViewport;
  (window as any).setExpanded = (expanded: boolean) => {
    mockViewportExpanded = expanded;
    updateMockViewport();
    console.log('🔄 Mock viewport set to:', expanded ? 'EXPANDED' : 'COMPACT');
  };
}

// It is important, to mock the environment only for development purposes. When building the
// application, the code inside will be tree-shaken, so you will not see it in your final bundle.
export async function mockEnv(): Promise<void> {
  console.log('🔧 Initializing mock environment...');
  
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    const isTma = await isTMA('complete');
    console.log('🔍 TMA check result:', isTma);
    
    if (!isTma) {
      console.log('🎭 Setting up mock environment...'); 
      const themeParams = {
        accent_text_color: '#6ab2f2',
        bg_color: '#17212b',
        button_color: '#5288c1',
        button_text_color: '#ffffff',
        destructive_text_color: '#ec3942',
        header_bg_color: '#17212b',
        hint_color: '#708499',
        link_color: '#6ab3f3',
        secondary_bg_color: '#232e3c',
        section_bg_color: '#17212b',
        section_header_text_color: '#6ab3f3',
        subtitle_text_color: '#708499',
        text_color: '#f5f5f5',
      } as const;
      const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;
  
      mockTelegramEnv({
        onEvent(e) {
          // Here you can write your own handlers for all known Telegram Mini Apps methods.
          if (e[0] === 'web_app_request_theme') {
            return emitEvent('theme_changed', { theme_params: themeParams });
          }
          if (e[0] === 'web_app_request_viewport') {
            return emitEvent('viewport_changed', {
              height: window.innerHeight,
              width: window.innerWidth,
              is_expanded: mockViewportExpanded,
              is_state_stable: true,
            });
          }
          if (e[0] === 'web_app_request_content_safe_area') {
            return emitEvent('content_safe_area_changed', noInsets);
          }
          if (e[0] === 'web_app_request_safe_area') {
            return emitEvent('safe_area_changed', noInsets);
          }
        },
        launchParams: new URLSearchParams([
          // Discover more launch parameters:
          // https://docs.telegram-mini-apps.com/platform/launch-parameters#parameters-list
          ['tgWebAppThemeParams', JSON.stringify(themeParams)],
          // Your init data goes here. Learn more about it here:
          // https://docs.telegram-mini-apps.com/platform/init-data#parameters-list
          //
          // Note that to make sure, you are using a valid init data, you must pass it exactly as it
          // is sent from the Telegram application. The reason is in case you will sort its keys
          // (auth_date, hash, user, etc.) or values your own way, init data validation will more
          // likely to fail on your server side. So, to make sure you are working with a valid init
          // data, it is better to take a real one from your application and paste it here. It should
          // look something like this (a correctly encoded URL search params):
          // ```
          // user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22...
          // ```
          // But in case you don't really need a valid init data, use this one:
          ['tgWebAppData', new URLSearchParams([
            ['auth_date', (new Date().getTime() / 1000 | 0).toString()],
            ['hash', 'some-hash'],
            ['signature', 'some-signature'],
            ['user', JSON.stringify({ 
              id: 1, 
              first_name: 'Vladislav',
              language_code: 'en' // Change to 'ru' to test Russian
            })],
          ]).toString()],
          ['tgWebAppVersion', '8.4'],
          ['tgWebAppPlatform', 'tdesktop'],
        ]),
      });
  
      console.info(
        '⚠️ As long as the current environment was not considered as the Telegram-based one, it was mocked. Take a note, that you should not do it in production and current behavior is only specific to the development process. Environment mocking is also applied only in development mode. So, after building the application, you will not see this behavior and related warning, leading to crashing the application outside Telegram.',
      );
      console.log('✅ Mock environment setup complete');
    }
  } catch (error) {
    console.log('⚠️ Error during TMA check, assuming browser environment:', error);
    // If we can't determine if we're in TMA, assume we're in browser and set up mock
    console.log('🎭 Setting up mock environment for browser...'); 
    const themeParams = {
      accent_text_color: '#6ab2f2',
      bg_color: '#17212b',
      button_color: '#5288c1',
      button_text_color: '#ffffff',
      destructive_text_color: '#ec3942',
      header_bg_color: '#17212b',
      hint_color: '#708499',
      link_color: '#6ab3f3',
      secondary_bg_color: '#232e3c',
      section_bg_color: '#17212b',
      section_header_text_color: '#6ab3f3',
      subtitle_text_color: '#708499',
      text_color: '#f5f5f5',
    } as const;
    const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

    mockTelegramEnv({
      onEvent(e) {
        if (e[0] === 'web_app_request_theme') {
          return emitEvent('theme_changed', { theme_params: themeParams });
        }
        if (e[0] === 'web_app_request_viewport') {
          return emitEvent('viewport_changed', {
            height: window.innerHeight,
            width: window.innerWidth,
            is_expanded: mockViewportExpanded,
            is_state_stable: true,
          });
        }
        if (e[0] === 'web_app_request_content_safe_area') {
          return emitEvent('content_safe_area_changed', noInsets);
        }
        if (e[0] === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', noInsets);
        }
      },
      launchParams: new URLSearchParams([
        ['tgWebAppThemeParams', JSON.stringify(themeParams)],
        ['tgWebAppData', new URLSearchParams([
          ['auth_date', (new Date().getTime() / 1000 | 0).toString()],
          ['hash', 'some-hash'],
          ['signature', 'some-signature'],
          ['user', JSON.stringify({ 
            id: 1, 
            first_name: 'Vladislav',
            language_code: 'en'
          })],
        ]).toString()],
        ['tgWebAppVersion', '8.4'],
        ['tgWebAppPlatform', 'tdesktop'],
      ]),
    });

    console.log('✅ Mock environment setup complete for browser');
  }
}
