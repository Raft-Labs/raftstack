# Release Process Guide

## Automated Release Process

### Prerequisites

1. All changes merged to `main` branch
2. CI tests passing
3. `NPM_TOKEN` secret configured in GitHub repository settings

### Repository Setup (One-time)

1. **NPM_TOKEN Secret**
   - Settings → Secrets → Actions → New repository secret
   - Name: `NPM_TOKEN`
   - Value: Your npm access token with publish permissions

2. **GitHub Actions Permissions**
   - Settings → Actions → General → Workflow permissions
   - Select: "Read and write permissions"
   - Enable: "Allow GitHub Actions to create and approve pull requests"

### Release Triggers

The release happens automatically when you push to `main`:

```bash
git push origin main
```

The workflow will:
1. Run tests and build
2. Analyze conventional commits since last release
3. Bump version in package.json
4. Generate/update CHANGELOG.md
5. Create git tag
6. Push tag and changes
7. Create GitHub release
8. Trigger npm publish

### Version Bump Rules

Based on conventional commits:

- `feat:` → **minor** version (1.0.0 → 1.1.0)
- `fix:` → **patch** version (1.0.0 → 1.0.1)
- `feat!:` or `BREAKING CHANGE:` → **major** version (1.0.0 → 2.0.0)

### Manual Release (Rarely Needed)

If automation fails or for special cases:

```bash
# 1. Bump version locally
pnpm release:patch  # or minor/major

# 2. Push the release commit and tag
git push --follow-tags origin main
```

This creates the tag which triggers npm publishing.

## Local Testing

Test version bumping without pushing:

```bash
# Dry run to see what would happen
pnpm release --dry-run

# Dry run for specific version
pnpm release:patch --dry-run
pnpm release:minor --dry-run
pnpm release:major --dry-run
```

## Troubleshooting

### Release workflow didn't trigger

- Check commit messages contain conventional commit types
- Verify push was to `main` branch
- Check GitHub Actions tab for workflow runs

### npm publish failed

- Verify `NPM_TOKEN` secret is set in repository settings
- Check token has publish permissions
- Verify package name is available (for first publish)

### Version conflict

If local version is out of sync:

```bash
git fetch origin
git reset --hard origin/main
```

## Emergency Rollback

If a bad version is published:

```bash
# Deprecate the bad version on npm
npm deprecate @raftlabs/raftstack@x.x.x "Reason for deprecation"

# Publish a new patch version with the fix
pnpm release:patch
git push --follow-tags origin main
```

## Release Checklist

Before merging to main:

- [ ] All tests pass locally
- [ ] Commit messages follow conventional commits
- [ ] BREAKING CHANGES documented if present
- [ ] CI is green on PR
