#!/usr/bin/env node
/**
 * iOS release pipeline: archive → IPA → (optional) TestFlight / App Store Connect upload.
 *
 * Prerequisites (Mac + Xcode):
 *   - Apple Developer account, signing set up in Xcode (Automatic or Manual)
 *   - For upload: App Store Connect API key (.p8) — see ios/release.config.example.json
 *
 * Usage:
 *   node scripts/ios-release.mjs                    # archive + export IPA
 *   node scripts/ios-release.mjs --upload           # archive + IPA + upload to ASC
 *   node scripts/ios-release.mjs --upload --validate
 *   node scripts/ios-release.mjs --bump patch --upload
 *   node scripts/ios-release.mjs --archive-only
 *   node scripts/ios-release.mjs --export-only      # re-export IPA from existing archive
 *
 * Config: copy ios/release.config.example.json → ios/release.config.json (gitignored)
 * Env overrides: ASC_API_KEY_ID, ASC_API_ISSUER_ID, ASC_API_KEY_PATH, APPLE_TEAM_ID
 */

import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DEFAULTS = {
  workspace: 'ios/snlift.xcworkspace',
  scheme: 'snlift',
  configuration: 'Release',
  teamId: '3ZG53CCNMB',
  bundleId: 'com.cmolds.snlift',
  exportOptionsPlist: 'ios/ExportOptions.plist',
  outputDir: 'build/ios',
};

// ─── CLI ─────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = {
    bump: null,
    skipPod: false,
    archiveOnly: false,
    exportOnly: false,
    upload: false,
    validate: false,
    open: false,
    configPath: null,
    teamId: null,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--bump':
        opts.bump = argv[++i] || 'patch';
        break;
      case '--skip-pod':
        opts.skipPod = true;
        break;
      case '--archive-only':
        opts.archiveOnly = true;
        break;
      case '--export-only':
        opts.exportOnly = true;
        break;
      case '--upload':
        opts.upload = true;
        break;
      case '--validate':
        opts.validate = true;
        break;
      case '--open':
        opts.open = true;
        break;
      case '--config':
        opts.configPath = argv[++i];
        break;
      case '--team':
        opts.teamId = argv[++i];
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
      default:
        console.error(`Unknown option: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }
  return opts;
}

function printHelp() {
  console.log(`
iOS release — archive, IPA export, App Store Connect upload

  node scripts/ios-release.mjs [options]

Options:
  --bump [patch|minor|major]   Bump package.json version before build
  --skip-pod                   Skip "pod install"
  --archive-only               Create .xcarchive only (no IPA)
  --export-only                Export IPA from build/ios/snlift.xcarchive
  --upload                     Upload IPA to App Store Connect (TestFlight ready)
  --validate                   Validate IPA with altool before upload
  --open                       Open output folder when finished
  --team TEAM_ID               Override Apple Team ID
  --config PATH                Config JSON (default: ios/release.config.json)

Upload credentials (pick one):
  App Store Connect API key (recommended):
    ASC_API_KEY_ID, ASC_API_ISSUER_ID, ASC_API_KEY_PATH
    or ios/release.config.json → ascApiKeyId, ascApiIssuerId, ascApiKeyPath

  Apple ID (legacy):
    APPLE_ID + APP_SPECIFIC_PASSWORD

Note: TestFlight and App Store use the same upload. After upload, submit for review in App Store Connect.
`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(step, msg) {
  console.log(`\n▶ ${step}: ${msg}`);
}

function run(cmd, args, { cwd = ROOT, env = process.env } = {}) {
  const result = spawnSync(cmd, args, { cwd, env, stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${cmd} ${args.join(' ')}`);
  }
}

function runCapture(cmd, args, { cwd = ROOT } = {}) {
  return execSync([cmd, ...args].join(' '), { cwd, encoding: 'utf8' }).trim();
}

function loadConfig(configPath) {
  const cfg = { ...DEFAULTS };
  const candidates = [
    configPath,
    path.join(ROOT, 'ios/release.config.json'),
  ].filter(Boolean);

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      const json = JSON.parse(fs.readFileSync(file, 'utf8'));
      Object.assign(cfg, json);
      log('Config', file);
      break;
    }
  }

  if (process.env.APPLE_TEAM_ID) cfg.teamId = process.env.APPLE_TEAM_ID;
  return cfg;
}

function readPackageVersion() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  return { version: pkg.version, name: pkg.name };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function resolveExportPlist(cfg, teamId) {
  const src = path.join(ROOT, cfg.exportOptionsPlist);
  if (!fs.existsSync(src)) {
    throw new Error(`ExportOptions.plist not found: ${src}`);
  }
  const content = fs.readFileSync(src, 'utf8');
  const patched = content.replace(
    /<key>teamID<\/key>\s*<string>[^<]*<\/string>/,
    `<key>teamID</key>\n\t<string>${teamId}</string>`,
  );
  const tmp = path.join(os.tmpdir(), `snlift-export-${Date.now()}.plist`);
  fs.writeFileSync(tmp, patched);
  return tmp;
}

function findIpa(exportDir) {
  if (!fs.existsSync(exportDir)) return null;
  const files = fs.readdirSync(exportDir).filter(f => f.endsWith('.ipa'));
  if (files.length === 0) return null;
  return path.join(exportDir, files[0]);
}

function ensureApiKeyInstalled(keyId, keyPath) {
  const dir = path.join(os.homedir(), '.appstoreconnect/private_keys');
  const dest = path.join(dir, `AuthKey_${keyId}.p8`);
  if (!fs.existsSync(dest)) {
    ensureDir(dir);
    fs.copyFileSync(keyPath, dest);
    fs.chmodSync(dest, 0o600);
    log('API key', `installed to ${dest}`);
  }
  return dest;
}

function resolveApiKey(cfg) {
  const keyId = process.env.ASC_API_KEY_ID || cfg.ascApiKeyId;
  const issuerId = process.env.ASC_API_ISSUER_ID || cfg.ascApiIssuerId;
  let keyPath = process.env.ASC_API_KEY_PATH || cfg.ascApiKeyPath;

  if (keyId && issuerId) {
    if (keyId.startsWith('YOUR_') || issuerId.startsWith('YOUR_')) {
      return null;
    }
    if (keyPath && !path.isAbsolute(keyPath)) {
      keyPath = path.join(ROOT, keyPath);
    }
    if (!keyPath || !fs.existsSync(keyPath)) {
      const homeKey = path.join(
        os.homedir(),
        '.appstoreconnect/private_keys',
        `AuthKey_${keyId}.p8`,
      );
      if (fs.existsSync(homeKey)) keyPath = homeKey;
    }
    if (!keyPath || !fs.existsSync(keyPath)) {
      throw new Error(
        `API key file not found. Set ASC_API_KEY_PATH or place AuthKey_${keyId}.p8 in ios/ or ~/.appstoreconnect/private_keys/`,
      );
    }
    ensureApiKeyInstalled(keyId, keyPath);
    return { keyId, issuerId, keyPath };
  }

  const appleId = process.env.APPLE_ID || cfg.appleId;
  const appPassword = process.env.APP_SPECIFIC_PASSWORD || cfg.appSpecificPassword;
  if (appleId && appPassword) {
    return { appleId, appPassword };
  }

  return null;
}

function altoolBaseArgs(auth) {
  if (auth.keyId) {
    return [
      '--apiKey',
      auth.keyId,
      '--apiIssuer',
      auth.issuerId,
    ];
  }
  return ['--username', auth.appleId, '--password', auth.appPassword];
}

function validateIpa(ipaPath, auth) {
  log('Validate', ipaPath);
  run('xcrun', [
    'altool',
    '--validate-app',
    '-f',
    ipaPath,
    '-t',
    'ios',
    ...altoolBaseArgs(auth),
  ]);
}

function uploadIpa(ipaPath, auth) {
  log('Upload', 'Sending to App Store Connect (TestFlight + App Store)');
  run('xcrun', [
    'altool',
    '--upload-app',
    '-f',
    ipaPath,
    '-t',
    'ios',
    ...altoolBaseArgs(auth),
  ]);
}

function podInstall() {
  log('Pods', 'bundle exec pod install');
  const iosDir = path.join(ROOT, 'ios');
  const hasBundle = fs.existsSync(path.join(ROOT, 'Gemfile'));
  if (hasBundle) {
    run('bundle', ['exec', 'pod', 'install'], { cwd: iosDir });
  } else {
    run('pod', ['install'], { cwd: iosDir });
  }
}

function archive(cfg, teamId, paths) {
  const workspace = path.join(ROOT, cfg.workspace);
  if (!fs.existsSync(workspace)) {
    throw new Error(`Workspace not found: ${workspace}. Run pod install first.`);
  }

  ensureDir(paths.outputDir);
  log('Archive', paths.archivePath);

  run('xcodebuild', [
    '-workspace',
    workspace,
    '-scheme',
    cfg.scheme,
    '-configuration',
    cfg.configuration,
    '-destination',
    'generic/platform=iOS',
    '-archivePath',
    paths.archivePath,
    `DEVELOPMENT_TEAM=${teamId}`,
    'CODE_SIGN_STYLE=Automatic',
    '-allowProvisioningUpdates',
    'archive',
  ]);
}

function exportIpa(cfg, teamId, paths) {
  if (!fs.existsSync(paths.archivePath)) {
    throw new Error(`Archive not found: ${paths.archivePath}. Run without --export-only first.`);
  }

  const exportPlist = resolveExportPlist(cfg, teamId);
  try {
    if (fs.existsSync(paths.exportDir)) {
      fs.rmSync(paths.exportDir, { recursive: true, force: true });
    }
    ensureDir(paths.exportDir);

    log('Export', `IPA → ${paths.exportDir}`);
    run('xcodebuild', [
      '-exportArchive',
      '-archivePath',
      paths.archivePath,
      '-exportPath',
      paths.exportDir,
      '-exportOptionsPlist',
      exportPlist,
      '-allowProvisioningUpdates',
    ]);
  } finally {
    if (fs.existsSync(exportPlist)) fs.unlinkSync(exportPlist);
  }

  const ipa = findIpa(paths.exportDir);
  if (!ipa) {
    throw new Error(`IPA not found in ${paths.exportDir}`);
  }
  return ipa;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (process.platform !== 'darwin') {
    console.error('iOS builds require macOS with Xcode.');
    process.exit(1);
  }

  const variantEnv = process.env.APP_ENV || process.env.APP_VARIANT || 'snlift';
  run('node', ['scripts/sync-ios-variant.mjs'], {
    env: { ...process.env, APP_ENV: variantEnv },
  });

  const opts = parseArgs(process.argv.slice(2));
  const cfg = loadConfig(opts.configPath);
  const teamId = opts.teamId || cfg.teamId;
  const { version, name } = readPackageVersion();

  const paths = {
    outputDir: path.join(ROOT, cfg.outputDir),
    archivePath: path.join(ROOT, cfg.outputDir, `${cfg.scheme}.xcarchive`),
    exportDir: path.join(ROOT, cfg.outputDir, 'export'),
  };

  console.log(`\n${name} v${version} — iOS ${cfg.configuration} (${teamId})\n`);

  if (opts.bump) {
    log('Version', `bump ${opts.bump}`);
    run('node', ['scripts/bump-version.js', opts.bump]);
  }

  if (!opts.exportOnly) {
    if (!opts.skipPod) podInstall();
    archive(cfg, teamId, paths);
    console.log(`\n✓ Archive: ${paths.archivePath}`);
  }

  if (opts.archiveOnly && !opts.upload) {
    if (opts.open) run('open', [paths.archivePath]);
    return;
  }

  const ipaPath = exportIpa(cfg, teamId, paths);
  console.log(`\n✓ IPA: ${ipaPath}`);

  if (opts.upload || opts.validate) {
    const auth = resolveApiKey(cfg);
    if (!auth) {
      console.error(`
Upload credentials missing.

Create ios/release.config.json from ios/release.config.example.json, or set:

  export ASC_API_KEY_ID="XXXXXXXXXX"
  export ASC_API_ISSUER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  export ASC_API_KEY_PATH="ios/AuthKey_XXXXXXXXXX.p8"

Get API keys: App Store Connect → Users and Access → Integrations → App Store Connect API
`);
      process.exit(1);
    }

    if (opts.validate || opts.upload) {
      validateIpa(ipaPath, auth);
      console.log('\n✓ Validation passed');
    }
    if (opts.upload) {
      uploadIpa(ipaPath, auth);
      console.log('\n✓ Upload complete — check App Store Connect → TestFlight (processing ~5–15 min)');
    }
  }

  if (opts.open) {
    run('open', [paths.exportDir]);
  }
}

main().catch(err => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
