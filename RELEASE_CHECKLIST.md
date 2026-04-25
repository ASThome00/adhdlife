# Release Checklist — ADHD Life

Automated builds + auto-versioning. Minimal friction.

## Pre-Release

- [ ] Run tests: `pnpm typecheck && pnpm lint`
- [ ] Test in dev: `pnpm dev` and `pnpm dev:mobile`
- [ ] Verify git is clean: `git status`
- [ ] Commit all changes to main
- [ ] Update `CHANGELOG.md` with features/fixes (optional but good practice)

## Release

```bash
pnpm release
```

That's it. Script will:
- ✅ Read VERSION file
- ✅ Auto-increment patch version
- ✅ Trigger builds for all platforms
- ✅ Create GitHub Release
- ✅ Update VERSION file for next time

If you want to jump versions:
```bash
pnpm release --version=1.0.0
```

Monitor at: https://github.com/ASThome00/adhd-life/actions (~15-20 minutes)

## Post-Release

- [ ] Verify release created: https://github.com/ASThome00/adhd-life/releases
- [ ] Download & spot-check one artifact (DMG or EXE)
- [ ] Share release link
- [ ] Monitor for crash reports (first 24h)

## If Something Goes Wrong

**Build failed?**
- Check Actions tab for error logs
- Fix issue locally, commit to main
- Run `pnpm release` again (will auto-increment)

**Need to skip a version?**
```bash
pnpm release --version=0.1.0
```

---

That's all. No version juggling across files.
