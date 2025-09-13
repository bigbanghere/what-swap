'use client';

import { List } from '@telegram-apps/telegram-ui';

import { DisplayData } from '@/components/DisplayData/DisplayData';
import { Page } from '@/components/Page';
import { useSafeLaunchParams } from '@/hooks/use-safe-launch-params';

export default function LaunchParamsPage() {
  const { launchParams: lp } = useSafeLaunchParams();

  return (
    <Page>
      <List>
        <DisplayData
          rows={[
            { title: 'tgWebAppPlatform', value: lp.tgWebAppPlatform || 'N/A' },
            { title: 'tgWebAppShowSettings', value: (lp as any).tgWebAppShowSettings || 'N/A' },
            { title: 'tgWebAppVersion', value: lp.tgWebAppVersion || 'N/A' },
            { title: 'tgWebAppBotInline', value: (lp as any).tgWebAppBotInline || 'N/A' },
            { title: 'tgWebAppStartParam', value: (lp as any).tgWebAppStartParam || 'N/A' },
            { title: 'tgWebAppData', type: 'link', value: '/init-data' },
            {
              title: 'tgWebAppThemeParams',
              type: 'link',
              value: '/theme-params',
            },
          ]}
        />
      </List>
    </Page>
  );
}
