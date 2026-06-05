#!/usr/bin/env node
/**
 * Copies the correct Firebase GoogleService-Info.plist for the active variant.
 *
 * Bundle ID, display name, and app icon are now defined statically in
 * project.pbxproj build configurations (Debug-sengo / Release-sengo etc.)
 * and no longer need runtime mutation. This script only handles Firebase,
 * which must be in place before Xcode bundles resources.
 *
 * Usage: APP_ENV=sengo node scripts/sync-ios-variant.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const variantId = process.env.APP_ENV || process.env.APP_VARIANT || 'snlift';

const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'variants/manifest.json'), 'utf8'),
);
const variant = manifest[variantId];
if (!variant) {
  console.error(`Unknown variant: ${variantId}`);
  process.exit(1);
}

// Copy Firebase plist for this variant
const firebaseSrc = path.join(ROOT, 'ios/firebase', variantId, 'GoogleService-Info.plist');
const firebaseDest = path.join(ROOT, 'ios/GoogleService-Info.plist');
if (!fs.existsSync(firebaseSrc)) {
  console.error(`Missing Firebase plist: ${firebaseSrc}`);
  console.error('Add GoogleService-Info.plist from Firebase Console for this flavor.');
  process.exit(1);
}
fs.copyFileSync(firebaseSrc, firebaseDest);

console.log(`Synced → ${variant.appName} (${variant.bundleId})`);
console.log(`Firebase plist → ios/GoogleService-Info.plist (from firebase/${variantId}/)`);
console.log('Bundle ID, display name & app icon are set via Xcode build configurations.');
