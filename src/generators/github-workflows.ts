import { join } from "node:path";
import type { GeneratorResult, ProjectType } from "../types/config.js";
import { ensureDir, writeFileSafe } from "../utils/file-system.js";

/**
 * Get the PR checks workflow content
 */
function getPRChecksWorkflow(
  projectType: ProjectType,
  usesTypeScript: boolean,
  usesEslint: boolean
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

  // Setup pnpm
  steps.push(`
      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9`);

  // Install dependencies
  steps.push(`
      - name: Install dependencies
        run: pnpm install --frozen-lockfile`);

  // TypeScript check
  if (usesTypeScript) {
    steps.push(`
      - name: Type check
        run: pnpm typecheck`);
  }

  // ESLint
  if (usesEslint) {
    steps.push(`
      - name: Lint
        run: pnpm lint`);
  }

  // Build (for NX/Turbo, use their commands)
  if (projectType === "nx") {
    steps.push(`
      - name: Build
        run: pnpm nx affected --target=build --parallel=3`);
  } else if (projectType === "turbo") {
    steps.push(`
      - name: Build
        run: pnpm turbo build`);
  } else {
    steps.push(`
      - name: Build
        run: pnpm build`);
  }

  // Tests
  if (projectType === "nx") {
    steps.push(`
      - name: Test
        run: pnpm nx affected --target=test --parallel=3`);
  } else if (projectType === "turbo") {
    steps.push(`
      - name: Test
        run: pnpm turbo test`);
  } else {
    steps.push(`
      - name: Test
        run: pnpm test`);
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
  usesEslint: boolean
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
    getPRChecksWorkflow(projectType, usesTypeScript, usesEslint),
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
