#!/usr/bin/env node
/**
 * Sync iOS MARKETING_VERSION and CURRENT_PROJECT_VERSION from package.json.
 * Run after bumping version or when iOS shows wrong version/build.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const pbxPath = path.join(root, 'ios/yourappname.xcodeproj/project.pbxproj');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version || '1.0.0';
const versionCode = pkg.versionCode != null ? String(pkg.versionCode) : '1';

let pbx = fs.readFileSync(pbxPath, 'utf8');
pbx = pbx.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`);
pbx = pbx.replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${versionCode};`);
fs.writeFileSync(pbxPath, pbx);

console.log(`Synced iOS: MARKETING_VERSION=${version}, CURRENT_PROJECT_VERSION=${versionCode}`);
