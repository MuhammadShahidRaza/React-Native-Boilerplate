import { APP_VARIANT } from '@env';
import DeviceInfo from 'react-native-device-info';
import manifest from '../../variants/manifest.json';
import type { USER_TYPE } from 'types/auth';

export type VariantId = keyof typeof manifest;

export type VariantTheme = {
  primary: string;
  secondary: string;
  primaryDark: string;
  primaryLight: string;
};

export type VariantFeatures = {
  showGetStarted: boolean;
  showOnboarding: boolean;
  getStartedRoles: USER_TYPE[];
  defaultRole: USER_TYPE | null;
  consumerOnly: boolean;
  workerOnly: boolean;
};

export type AppVariant = {
  id: VariantId;
  appName: string;
  bundleId: string;
  displayNameIos: string;
  theme: VariantTheme;
  features: VariantFeatures;
  isAlphaPhase: boolean;
  getStartedDescriptionKey: string;
};

const variants = manifest as Record<VariantId, AppVariant>;

/** Native bundle id from the installed APK/IPA — reliable when Metro used the wrong .env.* file. */
function resolveVariantIdFromBundleId(): VariantId | null {
  try {
    const bundleId = DeviceInfo.getBundleId();
    const match = (Object.entries(variants) as [VariantId, AppVariant][]).find(
      ([, v]) => v.bundleId === bundleId,
    );
    return match?.[0] ?? null;
  } catch {
    return null;
  }
}

function resolveVariantId(): VariantId {
  const fromNative = resolveVariantIdFromBundleId();
  if (fromNative) return fromNative;

  const raw = (APP_VARIANT || 'snlift').trim();
  if (raw in variants) return raw as VariantId;
  return 'snlift';
}

export const VARIANT_ID = resolveVariantId();

export const VARIANT: AppVariant = variants[VARIANT_ID] ?? variants.snlift;

export function variantHasRole(role: USER_TYPE): boolean {
  if (VARIANT.features.consumerOnly) return role === 'user';
  if (VARIANT.features.workerOnly) return role === 'courier' || role === 'driver';
  return true;
}
