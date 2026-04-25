#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const manualVersion = args.find(a => a.startsWith('--version='))?.split('=')[1];
const bumpType = args.find(a => a.startsWith('--bump='))?.split('=')[1] ?? 'patch';
const versionFile = path.join(__dirname, '../VERSION');

function log(msg, color = 'white') {
  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
  };
  console.log(`${colors[color] || ''}${msg}${colors.reset}`);
}

function exec(cmd) {
  log(`  → ${cmd}`, 'cyan');
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    log(`❌ Error: ${err.message}`, 'red');
    process.exit(1);
  }
}

function readVersion() {
  try {
    return fs.readFileSync(versionFile, 'utf-8').trim();
  } catch (err) {
    log('❌ Could not read VERSION file', 'red');
    process.exit(1);
  }
}

function incrementVersion(version, type = 'patch') {
  const parts = version.split('.');
  if (parts.length !== 3 || !parts.every(p => /^\d+$/.test(p))) {
    log(`❌ Invalid version format in VERSION file: ${version}`, 'red');
    log('Expected format: MAJOR.MINOR.PATCH', 'yellow');
    process.exit(1);
  }
  if (type === 'major') {
    parts[0] = String(parseInt(parts[0]) + 1);
    parts[1] = '0';
    parts[2] = '0';
  } else if (type === 'minor') {
    parts[1] = String(parseInt(parts[1]) + 1);
    parts[2] = '0';
  } else {
    parts[2] = String(parseInt(parts[2]) + 1);
  }
  return parts.join('.');
}

function isValidVersion(v) {
  return /^\d+\.\d+\.\d+$/.test(v);
}

function isValidBumpType(t) {
  return ['major', 'minor', 'patch'].includes(t);
}

function updateVersionFile(version) {
  try {
    fs.writeFileSync(versionFile, `${version}\n`, 'utf-8');
  } catch (err) {
    log(`⚠️  Warning: Could not update VERSION file: ${err.message}`, 'yellow');
  }
}

function showUsage() {
  const currentVersion = readVersion();
  const nextPatch = incrementVersion(currentVersion, 'patch');
  const nextMinor = incrementVersion(currentVersion, 'minor');
  const nextMajor = incrementVersion(currentVersion, 'major');

  log('\n📦 ADHD Life Release', 'blue');
  log('═════════════════════════════════════════\n');
  log('Usage: pnpm release [options]\n');
  log('Options:', 'cyan');
  log('  (no args)                   Auto-increment patch version');
  log('  --bump=major|minor|patch    Which segment to increment (default: patch)');
  log('  --version=X.Y.Z             Use specific version (skips auto-increment)\n');
  log('Current version:', 'green');
  log(`  ${currentVersion}\n`);
  log('Next versions:', 'green');
  log(`  patch → ${nextPatch}`);
  log(`  minor → ${nextMinor}`);
  log(`  major → ${nextMajor}\n`);
  log('Examples:', 'cyan');
  log('  pnpm release                       # Release ' + nextPatch);
  log('  pnpm release --bump=minor          # Release ' + nextMinor);
  log('  pnpm release --bump=major          # Release ' + nextMajor);
  log('  pnpm release --version=1.0.0       # Release 1.0.0\n');
  log('This will:');
  log('  1. Build desktop for macOS & Windows');
  log('  2. Build mobile for iOS & Android');
  log('  3. Create GitHub Release');
  log('  4. Update VERSION file\n');
  log('Prerequisites:', 'yellow');
  log('  • gh CLI installed: https://cli.github.com');
  log('  • gh authenticated: gh auth login');
  log('  • EAS_TOKEN secret set in GitHub repo settings\n');
}

// Show usage if --help or -h
if (args.includes('--help') || args.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Validate bump type
if (!isValidBumpType(bumpType)) {
  log(`\n❌ Invalid bump type: ${bumpType}`, 'red');
  log('Must be one of: major, minor, patch\n', 'yellow');
  process.exit(1);
}

// Determine version
let version;
if (manualVersion) {
  if (!isValidVersion(manualVersion)) {
    log(`\n❌ Invalid version format: ${manualVersion}`, 'red');
    log('Must be semantic version like: 1.0.0\n', 'yellow');
    process.exit(1);
  }
  version = manualVersion;
} else {
  const current = readVersion();
  version = incrementVersion(current, bumpType);
}

log('\n🚀 Starting build & release', 'blue');
log('═════════════════════════════════════════\n');
log(`Version: ${version}`, 'cyan');
log('Building for: macOS · Windows · iOS · Android\n', 'cyan');

// Trigger workflow via gh CLI
const cmd = `gh workflow run build-and-release.yml -f version=${version} -f bump_type=${bumpType} -f create_release=true`;
exec(cmd);

// Update VERSION file to the released version (workflow will also commit this back)
updateVersionFile(version);

log('\n✅ Workflow triggered!', 'green');
log(`VERSION file updated to ${version}\n`, 'green');
log('Monitor at: https://github.com/ASThome00/adhd-life/actions\n', 'cyan');
log('When complete, release will be available at:', 'yellow');
log('https://github.com/ASThome00/adhd-life/releases/tag/v' + version + '\n');
