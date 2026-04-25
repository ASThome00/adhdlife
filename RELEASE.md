# Release — ADHD Life

Automated build & release via GitHub Actions. Version increments automatically.

## Quick Release

```bash
# Auto-increment patch version
pnpm release

# Or specify exact version
pnpm release --version=1.0.0
```

The script will:
1. Read `VERSION` file (currently `0.0.1`)
2. Auto-increment patch version or use your override
3. Trigger build workflow for all platforms
4. Create GitHub Release with all artifacts
5. Update `VERSION` file for next time

---

## Version Management

**Current:** See `VERSION` file in repo root

**Auto-increment examples:**
```
0.0.1 → 0.0.2 (patch)
0.0.2 → 0.0.3 (patch)
1.2.5 → 1.2.6 (patch)
```

**Manual override:**
```bash
pnpm release --version=1.0.0    # Jump to 1.0.0
pnpm release --version=2.0.0    # Jump to 2.0.0
```

---

## How It Works

**Local side:**
```bash
pnpm release
```
↓ reads VERSION → increments patch → triggers workflow

**GitHub Actions side:**
- macOS runner: builds desktop + iOS
- Windows runner: builds desktop
- Ubuntu runner: builds Android
- Final step: creates release with all artifacts

**Result:**
- Release page: `https://github.com/ASThome00/adhd-life/releases/tag/v0.0.2`
- Artifacts: DMG, EXE, APK, IPA (EAS)
- `VERSION` file auto-updated to `0.0.3`

---

## Prerequisites

1. **gh CLI** installed & authenticated
   ```bash
   # Install
   brew install gh    # macOS
   winget install github-cli  # Windows
   
   # Authenticate
   gh auth login
   ```

2. **EAS_TOKEN** secret in GitHub repo settings
   - Get token from https://expo.dev
   - Add as GitHub secret: Settings → Secrets → `EAS_TOKEN`

---

## Version Format

Must be semantic: `MAJOR.MINOR.PATCH`

Valid:
- `1.0.0`
- `2.1.5`
- `0.1.0`

Invalid:
- `1.0` ❌
- `v1.0.0` ❌ (don't include 'v')
- `alpha` ❌

---

## Monitoring

Once you run the command:
1. GitHub Actions workflow starts automatically
2. Monitor at: https://github.com/ASThome00/adhd-life/actions
3. Three build jobs run in parallel
4. When done, release is created at: `https://github.com/ASThome00/adhd-life/releases/tag/v{version}`

Takes ~15-20 minutes total.

---

## Download Artifacts

### macOS
```
https://github.com/ASThome00/adhd-life/releases/download/v1.0.0/adhd-life_1.0.0_universal.dmg
```

### Windows
```
https://github.com/ASThome00/adhd-life/releases/download/v1.0.0/adhd-life_1.0.0_x64.exe
```

### Mobile (EAS)
- iOS: Available via EAS dashboard + TestFlight
- Android: Available via EAS dashboard + Google Play

---

## Manual Trigger (GitHub UI)

Don't have `pnpm` or `gh`? Trigger from GitHub:

1. Go to Actions tab
2. Click "Build & Release" workflow
3. Click "Run workflow"
4. Enter version
5. Click "Run"

---

## Troubleshooting

**"gh command not found"**
- Install: `brew install gh` (macOS) or https://cli.github.com

**"Not authenticated to GitHub"**
- Run: `gh auth login`
- Select "HTTPS" when prompted

**"EAS_TOKEN not found"**
- Add to repo: Settings → Secrets and variables → Actions
- Create new secret: Name=`EAS_TOKEN`, Value=your EAS token from https://expo.dev

**Workflow fails on mobile builds**
- Check EAS_TOKEN is set correctly
- Verify EAS account is active
- Check EAS logs at https://expo.dev/accounts/your-account/builds

---

## Version History

Track releases at: https://github.com/ASThome00/adhd-life/releases

Each release includes:
- DMG (macOS)
- EXE (Windows)
- Build info & links to EAS for mobile artifacts
