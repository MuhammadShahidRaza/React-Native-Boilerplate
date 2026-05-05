/**
 * Brand tokens — single source of truth for primary green, secondary blue,
 * consumer hub accents, theme `LIGHT_COLORS` / `DARK_COLORS`, and gradients.
 */
export const BRAND_PRIMARY = '#00B76C';
export const BRAND_SECONDARY = '#004AAD';

const BRAND_PRIMARY_DARK = '#009058';
const BRAND_PRIMARY_LIGHT = '#33C88E';

// Base colors that never change with light/dark theme toggle
const BASE_COLORS = {
  PRIMARY_LIGHT: '#051229',
  PRIMARY_DARK: '#0AC8FF',
  SECONDARY: BRAND_SECONDARY,
  ERROR: '#FB344F',
  GREEN_STATUS: '#00B406',
  NOTIFICATION_ICON_BACKGROUND: '#FFDED4',

  LIGHT_ORANGE: '#FFA082',
  WHITE: '#FFFFFF',
  LIGHT_WHITE: '#FAFBFF',
  BLACK: '#000000',
  BLUE: '#0000FF',
  DARK_BLUE: '#173C47',
  LIGHT_GREY: '#D9D9D9',
  DARK_GREY: '#858585',
  MEDIUM_GREY: '#343434',
  PURPLE: '#800080',
  RED: '#FF0000',
  GREEN: '#008000',
  YELLOW: '#FFFF00',
  ORANGE: '#FFA500',
  PINK: '#FFC0CB',
  CYAN: '#00FFFF',
  MAGENTA: '#FF00FF',
  LIME: '#00FF00',
  TEAL: '#008080',
  INDIGO: '#4B0082',
  BROWN: '#A52A2A',
  SILVER: '#C0C0C0',
  GOLD: '#FFD700',
  MAROON: '#800000',
  NAVY: '#000080',
  OLIVE: '#808000',
  GRAY: '#808080',
  SKY_BLUE: '#87CEEB',
  CORAL: '#FF7F50',
  LAVENDER: '#E6E6FA',
  TURQUOISE: '#40E0D0',
  SALMON: '#FA8072',
  CRIMSON: '#DC143C',
  DARK_GREEN: '#006400',
  DARK_ORANGE: '#FF8C00',
  DARK_RED: '#8B0000',
  DARK_VIOLET: '#9400D3',
  FIRE_BRICK: '#B22222',
  FOREST_GREEN: '#228B22',
  DARK_SLATE_GRAY: '#2F4F4F',
  LIGHT_CORAL: '#F08080',
  LIGHT_SEA_GREEN: '#20B2AA',
  MEDIUM_BLUE: '#0000CD',
  MEDIUM_VIOLETRED: '#C71585',
  MID_NIGHT_BLUE: '#191970',
  PERU: '#CD853F',
  ROSY_BROWN: '#BC8F8F',
  SIENNA: '#A0522D',
  SLATE_BLUE: '#6A5ACD',
  TOMATO: '#FF6347',
  STEEL_BLUE: '#4682B4',
  TRANSPARENT: 'transparent',
  DARK_BLACK_OPACITY: 'rgba(2,2,2,0.8)',
  MEDIUM_BLACK_OPACITY: 'rgba(2,2,2,0.6)',
  WHITE_OPACITY: 'rgba(255, 255, 255, 0.4)',
  INHERIT: 'inherit',

  /**
   * Shared multi-service UI (rides, parcel, food, hub) — same for every role.
   * Derived from `BRAND_*` + fixed neutrals (not “consumer-only”).
   */
  APP_PRIMARY: BRAND_PRIMARY,
  APP_PRIMARY_DARK: BRAND_PRIMARY_DARK,
  APP_PRIMARY_LIGHT: BRAND_PRIMARY_LIGHT,
  APP_SECONDARY: BRAND_SECONDARY,
  APP_TINT_SOFT: '#E8EEF9',
  APP_SURFACE: '#F3F4F6',
  APP_TEXT: '#111827',
  APP_TEXT_MUTED: '#6B7280',
  APP_LINE: '#E5E7EB',
  APP_MAP_BG: '#E8EAED',
  APP_DANGER_BG: '#FFE4E6',
  APP_DANGER_TEXT: '#BE123C',
  APP_STAR: '#FBBF24',
  APP_CHIP_INACTIVE: '#F9FAFB',
};

/** Primary brand gradients for `LinearGradient` (all roles) */
export const APP_GRADIENT_PRIMARY = [BRAND_PRIMARY, BRAND_PRIMARY_DARK] as const;
export const APP_GRADIENT_PRIMARY_LIGHT = [BRAND_PRIMARY, BRAND_PRIMARY_LIGHT] as const;

// Light theme colors (merged into COLORS when not dark)
const LIGHT_COLORS = {
  PRIMARY: BRAND_PRIMARY,
  BUTTON_BACKGROUND: BRAND_SECONDARY,
  BACKGROUND: '#F7FAFC',
  SURFACE: '#FFFFFF',
  CARD: '#FFFFFF',
  TEXT: '#0F172A',
  TEXT_SECONDARY: '#475569',
  TEXT_INVERSE: '#FFFFFF',
  BORDER: '#E2E8F0',
  INPUT_BACKGROUND: '#F1F5F9',
  HEADER: '#FFFFFF',
  ICONS: '#475569',
  SEARCH_BAR: '#F1F5F9',
  DIVIDER: '#E2E8F0',
  PLACEHOLDER: '#94A3B8',
  APP_ICON: BRAND_SECONDARY,
  BOTTOM_NAVIGATION_BAR: BRAND_SECONDARY,
  SKELETON_BACKGROUND: '#E2E8F0',
  SKELETON_HIGHLIGHT: '#C8E6D9',
};

// Dark theme colors
const DARK_COLORS = {
  PRIMARY: BRAND_PRIMARY,
  BUTTON_BACKGROUND: BRAND_SECONDARY,
  BACKGROUND: '#0B1220',
  SURFACE: '#141C2E',
  CARD: '#1A2438',
  TEXT: '#F1F5F9',
  TEXT_SECONDARY: '#94A3B8',
  TEXT_INVERSE: '#0F172A',
  BORDER: '#2D3A52',
  INPUT_BACKGROUND: '#1A2438',
  HEADER: '#141C2E',
  ICONS: '#94A3B8',
  SEARCH_BAR: '#1A2438',
  DIVIDER: '#2D3A52',
  PLACEHOLDER: '#64748B',
  APP_ICON: '#FFFFFF',
  BOTTOM_NAVIGATION_BAR: '#003380',
  SKELETON_BACKGROUND: '#1A2438',
  SKELETON_HIGHLIGHT: '#1E3A2F',
};

// Mutable COLORS object - gets updated by ThemeProvider
export const COLORS = {
  ...BASE_COLORS,
  ...LIGHT_COLORS,
};

// Function to update COLORS (called by ThemeProvider)
export const updateColors = (isDark: boolean) => {
  const themeColors = isDark ? DARK_COLORS : LIGHT_COLORS;
  Object.assign(COLORS, themeColors);
};

// For backwards compatibility
export const getThemeColors = (isDark: boolean) => ({
  ...BASE_COLORS,
  ...(isDark ? DARK_COLORS : LIGHT_COLORS),
});
