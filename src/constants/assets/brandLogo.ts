import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';
import LOGO_WITH_NAME from 'assets/svg/common/logoWithName.svg';
import SENGO_LOGO_LIGHT from 'assets/svg/sengo/logoLight.svg';
import SENGO_LOGO_DARK from 'assets/svg/sengo/logoDark.svg';
import { VARIANT_ID } from 'config/variant';

export type BrandLogoTone = 'light' | 'dark';

/** logo-light.png (350×343) */
const SENGO_LOGO_LIGHT_ASPECT = 343 / 350;
/** logo-dark.png (1024×1024) */
const SENGO_LOGO_DARK_ASPECT = 1;

/** SN Lift wordmark aspect (from logoWithName.svg viewBox). */
export const SNLIFT_LOGO_ASPECT = 69.794 / 219.578;

export function isSengoBrand(): boolean {
  return VARIANT_ID === 'sengo' || VARIANT_ID === 'sengoWorkers';
}

/** Wordmark SVG for the active flavor. Light = for pale backgrounds, dark = for black splash. */
export function getBrandLogoSvg(tone: BrandLogoTone = 'light'): FC<SvgProps> {
  if (isSengoBrand()) {
    return tone === 'dark' ? SENGO_LOGO_DARK : SENGO_LOGO_LIGHT;
  }
  return LOGO_WITH_NAME;
}

/** Width/height ratio (height = width * aspect). */
export function getBrandLogoAspect(tone: BrandLogoTone = 'light'): number {
  if (!isSengoBrand()) return SNLIFT_LOGO_ASPECT;
  return tone === 'dark' ? SENGO_LOGO_DARK_ASPECT : SENGO_LOGO_LIGHT_ASPECT;
}
