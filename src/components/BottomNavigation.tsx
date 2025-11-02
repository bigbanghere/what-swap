'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/core/theme';
import { IoSwapHorizontal, IoChatbubbleEllipses, IoHome } from 'react-icons/io5';
import { useKeyboardDetection } from '@/hooks/use-keyboard-detection';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    path: '/',
    label: 'Swap',
    icon: <IoSwapHorizontal className="w-6 h-6" />,
  },
  {
    path: '/assistant',
    label: 'Assistant',
    icon: <IoChatbubbleEllipses className="w-6 h-6" />,
  },
];

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { isInputFocused } = useKeyboardDetection();

  // Hide navigation when keyboard is open
  if (isInputFocused) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border || 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <nav className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`
              flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg
              transition-all duration-200
              ${isActive(item.path) ? 'opacity-100' : 'opacity-60'}
            `}
            style={{
              color: isActive(item.path) ? colors.primary : colors.text,
            }}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
            {isActive(item.path) && (
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-t-full"
                style={{ backgroundColor: colors.primary }}
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

