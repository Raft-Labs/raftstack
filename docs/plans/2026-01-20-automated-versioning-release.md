# Automated Versioning and Release Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up automated semantic versioning (patch/minor/major), GitHub releases, and npm publishing on push to main.

**Architecture:** Use standard-version for semantic versioning and changelog generation, GitHub Actions for automated releases and npm publishing, and conventional commits for determining version bumps.

**Tech Stack:** standard-version, GitHub Actions, npm, conventional commits

---

## Task 1: Install and Configure standard-version

**Files:**
- Modify: `package.json`
- Create: `.versionrc.json`

**Step 1: Install standard-version**

Run:
```bash
pnpm add -D standard-version
```

Expected: Adds standard-version to devDependencies

**Step 2: Add version scripts to package.json**

Add these scripts to the `scripts` section:

```json
{
  "scripts": {
    "release": "standard-version",
    "release:patch": "standard-version --release-as patch",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major",
    "release:first": "standard-version --first-release"
  }
}
```

**Step 3: Create .versionrc.json configuration**

Create file with:

```json
{
  "types": [
    { "type": "feat", "section": "Features" },
    { "type": "fix", "section": "Bug Fixes" },
    { "type": "docs", "section": "Documentation" },
    { "type": "style", "section": "Styles" },
    { "type": "refactor", "section": "Code Refactoring" },
    { "type": "perf", "section": "Performance Improvements" },
    { "type": "test", "section": "Tests" },
    { "type": "build", "section": "Build System" },
    { "type": "ci", "section": "CI/CD" },
    { "type": "chore", "hidden": true }
  ],
  "releaseCommitMessageFormat": "chore(release): {{currentTag}}",
  "skip": {
    "tag": true
  }
}
```

**Step 4: Verify configuration**

Run:
```bash
pnpm release:patch --dry-run
```

Expected: Shows what would be bumped without making changes

**Step 5: Commit configuration**

```bash
git add package.json pnpm-lock.yaml .versionrc.json
git commit -m "build: add standard-version for automated versioning"
```

---

## Task 2: Create Automated Release Workflow

**Files:**
- Create: `.github/workflows/release.yml`

**Step 1: Create release workflow file**

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches:
      - main
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - '.github/workflows/ci.yml'

jobs:
  release:
    # Only run if commit message doesn't contain 'chore(release)'
    if: "!contains(github.event.head_commit.message, 'chore(release)')"
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 10.23.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test:run

      - name: Build package
        run: pnpm build

      - name: Configure Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Bump version and generate changelog
        id: version
        run: |
          pnpm release
          echo "version=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT
          echo "tag=v$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT

      - name: Push changes and tag
        run: |
          git push --follow-tags origin main

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ steps.version.outputs.tag }}
          release_name: Release ${{ steps.version.outputs.tag }}
          body_path: CHANGELOG.md
          draft: false
          prerelease: false
```

**Step 2: Verify workflow syntax**

Run:
```bash
cat .github/workflows/release.yml
```

Expected: File content matches above

**Step 3: Commit workflow**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add automated release workflow"
```

---

## Task 3: Update Publish Workflow to Use Release Tags

**Files:**
- Modify: `.github/workflows/publish.yml`

**Step 1: Update publish workflow to extract version from tag**

Modify `.github/workflows/publish.yml` to add version extraction and better release notes:

```yaml
name: Publish to NPM

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 10.23.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test:run

      - name: Build package
        run: pnpm build

      - name: Configure npm authentication
        run: |
          echo "//registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}" > .npmrc

      - name: Publish to NPM
        run: pnpm publish --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Step 2: Verify workflow syntax**

Run:
```bash
cat .github/workflows/publish.yml
```

Expected: File content updated

**Step 3: Commit changes**

```bash
git add .github/workflows/publish.yml
git commit -m "ci: update publish workflow to trigger on GitHub releases"
```

---

## Task 4: Add npm Version Commands Documentation

**Files:**
- Modify: `README.md`

**Step 1: Add versioning section to README**

Add to the README.md in the "Development" or "Contributing" section:

```markdown
## Versioning and Releases

This project uses [Semantic Versioning](https://semver.org/) and automated releases.

### Version Bumping

Use npm scripts to bump versions locally:

```bash
# Patch release (1.0.0 -> 1.0.1) - bug fixes
pnpm release:patch

# Minor release (1.0.0 -> 1.1.0) - new features, backwards compatible
pnpm release:minor

# Major release (1.0.0 -> 2.0.0) - breaking changes
pnpm release:major

# Automatic bump based on conventional commits
pnpm release
```

### Automated Releases

Releases are automated via GitHub Actions:

1. **Push to main** triggers the release workflow
2. Workflow runs tests, bumps version, generates changelog
3. Creates and pushes git tag
4. Creates GitHub release
5. Publishes to npm

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add new feature` → minor version bump
- `fix: bug fix` → patch version bump
- `feat!: breaking change` or `BREAKING CHANGE:` in footer → major version bump
- `docs:`, `chore:`, `style:`, `refactor:`, `test:` → no version bump

### Manual Publishing

To publish manually (emergency only):

```bash
npm version patch|minor|major
git push --follow-tags
```

The publish workflow will trigger automatically on tag push.
```

**Step 2: Verify README addition**

Run:
```bash
grep -A 20 "Versioning and Releases" README.md
```

Expected: Shows the added section

**Step 3: Commit README**

```bash
git add README.md
git commit -m "docs: add versioning and release documentation"
```

---

## Task 5: Create Release Testing Guide

**Files:**
- Create: `docs/RELEASING.md`

**Step 1: Create releasing guide**

Create `docs/RELEASING.md`:

```markdown
# Release Process Guide

## Automated Release Process

### Prerequisites

1. All changes merged to `main` branch
2. CI tests passing
3. `NPM_TOKEN` secret configured in GitHub repository settings

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
```

**Step 2: Verify file created**

Run:
```bash
cat docs/RELEASING.md
```

Expected: File content as above

**Step 3: Commit releasing guide**

```bash
git add docs/RELEASING.md
git commit -m "docs: add release process guide"
```

---

## Task 6: Update CI Workflow to Skip Release Commits

**Files:**
- Modify: `.github/workflows/ci.yml`

**Step 1: Add release commit skip condition**

Modify `.github/workflows/ci.yml` to skip CI on release commits:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  validate:
    # Skip CI on release commits
    if: "!contains(github.event.head_commit.message, 'chore(release)')"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm test:run
      - run: pnpm build
```

**Step 2: Verify CI workflow**

Run:
```bash
cat .github/workflows/ci.yml
```

Expected: Shows updated workflow with skip condition

**Step 3: Commit CI update**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: skip CI on automated release commits"
```

---

## Task 7: Test the Release Flow (Dry Run)

**Files:**
- None (testing only)

**Step 1: Create a test commit**

```bash
git checkout -b test-release-flow
echo "# Test" >> TEST_RELEASE.md
git add TEST_RELEASE.md
git commit -m "feat: test automated release workflow"
```

**Step 2: Test version bump locally**

Run:
```bash
pnpm release --dry-run
```

Expected: Shows it would bump to 1.1.0 (minor) and list commits

**Step 3: Test specific version bumps**

Run:
```bash
pnpm release:patch --dry-run
pnpm release:minor --dry-run
pnpm release:major --dry-run
```

Expected: Each shows appropriate version bump

**Step 4: Clean up test branch**

```bash
git checkout main
git branch -D test-release-flow
rm -f TEST_RELEASE.md
```

---

## Task 8: Configure GitHub Repository Settings

**Files:**
- None (GitHub settings)

**Step 1: Verify NPM_TOKEN secret exists**

Manual step in GitHub UI:
1. Go to repository Settings → Secrets and variables → Actions
2. Verify `NPM_TOKEN` exists
3. If not, create it with your npm access token

**Step 2: Enable GitHub Actions write permissions**

Manual step in GitHub UI:
1. Go to repository Settings → Actions → General
2. Under "Workflow permissions", select "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"
4. Click Save

**Step 3: Document settings in RELEASING.md**

Add to `docs/RELEASING.md` under Prerequisites:

```markdown
### Repository Setup (One-time)

1. **NPM_TOKEN Secret**
   - Settings → Secrets → Actions → New repository secret
   - Name: `NPM_TOKEN`
   - Value: Your npm access token with publish permissions

2. **GitHub Actions Permissions**
   - Settings → Actions → General → Workflow permissions
   - Select: "Read and write permissions"
   - Enable: "Allow GitHub Actions to create and approve pull requests"
```

**Step 4: Commit documentation update**

```bash
git add docs/RELEASING.md
git commit -m "docs: add repository setup instructions"
```

---

## Task 9: Create First Automated Release

**Files:**
- Multiple (automated)

**Step 1: Ensure all changes are committed**

Run:
```bash
git status
```

Expected: Working tree clean

**Step 2: Push to main to trigger release**

Run:
```bash
git push origin main
```

Expected: Triggers release workflow

**Step 3: Monitor GitHub Actions**

Manual step:
1. Go to repository → Actions tab
2. Watch "Release" workflow run
3. Verify it completes successfully
4. Check that version was bumped
5. Verify tag was created
6. Confirm GitHub release exists

**Step 4: Verify npm package published**

Run:
```bash
npm view @raftlabs/raftstack version
```

Expected: Shows new version number

**Step 5: Verify CHANGELOG.md created**

Run:
```bash
cat CHANGELOG.md
```

Expected: Shows changelog with latest version

---

## Task 10: Create Quick Reference Guide

**Files:**
- Create: `docs/VERSION_COMMANDS.md`

**Step 1: Create quick reference**

Create `docs/VERSION_COMMANDS.md`:

```markdown
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
pnpm release:patch   # 1.0.0 → 1.0.1
pnpm release:minor   # 1.0.0 → 1.1.0
pnpm release:major   # 1.0.0 → 2.0.0
```

## Commit Message → Version Mapping

| Commit Prefix | Example | Version Change |
|---------------|---------|----------------|
| `fix:` | `fix: resolve issue` | Patch (1.0.0 → 1.0.1) |
| `feat:` | `feat: add feature` | Minor (1.0.0 → 1.1.0) |
| `feat!:` or `BREAKING CHANGE:` | `feat!: remove API` | Major (1.0.0 → 2.0.0) |
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
```

**Step 2: Verify file created**

Run:
```bash
cat docs/VERSION_COMMANDS.md
```

Expected: Shows quick reference content

**Step 3: Commit quick reference**

```bash
git add docs/VERSION_COMMANDS.md
git commit -m "docs: add version commands quick reference"
```

---

## Post-Implementation Verification

### Checklist

- [ ] `standard-version` installed and configured
- [ ] `.versionrc.json` created with commit types
- [ ] Version scripts added to package.json
- [ ] Release workflow created and tested
- [ ] Publish workflow updated to trigger on releases
- [ ] CI workflow skips release commits
- [ ] Documentation added to README
- [ ] RELEASING.md guide created
- [ ] VERSION_COMMANDS.md quick reference created
- [ ] GitHub repository settings configured
- [ ] First automated release successful
- [ ] npm package published with new version
- [ ] CHANGELOG.md generated correctly

### Success Criteria

1. Push to main automatically creates release
2. Version bumps correctly based on commits
3. CHANGELOG.md is generated/updated
4. GitHub release is created
5. npm package is published
6. All workflows complete without errors

### Testing Scenarios

Test these scenarios after implementation:

1. **Patch release**: Commit with `fix:` prefix → should bump patch
2. **Minor release**: Commit with `feat:` prefix → should bump minor
3. **Major release**: Commit with `feat!:` → should bump major
4. **No release**: Commit with `docs:` → should not create release
5. **Multiple commits**: Mix of types → should bump to highest type

---

## Rollback Plan

If something breaks:

1. **Disable workflows**: Rename workflow files to `.disabled`
2. **Manual publish**: Use `npm publish` directly
3. **Fix and re-enable**: Fix issues, rename workflows back
4. **Test on fork**: Create fork to test workflow changes safely