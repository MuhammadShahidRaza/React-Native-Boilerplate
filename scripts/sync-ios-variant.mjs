#!/usr/bin/env node
/**
 * Sync iOS native config per flavor: bundle ID, display name, Firebase plist.
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

const iosAppIconName = variantId === 'snlift' ? 'AppIcon' : 'AppIconSengo';

const pbxprojPath = path.join(ROOT, 'ios/snlift.xcodeproj/project.pbxproj');
let pbx = fs.readFileSync(pbxprojPath, 'utf8');
pbx = pbx.replace(
  /PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g,
  `PRODUCT_BUNDLE_IDENTIFIER = ${variant.bundleId};`,
);
pbx = pbx.replace(
  /INFOPLIST_KEY_CFBundleDisplayName = [^;]+;/g,
  `INFOPLIST_KEY_CFBundleDisplayName = "${variant.displayNameIos}";`,
);
pbx = pbx.replace(
  /ASSETCATALOG_COMPILER_APPICON_NAME = [^;]+;/g,
  `ASSETCATALOG_COMPILER_APPICON_NAME = ${iosAppIconName};`,
);
fs.writeFileSync(pbxprojPath, pbx);

const infoPlistPath = path.join(ROOT, 'ios/snlift/Info.plist');
let plist = fs.readFileSync(infoPlistPath, 'utf8');
plist = plist.replace(
  /<key>CFBundleDisplayName<\/key>\s*<string>[^<]*<\/string>/,
  `<key>CFBundleDisplayName</key>\n\t<string>${variant.displayNameIos}</string>`,
);
fs.writeFileSync(infoPlistPath, plist);

// Info.plist hardcodes CFBundlePrimaryIcon — must match ASSETCATALOG_COMPILER_APPICON_NAME
plist = fs.readFileSync(infoPlistPath, 'utf8');
plist = plist.replace(
  /(<key>CFBundlePrimaryIcon<\/key>\s*<dict>\s*<key>CFBundleIconName<\/key>\s*<string>)[^<]*(<\/string>)/,
  `$1${iosAppIconName}$2`,
);
fs.writeFileSync(infoPlistPath, plist);

const firebaseSrc = path.join(ROOT, 'ios/firebase', variantId, 'GoogleService-Info.plist');
const firebaseDest = path.join(ROOT, 'ios/GoogleService-Info.plist');
if (!fs.existsSync(firebaseSrc)) {
  console.error(`Missing Firebase plist: ${firebaseSrc}`);
  console.error('Add GoogleService-Info.plist from Firebase Console for this flavor.');
  process.exit(1);
}
fs.copyFileSync(firebaseSrc, firebaseDest);
console.log(`Firebase plist → ios/GoogleService-Info.plist (from firebase/${variantId}/)`);

const exportPlistPath = path.join(ROOT, 'ios/ExportOptions.plist');
if (fs.existsSync(exportPlistPath)) {
  const exportPlist = fs.readFileSync(exportPlistPath, 'utf8');
  const teamMatch = exportPlist.match(/<key>teamID<\/key>\s*<string>([^<]+)<\/string>/);
  if (teamMatch) {
    console.log(`iOS variant: ${variant.appName} (${variant.bundleId}), team ${teamMatch[1]}`);
  }
}

console.log(`Synced iOS → ${variant.appName} (${variant.bundleId}), app icon ${iosAppIconName}`);
console.log(`Info.plist CFBundlePrimaryIcon → ${iosAppIconName}`);
