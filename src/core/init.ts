import {
  setDebug,
  mountBackButton,
  restoreInitData,
  init as initSDK,
  mountMiniAppSync,
  bindThemeParamsCssVars,
  mountViewport,
  bindViewportCssVars,
  mockTelegramEnv,
  type ThemeParams,
  themeParamsState,
  retrieveLaunchParams,
  emitEvent,
} from '@telegram-apps/sdk-react';

/**
 * Initializes the application and configures its dependencies.
 */
export async function init(options: {
  debug: boolean;
  eruda: boolean;
  mockForMacOS: boolean;
}): Promise<void> {
  // Set @telegram-apps/sdk-react debug mode and initialize it.
  setDebug(options.debug);
  initSDK();

  // Add Eruda if needed.
  options.eruda &&
    void import('eruda').then(({ default: eruda }) => {
      eruda.init();
      eruda.position({ x: window.innerWidth - 50, y: 0 });
    });

  // Telegram for macOS has a ton of bugs, including cases, when the client doesn't
  // even response to the "web_app_request_theme" method. It also generates an incorrect
  // event for the "web_app_request_safe_area" method.
  if (options.mockForMacOS) {
    let firstThemeSent = false;
    mockTelegramEnv({
      onEvent(event, next) {
        if (event[0] === 'web_app_request_theme') {
          let tp: ThemeParams = {};
          if (firstThemeSent) {
            tp = themeParamsState();
          } else {
            firstThemeSent = true;
            try {
              tp ||= retrieveLaunchParams().tgWebAppThemeParams;
            } catch (error) {
              console.log('⚠️ Could not retrieve launch params for theme, using fallback');
              // Use fallback theme params
              tp = {
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
              };
            }
          }
          return emitEvent('theme_changed', { theme_params: tp });
        }

        if (event[0] === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
          });
        }

        next();
      },
    });
  }

  // Mount all components used in the project.
  mountBackButton.ifAvailable();
  restoreInitData();

  if (mountMiniAppSync.isAvailable()) {
    mountMiniAppSync();
    bindThemeParamsCssVars();
  }

  if (mountViewport.isAvailable()) {
    mountViewport().then(() => {
      bindViewportCssVars();
    });
  }
}
