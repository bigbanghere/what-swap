'use client';

import { useState, useEffect } from 'react';
import { useTokensCache } from '@/hooks/use-tokens-cache';
import { useDefaultTokens } from '@/hooks/use-default-tokens';
import { useTheme } from '@/core/theme';

export function BackgroundLoadingIndicator() {
  // Disabled - no loading indicator will be shown
  return null;
}
