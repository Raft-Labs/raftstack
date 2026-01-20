import { join } from "node:path";
import type { GeneratorResult, PackageManagerInfo, ProjectType } from "../types/config.js";
import { ensureDir, writeFileSafe } from "../utils/file-system.js";

/**
 * Get the PR checks workflow content
 */
function getPRChecksWorkflow(
  projectType: ProjectType,
  usesTypeScript: boolean,
  usesEslint: boolean,
  pm: PackageManagerInfo
): string {
  const steps: string[] = [];

  // Checkout
  steps.push(`      - name: Checkout
        uses: actions/checkout@v4`);

  // Setup Node
  steps.push(`
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'`);

  // Setup pnpm (only if needed)
  if (pm.needsSetupAction) {
    steps.push(`
      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9`);
  }

  // Install dependencies
  steps.push(`
      - name: Install dependencies
        run: ${pm.installFrozen}`);

  // TypeScript check
  if (usesTypeScript) {
    steps.push(`
      - name: Type check
        run: ${pm.run} typecheck`);
  }

  // ESLint
  if (usesEslint) {
    steps.push(`
      - name: Lint
        run: ${pm.run} lint`);
  }

  // Build (for NX/Turbo, use their commands)
  if (projectType === "nx") {
    steps.push(`
      - name: Build
        run: ${pm.run} nx affected --target=build --parallel=3`);
  } else if (projectType === "turbo") {
    steps.push(`
      - name: Build
        run: ${pm.run} turbo build`);
  } else {
    steps.push(`
      - name: Build
        run: ${pm.run} build`);
  }

  // Tests
  if (projectType === "nx") {
    steps.push(`
      - name: Test
        run: ${pm.run} nx affected --target=test --parallel=3`);
  } else if (projectType === "turbo") {
    steps.push(`
      - name: Test
        run: ${pm.run} turbo test`);
  } else {
    steps.push(`
      - name: Test
        run: ${pm.run} test`);
  }

  return `name: PR Checks

on:
  pull_request:
    branches: [main, master, develop]

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  check:
    name: Check
    runs-on: ubuntu-latest
    steps:
${steps.join("\n")}
`;
}

/**
 * Generate GitHub workflow files
 */
export async function generateGitHubWorkflows(
  targetDir: string,
  projectType: ProjectType,
  usesTypeScript: boolean,
  usesEslint: boolean,
  pm: PackageManagerInfo
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  const workflowsDir = join(targetDir, ".github", "workflows");
  await ensureDir(workflowsDir);

  // PR Checks workflow
  const prChecksPath = join(workflowsDir, "pr-checks.yml");
  const writeResult = await writeFileSafe(
    prChecksPath,
    getPRChecksWorkflow(projectType, usesTypeScript, usesEslint, pm),
    { backup: true }
  );

  if (writeResult.created) {
    result.created.push(".github/workflows/pr-checks.yml");
    if (writeResult.backedUp) {
      result.backedUp.push(writeResult.backedUp);
    }
  }

  return result;
}
