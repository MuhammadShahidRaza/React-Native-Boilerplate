#!/usr/bin/env node
/**
 * Do square master PNGs se Android + iOS app icons generate karta hai.
 * Light asset → saari *_light / default adaptive icons; dark → *_dark + iOS dark appearance.
 *
 * Usage:
 *   yarn replace-icons
 *     → paths prompt (TTY par)
 *   yarn replace-icons ./icon-light.png ./icon-dark.png
 *
 * Masters: kam az kam ~512×512 square PNG (1024×1024 behtar).
 * Android adaptive foreground: 66/108 safe zone (Pixel circle mask ke liye).
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');

/** Launcher + round (px per density) */
const ANDROID_LAUNCHER = {
  ldpi: 36,
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

/** Adaptive foreground layer (px per density); ldpi par file nahi hai */
const ANDROID_FOREGROUND = {
  mdpi: 108,
  hdpi: 162,
  xhdpi: 216,
  xxhdpi: 324,
  xxxhdpi: 432,
};

const PLAYSTORE_SIZE = 512;

/** Apple App Store marketing icon must not have alpha; matches SNLIFT logo blue. */
const IOS_ICON_FLATTEN_BG = { r: 0, g: 74, b: 173 };

/** Android adaptive icon: 108dp layer, 66dp diameter safe zone (Pixel / circle masks). */
const ANDROID_ADAPTIVE_SAFE_RATIO = 66 / 108;

/** Launcher fallback + Play Store — full square on brand fill. */
const ANDROID_LAUNCHER_BG_LIGHT = IOS_ICON_FLATTEN_BG;
const ANDROID_LAUNCHER_BG_DARK = { r: 0, g: 0, b: 0 };

/** AppIcon.appiconset filenames → edge length in px */
const IOS_FILENAME_PX = {
  'Icon-App-20x20@1x.png': 20,
  'Icon-App-20x20@2x.png': 40,
  'Icon-App-20x20@3x.png': 60,
  'Icon-App-29x29@1x.png': 29,
  'Icon-App-29x29@2x.png': 58,
  'Icon-App-29x29@3x.png': 87,
  'Icon-App-40x40@1x.png': 40,
  'Icon-App-40x40@2x.png': 80,
  'Icon-App-40x40@3x.png': 120,
  'Icon-App-60x60@2x.png': 120,
  'Icon-App-60x60@3x.png': 180,
  'Icon-App-76x76@1x.png': 76,
  'Icon-App-76x76@2x.png': 152,
  'Icon-App-83.5x83.5@2x.png': 167,
  'ItunesArtwork@2x.png': 1024,
};

function isDarkAppearanceEntry(img) {
  const a = img.appearances;
  if (!Array.isArray(a)) return false;
  return a.some((x) => x && x.appearance === 'luminosity' && x.value === 'dark');
}

function toDarkFilename(filename) {
  return String(filename).replace(/\.png$/i, '.dark.png');
}

async function resizeSquarePng(srcPath, destPath, px, { flattenForIos = false } = {}) {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  let pipeline = sharp(srcPath).resize(px, px, { fit: 'cover', position: 'centre' });
  if (flattenForIos) {
    pipeline = pipeline.flatten({ background: IOS_ICON_FLATTEN_BG });
  }
  const buf = await pipeline.png().toBuffer();
  await fs.promises.writeFile(destPath, buf);
}

/** Legacy launcher / Play Store: logo centered, no crop (unlike cover). */
async function resizeLauncherSquare(srcPath, destPath, px, background) {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  const buf = await sharp(srcPath)
    .resize(px, px, { fit: 'contain', background })
    .flatten({ background })
    .png()
    .toBuffer();
  await fs.promises.writeFile(destPath, buf);
}

/**
 * Adaptive foreground layer — logo 66dp safe zone ke andar; warna Pixel par zoom / clip.
 * Transparent padding; background XML se dikhega.
 */
async function resizeAdaptiveForeground(srcPath, destPath, px) {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  const logoPx = Math.max(1, Math.round(px * ANDROID_ADAPTIVE_SAFE_RATIO));
  const pad = Math.floor((px - logoPx) / 2);
  const buf = await sharp(srcPath)
    .resize(logoPx, logoPx, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      top: pad,
      bottom: px - logoPx - pad,
      left: pad,
      right: px - logoPx - pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  await fs.promises.writeFile(destPath, buf);
}

async function assertPngExists(absPath, label) {
  if (!fs.existsSync(absPath)) {
    console.error(`${label} file nahi mili: ${absPath}`);
    process.exit(1);
  }
  const meta = await sharp(absPath).metadata();
  if (meta.format !== 'png') {
    console.error(`${label} PNG honi chahiye (ab: ${meta.format || 'unknown'}).`);
    process.exit(1);
  }
}

async function writeAndroid(lightPng, darkPng) {
  const resRoot = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');

  for (const [density, px] of Object.entries(ANDROID_LAUNCHER)) {
    const dir = path.join(resRoot, `mipmap-${density}`);
    await resizeLauncherSquare(
      lightPng,
      path.join(dir, 'ic_launcher_light.png'),
      px,
      ANDROID_LAUNCHER_BG_LIGHT,
    );
    await resizeLauncherSquare(
      darkPng,
      path.join(dir, 'ic_launcher_dark.png'),
      px,
      ANDROID_LAUNCHER_BG_DARK,
    );
    await resizeLauncherSquare(
      lightPng,
      path.join(dir, 'ic_launcher_round_light.png'),
      px,
      ANDROID_LAUNCHER_BG_LIGHT,
    );
    await resizeLauncherSquare(
      darkPng,
      path.join(dir, 'ic_launcher_round_dark.png'),
      px,
      ANDROID_LAUNCHER_BG_DARK,
    );
  }

  for (const [density, px] of Object.entries(ANDROID_FOREGROUND)) {
    const dir = path.join(resRoot, `mipmap-${density}`);
    await resizeAdaptiveForeground(
      lightPng,
      path.join(dir, 'ic_launcher_foreground_light.png'),
      px,
    );
    await resizeAdaptiveForeground(
      darkPng,
      path.join(dir, 'ic_launcher_foreground_dark.png'),
      px,
    );
  }

  await resizeLauncherSquare(
    lightPng,
    path.join(resRoot, 'playstore-icon_light.png'),
    PLAYSTORE_SIZE,
    ANDROID_LAUNCHER_BG_LIGHT,
  );
  await resizeLauncherSquare(
    darkPng,
    path.join(resRoot, 'playstore-icon_dark.png'),
    PLAYSTORE_SIZE,
    ANDROID_LAUNCHER_BG_DARK,
  );
}

function findAppIconDirs() {
  const iosDir = path.join(ROOT, 'ios');
  if (!fs.existsSync(iosDir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(iosDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const appIcon = path.join(iosDir, ent.name, 'Images.xcassets', 'AppIcon.appiconset');
    const contents = path.join(appIcon, 'Contents.json');
    if (fs.existsSync(contents)) out.push(appIcon);
  }
  return out;
}

function rebuildContentsWithDark(contentsPath) {
  const raw = fs.readFileSync(contentsPath, 'utf8');
  const data = JSON.parse(raw);
  const images = Array.isArray(data.images) ? data.images : [];
  const baseOnly = images.filter((img) => !isDarkAppearanceEntry(img));

  const rebuilt = [];
  for (const img of baseOnly) {
    const copy = { ...img };
    delete copy.appearances;
    rebuilt.push(copy);

    const fn = copy.filename;
    if (!fn) continue;
    const darkFn = toDarkFilename(fn);
    rebuilt.push({
      size: copy.size,
      idiom: copy.idiom,
      scale: copy.scale,
      filename: darkFn,
      appearances: [{ appearance: 'luminosity', value: 'dark' }],
    });
  }

  data.images = rebuilt;
  fs.writeFileSync(contentsPath, `${JSON.stringify(data, null, 4)}\n`, 'utf8');
}

async function writeIos(lightPng, darkPng) {
  const dirs = findAppIconDirs();
  if (dirs.length === 0) {
    console.warn('Warning: ios/.../AppIcon.appiconset nahi mila — iOS icons skip.');
    return;
  }

  for (const appIconDir of dirs) {
    const contentsPath = path.join(appIconDir, 'Contents.json');
    rebuildContentsWithDark(contentsPath);

    const contents = JSON.parse(fs.readFileSync(contentsPath, 'utf8'));
    const written = new Set();

    for (const img of contents.images || []) {
      const fn = img.filename;
      if (!fn || written.has(fn)) continue;
      const lookupFn = /\.dark\.png$/i.test(fn)
        ? fn.replace(/\.dark\.png$/i, '.png')
        : fn;
      const px = IOS_FILENAME_PX[lookupFn];
      if (px == null) {
        console.warn(`Unknown iOS icon file (skip): ${fn}`);
        continue;
      }
      const isDark = isDarkAppearanceEntry(img);
      const src = isDark ? darkPng : lightPng;
      const dest = path.join(appIconDir, fn);
      await resizeSquarePng(src, dest, px, { flattenForIos: true });
      written.add(fn);
    }
  }
}

function printDone() {
  const line = '═'.repeat(58);
  console.log(
    [
      '',
      line,
      '  App icons update ho gaye',
      '',
      '  Android: mipmap-* (launcher contain + foreground safe-zone) + playstore-icon_*',
      '  iOS: AppIcon.appiconset (light + dark appearance PNGs)',
      '',
      '  Agli baar Xcode kholo / clean build:',
      '    yarn pod   (agar zarurat ho)',
      '    yarn android',
      '    yarn ios',
      '',
      line,
      '',
    ].join('\n'),
  );
}

function ask(rl, q) {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function promptPathsInteractive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log('');
    console.log('Do square PNG paths dein (light pehle, phir dark).');
    console.log('');
    let light = (await ask(rl, 'Light icon PNG path: ')).trim().replace(/^["']|["']$/g, '');
    let dark = (await ask(rl, 'Dark icon PNG path: ')).trim().replace(/^["']|["']$/g, '');
    if (!light || !dark) {
      console.error('Dono paths zaroori hain.');
      process.exit(1);
    }
    if (!path.isAbsolute(light)) light = path.resolve(process.cwd(), light);
    if (!path.isAbsolute(dark)) dark = path.resolve(process.cwd(), dark);
    return { light, dark };
  } finally {
    rl.close();
  }
}

async function main() {
  const a = process.argv[2];
  const b = process.argv[3];
  const canPrompt = process.stdin.isTTY && process.stdout.isTTY;
  const useInteractive = canPrompt && !a;

  let lightPng;
  let darkPng;
  if (useInteractive) {
    const p = await promptPathsInteractive();
    lightPng = p.light;
    darkPng = p.dark;
  } else {
    if (!a || !b) {
      console.error('Usage:');
      console.error('  yarn replace-icons');
      console.error('    → interactive');
      console.error('  yarn replace-icons <light.png> <dark.png>');
      process.exit(1);
    }
    lightPng = path.isAbsolute(a) ? a : path.resolve(process.cwd(), a);
    darkPng = path.isAbsolute(b) ? b : path.resolve(process.cwd(), b);
  }

  await assertPngExists(lightPng, 'Light');
  await assertPngExists(darkPng, 'Dark');

  console.log('');
  console.log(`Light: ${lightPng}`);
  console.log(`Dark:  ${darkPng}`);
  console.log('');
  console.log('Android icons likh raha hai…');
  await writeAndroid(lightPng, darkPng);
  console.log('iOS icons likh raha hai…');
  await writeIos(lightPng, darkPng);
  printDone();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
