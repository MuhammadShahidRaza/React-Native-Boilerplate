#!/usr/bin/env node
/**
 * Replaces template "yourappname", updates bundle ID (iOS + Android), renames iOS tree,
 * and moves Android Kotlin sources to match the new package path.
 *
 * Accepts any friendly casing: "MyAppName", "my app name", "MY-APP", etc.
 * — slug (lowercase, no spaces) for technical IDs; display title for labels / merchant name.
 *
 * Usage:
 *   yarn rename-app
 *     → prompts for app name, then bundle ID (Enter = com.cmolds.<slug>)
 *   yarn rename-app MyNewApp [com.bundle.id]
 *     → non-interactive (CI / scripts)
 *
 * Then: cd ios && bundle exec pod install
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.resolve(__dirname, '..');
const OLD = 'yourappname';
const OLD_PASCAL = 'YourAppName';
const OLD_UPPER = 'YOURAPPNAME';
const OLD_BUNDLE_PREFIX = 'com.cmolds.yourappname';
/** Temporary marker — must not appear in repo before run */
const PLACE = '__BOILERPLATE_APP_NAME_TOKEN__';

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  'Pods',
  'build',
  '.gradle',
  'DerivedData',
  'coverage',
  '.bundle',
  'vendor',
]);

/**
 * Split "MyAppName", "my-app", "MY APP NAME" into lowercase word tokens.
 */
function tokenizeAppName(raw) {
  const s = String(raw).trim();
  if (!s) return [];
  const withSpaces = s
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  return withSpaces
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

function deriveNames(raw) {
  const words = tokenizeAppName(raw);
  if (words.length === 0) return null;
  const slug = words.join('');
  if (!/^[a-z][a-z0-9]*$/.test(slug)) return null;
  const pascal = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const displayTitle = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const upperFlat = slug.toUpperCase();
  return { words, slug, pascal, displayTitle, upperFlat };
}

function normalizeBundleId(input) {
  if (input == null || input === '') return null;
  const s = String(input).trim().toLowerCase();
  if (!s) return null;
  if (!/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test(s)) {
    console.error(
      'Invalid bundle ID. Use reverse-DNS form, e.g. com.mycompany.myapp (lowercase segments).',
    );
    process.exit(1);
  }
  return s;
}

function isProbablyBinary(buf) {
  const sample = buf.subarray(0, Math.min(buf.length, 8192));
  for (let i = 0; i < sample.length; i++) {
    if (sample[i] === 0) return true;
  }
  return false;
}

function shouldSkipDir(absPath, name) {
  if (SKIP_DIR_NAMES.has(name)) return true;
  const rel = path.relative(ROOT, absPath);
  if (rel.startsWith(`node_modules${path.sep}`)) return true;
  if (rel.startsWith(`android${path.sep}app${path.sep}build`)) return true;
  if (rel.startsWith(`android${path.sep}.gradle`)) return true;
  return false;
}

function walkFiles(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (shouldSkipDir(full, ent.name)) continue;
      walkFiles(full, out);
    } else if (ent.isFile()) {
      out.push(full);
    }
  }
}

function escapeXmlText(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeForSingleQuotedJs(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function escapeForDoubleQuotedGroovy(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$');
}

function escapeRegexToken(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertSafeDisplayTitle(s) {
  if (/[\r\n"]/.test(s)) {
    console.error(
      'App display name cannot contain newlines or double quotes. Use a simpler title.',
    );
    process.exit(1);
  }
}

/** Xcode build setting value (may contain spaces). */
function xcodeQuotedSetting(s) {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function resolvePlaceholders(relPath, text, ctx) {
  const r = relPath.split(path.sep).join('/');

  if (r === 'app.json') {
    assertSafeDisplayTitle(ctx.displayTitle);
    return text
      .split('\n')
      .map((line) => {
        if (/^\s*"displayName"\s*:/.test(line)) {
          return line.split(PLACE).join(ctx.displayTitle);
        }
        return line.split(PLACE).join(ctx.slug);
      })
      .join('\n');
  }

  if (r === 'package.json') {
    return text.split(PLACE).join(ctx.slug);
  }

  if (r.endsWith('android/app/src/main/res/values/strings.xml')) {
    const re = new RegExp(
      `(<string\\s+name="app_name"\\s*>\\s*)${escapeRegexToken(PLACE)}(\\s*</string>)`,
      'g',
    );
    let t = text.replace(re, `$1${escapeXmlText(ctx.displayTitle)}$2`);
    return t.split(PLACE).join(ctx.slug);
  }

  if (r.endsWith('android/app/build.gradle')) {
    return text
      .split('\n')
      .map((line) => {
        if (/\bdef\s+appName\s*=/.test(line) && line.includes(PLACE)) {
          return line.split(PLACE).join(escapeForDoubleQuotedGroovy(ctx.displayTitle));
        }
        return line.split(PLACE).join(ctx.slug);
      })
      .join('\n');
  }

  if (r.endsWith('src/screens/user/TipDentor.tsx') || r.endsWith('src/screens/user/AllBids.tsx')) {
    return text.split(PLACE).join(escapeForSingleQuotedJs(ctx.displayTitle));
  }

  if (r.endsWith('src/config/app.ts')) {
    return text.split(PLACE).join(escapeForSingleQuotedJs(ctx.displayTitle));
  }

  if (r.includes('/ios/') && r.endsWith('Info.plist')) {
    const t = text.replace(
      new RegExp(
        `(<key>CFBundleDisplayName</key>\\s*<string>)${escapeRegexToken(PLACE)}(</string>)`,
      ),
      `$1${escapeXmlText(ctx.displayTitle)}$2`,
    );
    return t.split(PLACE).join(ctx.slug);
  }

  if (r.endsWith('project.pbxproj')) {
    return text
      .split('\n')
      .map((line) => {
        if (!line.includes(PLACE)) return line;
        if (line.includes('INFOPLIST_KEY_CFBundleDisplayName')) {
          return line.split(PLACE).join(xcodeQuotedSetting(ctx.displayTitle));
        }
        return line.split(PLACE).join(ctx.slug);
      })
      .join('\n');
  }

  return text.split(PLACE).join(ctx.slug);
}

function processAllFiles(ctx) {
  const files = [];
  walkFiles(ROOT, files);

  let touched = 0;
  for (const file of files) {
    const rel = path.relative(ROOT, file);
    if (rel.startsWith(`.git${path.sep}`)) continue;

    let buf;
    try {
      buf = fs.readFileSync(file);
    } catch {
      continue;
    }
    if (isProbablyBinary(buf)) continue;

    let text;
    try {
      text = buf.toString('utf8');
    } catch {
      continue;
    }

    let next = text;
    const pairs = [
      [`${OLD_BUNDLE_PREFIX}-`, `${ctx.bundleId}-`],
      [OLD_BUNDLE_PREFIX, ctx.bundleId],
      [`${OLD}app`, `${ctx.slug}app`],
      [OLD_PASCAL, ctx.pascal],
      [OLD_UPPER, ctx.upperFlat],
    ];
    for (const [from, to] of pairs) {
      next = next.split(from).join(to);
    }
    next = next.split(OLD).join(PLACE);
    next = resolvePlaceholders(rel, next, ctx);

    if (next.includes(PLACE)) {
      console.error(`Internal error: unresolved placeholder in ${rel}`);
      process.exit(1);
    }

    if (next !== text) {
      fs.writeFileSync(file, next, 'utf8');
      touched++;
    }
  }
  return touched;
}

function renameIfExists(oldPath, newPath) {
  if (!fs.existsSync(oldPath)) return false;
  if (fs.existsSync(newPath)) {
    console.error(`Refusing to overwrite existing path: ${newPath}`);
    process.exit(1);
  }
  fs.renameSync(oldPath, newPath);
  return true;
}

function renameIosTree(slug) {
  const ios = path.join(ROOT, 'ios');
  if (!fs.existsSync(ios)) return;

  const entitlementsOld = path.join(ios, OLD, `${OLD}.entitlements`);
  const entitlementsNew = path.join(ios, OLD, `${slug}.entitlements`);
  if (fs.existsSync(entitlementsOld)) {
    renameIfExists(entitlementsOld, entitlementsNew);
  }

  const schemeOld = path.join(
    ios,
    `${OLD}.xcodeproj`,
    'xcshareddata',
    'xcschemes',
    `${OLD}.xcscheme`,
  );
  const schemeNew = path.join(
    ios,
    `${OLD}.xcodeproj`,
    'xcshareddata',
    'xcschemes',
    `${slug}.xcscheme`,
  );
  renameIfExists(schemeOld, schemeNew);

  renameIfExists(path.join(ios, OLD), path.join(ios, slug));
  renameIfExists(path.join(ios, `${OLD}.xcworkspace`), path.join(ios, `${slug}.xcworkspace`));
  renameIfExists(path.join(ios, `${OLD}.xcodeproj`), path.join(ios, `${slug}.xcodeproj`));
}

function findAndroidKotlinDir(javaRoot) {
  function walk(d) {
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return null;
    }
    for (const ent of entries) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        const hit = walk(full);
        if (hit) return hit;
      } else if (ent.name === 'MainActivity.kt') {
        return d;
      }
    }
    return null;
  }
  return walk(javaRoot);
}

function pruneEmptyParents(dir, stopAt) {
  const stopResolved = path.resolve(stopAt);
  let d = dir;
  while (true) {
    const resolved = path.resolve(d);
    if (resolved === stopResolved || !resolved.startsWith(stopResolved + path.sep)) {
      break;
    }
    let entries;
    try {
      entries = fs.readdirSync(d);
    } catch {
      break;
    }
    if (entries.length > 0) break;
    const parent = path.dirname(d);
    try {
      fs.rmdirSync(d);
    } catch {
      break;
    }
    d = parent;
  }
}

function relocateAndroidKotlinPackage(bundleId) {
  const javaRoot = path.join(ROOT, 'android/app/src/main/java');
  if (!fs.existsSync(javaRoot)) return;

  const oldDir = findAndroidKotlinDir(javaRoot);
  if (!oldDir) return;

  const mainKt = path.join(oldDir, 'MainActivity.kt');
  if (!fs.existsSync(mainKt)) return;

  const content = fs.readFileSync(mainKt, 'utf8');
  const m = content.match(/^\s*package\s+([\w.]+)\s*$/m);
  const pkg = (m && m[1]) || bundleId;
  const relPath = pkg.replace(/\./g, path.sep);
  const newDir = path.join(javaRoot, relPath);

  if (path.resolve(oldDir) === path.resolve(newDir)) return;

  fs.mkdirSync(newDir, { recursive: true });
  for (const f of fs.readdirSync(oldDir)) {
    if (!f.endsWith('.kt')) continue;
    const from = path.join(oldDir, f);
    const to = path.join(newDir, f);
    if (fs.existsSync(to)) {
      console.error(`Refusing to overwrite: ${to}`);
      process.exit(1);
    }
    fs.renameSync(from, to);
  }
  pruneEmptyParents(oldDir, javaRoot);
}

function printDone(ctx) {
  const line = '═'.repeat(58);
  const msg = [
    '',
    line,
    '  App rename complete',
    '',
    `  Display name (labels / payments): ${ctx.displayTitle}`,
    `  Technical / module name (slug):   ${ctx.slug}`,
    `  Bundle ID (iOS & Android):        ${ctx.bundleId}`,
    '',
    '  Firebase (zaroori):',
    `    Console mein Android + iOS apps isi bundle / package se`,
    `    register karke nayi files yahan rakho:`,
    `    • android/app/google-services.json`,
    `    • ios/GoogleService-Info.plist`,
    `    • ios/GoogleService-Info-dev.plist  (agar use karte ho)`,
    '',
    '  Phir build:',
    '    yarn pod',
    '    yarn android',
    '    yarn ios   (ya Xcode se)',
    '',
    line,
    '',
  ];
  console.log(msg.join('\n'));
}

function ask(rl, q) {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function promptForContextInteractive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log('');
    console.log('Boilerplate app rename — do values alag se enter karein.');
    console.log('');

    let derived;
    for (;;) {
      const raw = (await ask(rl, 'App name (e.g. My App / MyAppName): ')).trim();
      if (!raw) {
        console.log('App name khali nahi ho sakta — dubara likhein.\n');
        continue;
      }
      derived = deriveNames(raw);
      if (!derived) {
        console.log(
          'Galat naam: sirf letters/numbers; technical naam hamesha letter se shuru (jaise My2App).\n',
        );
        continue;
      }
      if (derived.slug === OLD) {
        console.log('Yeh naam reserved hai — koi aur choose karein.\n');
        continue;
      }
      break;
    }

    const defaultBundle = `com.cmolds.${derived.slug}`;
    console.log('');
    const bundleRaw = (
      await ask(
        rl,
        `Bundle ID (iOS + Android package) [default: ${defaultBundle}]: `,
      )
    ).trim();

    let bundleId;
    if (!bundleRaw) {
      bundleId = defaultBundle;
    } else {
      bundleId = normalizeBundleId(bundleRaw);
    }

    assertSafeDisplayTitle(derived.displayTitle);

    return { ...derived, bundleId };
  } finally {
    rl.close();
  }
}

function executeRename(ctx) {
  const { bundleId } = ctx;

  console.log('');
  console.log(`Display name: ${ctx.displayTitle}`);
  console.log(`Slug (technical): ${ctx.slug}`);
  console.log(`Pascal / class style: ${ctx.pascal}`);
  console.log(`Bundle ID: ${ctx.bundleId}`);

  const n = processAllFiles(ctx);
  console.log(`Updated ${n} files.`);

  console.log('Moving Android Kotlin sources to match package…');
  relocateAndroidKotlinPackage(bundleId);

  console.log('Renaming iOS folders and scheme/entitlements…');
  renameIosTree(ctx.slug);

  printDone(ctx);
}

async function main() {
  const nameArg = process.argv[2];
  const bundleArg = process.argv[3];
  const canPrompt = process.stdin.isTTY && process.stdout.isTTY;
  const useInteractive = canPrompt && !nameArg;

  let ctx;
  if (useInteractive) {
    ctx = await promptForContextInteractive();
  } else {
    if (!nameArg) {
      console.error('Usage:');
      console.error('  yarn rename-app');
      console.error('    → interactive (terminal se app name + bundle ID)');
      console.error('  yarn rename-app <NewAppName> [com.bundle.id]');
      console.error('    → non-interactive');
      console.error('Examples:');
      console.error('  yarn rename-app MyAppName');
      console.error('  yarn rename-app "My App Name" com.acme.myapp');
      process.exit(1);
    }

    const derived = deriveNames(nameArg);
    if (!derived) {
      console.error(
        'Invalid app name: use letters and/or digits (e.g. MyAppName, "My App", ride2go).',
      );
      process.exit(1);
    }
    if (derived.slug === OLD) {
      console.error(`Name normalizes to reserved "${OLD}"; choose another.`);
      process.exit(1);
    }

    const bundleId = normalizeBundleId(bundleArg) || `com.cmolds.${derived.slug}`;
    ctx = { ...derived, bundleId };
    assertSafeDisplayTitle(ctx.displayTitle);
  }

  executeRename(ctx);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
