# Quick Version Reference

## TL;DR

Push to main = automatic release. That's it.

## Commands for Maintainers

### Automated (Recommended)
```bash
# Just push to main - that's it!
git push origin main
```

### Manual Version Bumping (Rare)
```bash
# Automatic bump based on commits
pnpm release

# Specific version type
pnpm release:patch   # 1.0.0 -> 1.0.1
pnpm release:minor   # 1.0.0 -> 1.1.0
pnpm release:major   # 1.0.0 -> 2.0.0
```

## Commit Message -> Version Mapping

| Commit Prefix | Example | Version Change |
|---------------|---------|----------------|
| `fix:` | `fix: resolve issue` | Patch (1.0.0 -> 1.0.1) |
| `feat:` | `feat: add feature` | Minor (1.0.0 -> 1.1.0) |
| `feat!:` or `BREAKING CHANGE:` | `feat!: remove API` | Major (1.0.0 -> 2.0.0) |
| `docs:`, `chore:`, etc. | `docs: update readme` | No version change |

## Testing Locally

```bash
# See what version would be bumped to
pnpm release --dry-run

# Test package before publish
pnpm pack:test
```

## Workflow Sequence

1. Merge PR to `main`
2. **Release workflow** runs (auto-bumps version)
3. **Publish workflow** runs (publishes to npm)
4. Done!

## Emergency Procedures

### Deprecate bad version
```bash
npm deprecate @raftlabs/raftstack@x.x.x "reason"
```

### Skip release
Include `[skip ci]` in commit message

### Force specific version
```bash
pnpm release:patch --release-as 1.2.3
```
