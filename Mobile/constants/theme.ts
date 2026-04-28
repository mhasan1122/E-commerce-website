export const theme = {
  colors: {
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    secondary: '#64748b',
    accent: '#f59e0b',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const formatPrice = (price: number): string => {
  return `৳${(price / 100).toFixed(2)}`;
};