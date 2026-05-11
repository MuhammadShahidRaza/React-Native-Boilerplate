import { FontSize } from 'types/fontTypes';
import { COLORS } from './colors';

/**
 * Single source of truth for all form controls: Input, Dropdown, Autocomplete, PhoneInput.
 * Use with COLORS from utils (e.g. COLORS.ICONS, COLORS.TEXT, COLORS.PLACEHOLDER, COLORS.ERROR).
 */
export const INPUT_THEME = {
  title: {
    fontSize: FontSize.MediumSmall,
    marginBottom: 6,
  },
  value: {
    fontSize: FontSize.MediumSmall,
  },
  placeholder: {
    fontSize: FontSize.MediumSmall,
  },
  error: {
    fontSize: FontSize.Small,
  },
  option: {
    fontSize: FontSize.MediumSmall,
  },
  input: {
    height: 50,
    borderRadius: 50,
    borderRadiusInline: 15,
  },
  inputBackground: {
    backgroundColor: COLORS.SURFACE,
  },
  autocomplete: {
    height: 45,
  },
} as const;
