#!/usr/bin/env node
/**
 * Bump package.json version only.
 * - Android: versionName from package.json, versionCode from version-code.txt (bumps on release AAB/APK only).
 * - iOS: version and build are injected into Info.plist on every Xcode build by Run Script (scripts/update-ios-version.sh).
 * Usage: node scripts/bump-version.js [patch|minor|major]
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const bump = process.argv[2] || 'patch';
if (!['patch', 'minor', 'major'].includes(bump)) {
  console.error('Usage: node scripts/bump-version.js [patch|minor|major]');
  process.exit(1);
}
execSync(`npm version ${bump} --no-git-tag-version`, { cwd: root, stdio: 'inherit' });
require('./sync-ios-version.js');
console.log(`Bumped ${bump}. Android: build AAB/APK (versionCode auto-increments on release). iOS: synced from package.json.`);
