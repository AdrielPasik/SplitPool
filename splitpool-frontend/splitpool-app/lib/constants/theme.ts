export const COLORS = {
  primary: {
    50: '#f0fffe',
    100: '#e0fffe',
    200: '#b9faf8',
    300: '#8ff5f2',
    400: '#5ee8e3',
    500: '#3dd4ce',
    600: '#2aaba6',
  },
  neutral: {
    50: '#f8fffe',
    100: '#f1fffe',
    200: '#e4f9f8',
    300: '#c5e9e8',
    400: '#94c5c4',
    500: '#6a9a99',
    600: '#4a7170',
    700: '#345051',
    800: '#243839',
    900: '#1a2829',
  },
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#ef4444',
  info: '#3b82f6',
  status: {
    pending: '#fbbf24',
    approved: '#4ade80',
    paid: '#10b981',
    collecting: '#3b82f6',
    closed: '#6b7280',
  },
  background: {
    primary: '#ffffff',
    secondary: '#f8fffe',
    tertiary: '#f0fffe',
    dark: '#1a2829',
  },
  text: {
    primary: '#1a2829',
    secondary: '#4a7170',
    tertiary: '#94c5c4',
    inverse: '#ffffff',
    accent: '#2aaba6',
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyLarge: { fontSize: 18, fontWeight: '400' as const, lineHeight: 28 },
  bodySm: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};