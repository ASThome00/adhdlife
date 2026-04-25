#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const manualVersion = args.find(a => a.startsWith('--version='))?.split('=')[1];
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

function incrementVersion(version) {
  const parts = version.split('.');
  if (parts.length !== 3 || !parts.every(p => /^\d+$/.test(p))) {
    log(`❌ Invalid version format in VERSION file: ${version}`, 'red');
    log('Expected format: MAJOR.MINOR.PATCH', 'yellow');
    process.exit(1);
  }
  parts[2] = String(parseInt(parts[2]) + 1);
  return parts.join('.');
}

function isValidVersion(v) {
  return /^\d+\.\d+\.\d+$/.test(v);
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
  const nextVersion = incrementVersion(currentVersion);

  log('\n📦 ADHD Life Release', 'blue');
  log('═════════════════════════════════════════\n');
  log('Usage: pnpm release [options]\n');
  log('Options:', 'cyan');
  log('  (no args)              Auto-increment patch version');
  log('  --version=X.Y.Z        Use specific version\n');
  log('Current version:', 'green');
  log(`  ${currentVersion}\n`);
  log('Next version:', 'green');
  log(`  ${nextVersion}\n`);
  log('Examples:', 'cyan');
  log('  pnpm release                    # Release ' + nextVersion);
  log('  pnpm release --version=1.0.0    # Release 1.0.0\n');
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
  version = incrementVersion(current);
}

log('\n🚀 Starting build & release', 'blue');
log('═════════════════════════════════════════\n');
log(`Version: ${version}`, 'cyan');
log('Building for: macOS · Windows · iOS · Android\n', 'cyan');

// Trigger workflow via gh CLI
const cmd = `gh workflow run build-and-release.yml -f version=${version} -f create_release=true`;
exec(cmd);

// Update VERSION file for next time
const nextVersion = incrementVersion(version);
updateVersionFile(nextVersion);

log('\n✅ Workflow triggered!', 'green');
log(`VERSION file updated to ${nextVersion} for next release\n`, 'green');
log('Monitor at: https://github.com/ASThome00/adhd-life/actions\n', 'cyan');
log('When complete, release will be available at:', 'yellow');
log('https://github.com/ASThome00/adhd-life/releases/tag/v' + version + '\n');
