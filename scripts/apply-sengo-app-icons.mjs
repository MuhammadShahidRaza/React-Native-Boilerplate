#!/usr/bin/env node
/**
 * Sengo app icons — full wordmark on white (light) / black (dark).
 * Uses contain (never crop). Updates Android flavors + iOS icon sets.
 *
 * Usage: yarn apply-sengo-icons
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SENGO_ICON_LIGHT = path.join(ROOT, 'src/assets/images/variants/sengo/icon-light.png');
const SENGO_ICON_DARK = path.join(ROOT, 'src/assets/images/variants/sengo/icon-dark.png');
const SENGO_FLAVORS = ['sengo', 'sengoWorkers'];

/** Light = white canvas (Sengo_App_Icon). Dark = black canvas (Group_91213). */
const SENGO_BG_LIGHT = { r: 255, g: 255, b: 255 };
const SENGO_BG_DARK = { r: 0, g: 0, b: 0 };

const IOS_ICON_SETS = [
  { name: 'AppIconSengo.appiconset', template: 'AppIcon.appiconset/Contents.json', dual: true },
  { name: 'LightAppIcon.appiconset', template: 'LightAppIcon.appiconset/Contents.json', dual: false, tone: 'light' },
  { name: 'DarkAppIcon.appiconset', template: 'DarkAppIcon.appiconset/Contents.json', dual: false, tone: 'dark' },
];

const ANDROID_LAUNCHER = {
  ldpi: 36,
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

const ANDROID_FOREGROUND = {
  mdpi: 108,
  hdpi: 162,
  xhdpi: 216,
  xxhdpi: 324,
  xxxhdpi: 432,
};

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

/** Full logo centered in square — no crop. */
async function squareIcon(srcPath, destPath, px, background) {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  const buf = await sharp(srcPath)
    .resize(px, px, { fit: 'contain', background })
    .flatten({ background })
    .png()
    .toBuffer();
  await fs.promises.writeFile(destPath, buf);
}

/** Adaptive foreground: full logo with small inset so mask does not clip text. */
async function adaptiveForeground(srcPath, destPath, px, background) {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  const inset = Math.max(4, Math.round(px * 0.06));
  const inner = px - inset * 2;
  const buf = await sharp(srcPath)
    .resize(inner, inner, { fit: 'contain', background })
    .extend({
      top: inset,
      bottom: inset,
      left: inset,
      right: inset,
      background,
    })
    .flatten({ background })
    .png()
    .toBuffer();
  await fs.promises.writeFile(destPath, buf);
}

function writeFlavorBackgroundXml(resRoot) {
  const valuesDir = path.join(resRoot, 'values');
  const valuesNightDir = path.join(resRoot, 'values-night');
  const drawableDir = path.join(resRoot, 'drawable');
  fs.mkdirSync(valuesDir, { recursive: true });
  fs.mkdirSync(valuesNightDir, { recursive: true });
  fs.mkdirSync(drawableDir, { recursive: true });

  fs.writeFileSync(
    path.join(valuesDir, 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
`,
  );
  fs.writeFileSync(
    path.join(valuesNightDir, 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#000000</color>
</resources>
`,
  );
  fs.writeFileSync(
    path.join(drawableDir, 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <solid android:color="@color/ic_launcher_background" />
</shape>
`,
  );
}

function writeFlavorAdaptiveXml(resRoot) {
  const dir = path.join(resRoot, 'mipmap-anydpi-v26');
  fs.mkdirSync(dir, { recursive: true });
  const adaptiveLight = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground_light"/>
</adaptive-icon>
`;
  const adaptiveDark = adaptiveLight.replace(
    'ic_launcher_foreground_light',
    'ic_launcher_foreground_dark',
  );

  for (const name of [
    'ic_launcher.xml',
    'ic_launcher_light.xml',
    'ic_launcher_round.xml',
    'ic_launcher_round_light.xml',
  ]) {
    fs.writeFileSync(path.join(dir, name), adaptiveLight);
  }
  for (const name of ['ic_launcher_dark.xml', 'ic_launcher_round_dark.xml']) {
    fs.writeFileSync(path.join(dir, name), adaptiveDark);
  }
}

async function writeAndroidFlavor(flavor, lightPath, darkPath) {
  const resRoot = path.join(ROOT, 'android/app/src', flavor, 'res');
  writeFlavorBackgroundXml(resRoot);
  writeFlavorAdaptiveXml(resRoot);

  for (const [density, px] of Object.entries(ANDROID_LAUNCHER)) {
    const dir = path.join(resRoot, `mipmap-${density}`);
    await squareIcon(lightPath, path.join(dir, 'ic_launcher_light.png'), px, SENGO_BG_LIGHT);
    await squareIcon(darkPath, path.join(dir, 'ic_launcher_dark.png'), px, SENGO_BG_DARK);
    await squareIcon(lightPath, path.join(dir, 'ic_launcher_round_light.png'), px, SENGO_BG_LIGHT);
    await squareIcon(darkPath, path.join(dir, 'ic_launcher_round_dark.png'), px, SENGO_BG_DARK);
    await squareIcon(lightPath, path.join(dir, 'ic_launcher.png'), px, SENGO_BG_LIGHT);
    await squareIcon(lightPath, path.join(dir, 'ic_launcher_round.png'), px, SENGO_BG_LIGHT);
  }

  for (const [density, px] of Object.entries(ANDROID_FOREGROUND)) {
    const dir = path.join(resRoot, `mipmap-${density}`);
    await adaptiveForeground(
      lightPath,
      path.join(dir, 'ic_launcher_foreground_light.png'),
      px,
      SENGO_BG_LIGHT,
    );
    await adaptiveForeground(
      darkPath,
      path.join(dir, 'ic_launcher_foreground_dark.png'),
      px,
      SENGO_BG_DARK,
    );
  }

  console.log(`Android ${flavor}: all launcher + adaptive icons`);
}

async function writeIosAppIconSet({ name, template, dual, tone }, lightPath, darkPath) {
  const assetsRoot = path.join(ROOT, 'ios/snlift/Images.xcassets');
  const templatePath = path.join(assetsRoot, template);
  const destDir = path.join(assetsRoot, name);

  if (!fs.existsSync(templatePath)) {
    console.warn(`Skip iOS ${name}: template missing`);
    return;
  }

  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(templatePath, path.join(destDir, 'Contents.json'));

  const contents = JSON.parse(fs.readFileSync(path.join(destDir, 'Contents.json'), 'utf8'));
  const written = new Set();

  for (const img of contents.images || []) {
    const fn = img.filename;
    if (!fn || written.has(fn)) continue;
    const lookupFn = /\.dark\.png$/i.test(fn) ? fn.replace(/\.dark\.png$/i, '.png') : fn;
    const px = IOS_FILENAME_PX[lookupFn];
    if (px == null) {
      console.warn(`Unknown iOS icon (skip): ${fn}`);
      continue;
    }

    const useDark = dual ? isDarkAppearanceEntry(img) : tone === 'dark';
    const src = useDark ? darkPath : lightPath;
    const bg = useDark ? SENGO_BG_DARK : SENGO_BG_LIGHT;

    await squareIcon(src, path.join(destDir, fn), px, bg);
    written.add(fn);
  }
  console.log(`iOS: ${name}`);
}

async function main() {
  if (!fs.existsSync(SENGO_ICON_LIGHT) || !fs.existsSync(SENGO_ICON_DARK)) {
    console.error('Missing icon sources. Run: yarn setup-sengo-brand');
    process.exit(1);
  }

  console.log(`Light (white): ${SENGO_ICON_LIGHT}`);
  console.log(`Dark (black):  ${SENGO_ICON_DARK}\n`);

  for (const flavor of SENGO_FLAVORS) {
    await writeAndroidFlavor(flavor, SENGO_ICON_LIGHT, SENGO_ICON_DARK);
  }

  for (const set of IOS_ICON_SETS) {
    await writeIosAppIconSet(set, SENGO_ICON_LIGHT, SENGO_ICON_DARK);
  }

  console.log('\nDone.');
  console.log('1) Phone se Sengo / Sengo Workers uninstall karo');
  console.log('2) yarn android:sengo:clean   (ya ios rebuild)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
