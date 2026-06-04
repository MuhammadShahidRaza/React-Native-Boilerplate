import { VARIANT_ID } from 'config/variant';
import { IMAGES } from './images';

/** Raster assets for Sengo flavors (splash cloud, onboarding hero). */
export const SENGO_IMAGES = {
  CLOUD: require('assets/images/variants/sengo/cloud.png'),
  ONBOARDING: require('assets/images/variants/sengo/onboarding.png'),
} as const;

export const SENGO_VIDEOS = {
  SPLASH_DELIVERY: require('assets/videos/sengo/splash-delivery.mp4'),
} as const;

const SNLIFT_ONBOARDING = {
  one: IMAGES.ONBOARDING_ONE,
  two: IMAGES.ONBOARDING_TWO,
  three: IMAGES.ONBOARDING_THREE,
} as const;

const SENGO_ONBOARDING = {
  one: SENGO_IMAGES.ONBOARDING,
  two: SENGO_IMAGES.ONBOARDING,
  three: SENGO_IMAGES.ONBOARDING,
} as const;

/** Onboarding slide images for the active app flavor. */
export function getVariantOnboardingImages() {
  if (VARIANT_ID === 'sengo') {
    return SENGO_ONBOARDING;
  }
  return SNLIFT_ONBOARDING;
}

/** Sengo consumer app uses a single onboarding slide. */
export function getVariantOnboardingPageCount(): number {
  return VARIANT_ID === 'sengo' ? 1 : 3;
}

export function getVariant() {
  return VARIANT_ID;
}
