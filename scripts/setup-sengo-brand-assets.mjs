#!/usr/bin/env node
/**
 * Copies shared Sengo brand files and generates SVG wordmarks for RN.
 * Run: node scripts/setup-sengo-brand-assets.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CURSOR_ASSETS = path.join(
  process.env.HOME || '',
  '.cursor/projects/Users-shahidraza-Documents-CMOLDS-Boilerplate/assets',
);

const OUT = {
  images: path.join(ROOT, 'src/assets/images/variants/sengo'),
  svg: path.join(ROOT, 'src/assets/svg/sengo'),
};

/** Pick newest PNG in Cursor assets matching a filename prefix. */
function findAssetByPrefix(prefix) {
  if (!fs.existsSync(CURSOR_ASSETS)) {
    throw new Error(`Assets folder missing: ${CURSOR_ASSETS}`);
  }
  const matches = fs
    .readdirSync(CURSOR_ASSETS)
    .filter((f) => f.startsWith(prefix) && f.toLowerCase().endsWith('.png'))
    .map((f) => ({ f, mtime: fs.statSync(path.join(CURSOR_ASSETS, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (matches.length === 0) {
    throw new Error(`No PNG with prefix "${prefix}" in ${CURSOR_ASSETS}`);
  }
  return path.join(CURSOR_ASSETS, matches[0].f);
}

/** Embed PNG in SVG; optional scale (e.g. 3) for sharper RN wordmarks on retina. */
async function pngToEmbeddedSvg(pngPath, svgPath, scale = 1) {
  let pipeline = sharp(pngPath);
  const meta = await pipeline.metadata();
  const baseW = meta.width ?? 1;
  const baseH = meta.height ?? 1;
  const w = Math.round(baseW * scale);
  const h = Math.round(baseH * scale);
  if (scale !== 1) {
    pipeline = pipeline.resize(w, h, { kernel: sharp.kernel.lanczos3 });
  }
  const pngBuf = await pipeline.png().toBuffer();
  const b64 = pngBuf.toString('base64');
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <image width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,${b64}"/>
</svg>`;
  await fs.promises.mkdir(path.dirname(svgPath), { recursive: true });
  await fs.promises.writeFile(svgPath, svg);
}

async function copyFile(src, dest) {
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  await fs.promises.copyFile(src, dest);
}

async function main() {
  const iconLight = findAssetByPrefix('Sengo_App_Icon');
  const logoDark = findAssetByPrefix('Group_91213');
  const logoLight = findAssetByPrefix('Sengo_Logo');
  const cloud = findAssetByPrefix('fluffy-white-cumulus-cloud');

  await copyFile(iconLight, path.join(OUT.images, 'icon-light.png'));
  await copyFile(logoDark, path.join(OUT.images, 'icon-dark.png'));
  await copyFile(logoLight, path.join(OUT.images, 'logo-light.png'));
  await copyFile(logoDark, path.join(OUT.images, 'logo-dark.png'));
  await copyFile(logoDark, path.join(OUT.images, 'onboarding.png'));
  await copyFile(cloud, path.join(OUT.images, 'cloud.png'));

  await pngToEmbeddedSvg(logoLight, path.join(OUT.svg, 'logoLight.svg'), 3);
  await pngToEmbeddedSvg(logoDark, path.join(OUT.svg, 'logoDark.svg'));
  await pngToEmbeddedSvg(cloud, path.join(OUT.svg, 'cloud.svg'));

  for (const stale of ['logo.png', 'onboarding_1.png', 'onboarding_2.png', 'onboarding_3.png']) {
    const p = path.join(OUT.images, stale);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  console.log('Sengo brand assets ready.');
  console.log(`  App icon (light): ${path.basename(iconLight)}`);
  console.log(`  App icon (dark):  ${path.basename(logoDark)}`);
  console.log('Next: yarn apply-sengo-icons');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
