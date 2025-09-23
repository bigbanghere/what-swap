'use client';

import { useState, useEffect } from 'react';
import { useTokensCache } from '@/hooks/use-tokens-cache';
import { useTheme } from '@/core/theme';
import { TOTAL_TOKENS } from '@/constants/tokens';

export function BackgroundLoadingIndicator() {
  // Return null to hide all loading messages from the main page
  return null;
}
