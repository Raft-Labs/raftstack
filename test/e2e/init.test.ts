import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  readFileSync,
  mkdtempSync,
  rmSync,
  existsSync,
  cpSync,
  statSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

// Import generators
import {
  generateHuskyHooks,
  generateCommitlint,
  generateCzGit,
  getLintStagedConfig,
  generateBranchValidation,
  generatePRTemplate,
  generateGitHubWorkflows,
  generateCodeowners,
  generateAIReview,
  generateBranchProtectionDocs,
  generateContributing,
  generatePrettier,
  generateClaudeSkills,
} from "../../src/generators/index.js";

// Import utils
import {
  addPackageJsonConfig,
  mergeScripts,
  readPackageJson,
  writePackageJson,
} from "../../src/utils/package-json.js";

import type {
  GeneratorResult,
  ProjectType,
  AIReviewTool,
} from "../../src/types/config.js";
import { getPackageManagerInfo } from "../../src/utils/detect-package-manager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = join(__dirname, "..", "fixtures");

let TEST_DIR: string;

/**
 * Run full init simulation with given config
 */
async function runFullInit(
  targetDir: string,
  config: {
    projectType: ProjectType;
    usesTypeScript: boolean;
    usesEslint: boolean;
    usesPrettier: boolean;
    asanaBaseUrl?: string;
    codeowners: string[];
    aiReviewTool: AIReviewTool;
  }
): Promise<GeneratorResult> {
  const results: GeneratorResult[] = [];

  // Default to pnpm for E2E tests
  const pm = getPackageManagerInfo("pnpm");

  // Core Git hooks and commit conventions
  results.push(await generateHuskyHooks(targetDir, config.projectType, pm));
  results.push(await generateCommitlint(targetDir, config.asanaBaseUrl));
  results.push(await generateCzGit(targetDir, config.asanaBaseUrl));
  results.push(await generateBranchValidation(targetDir));

  // Prettier (only if not already configured)
  if (!config.usesPrettier) {
    results.push(await generatePrettier(targetDir));
  }

  // GitHub integration
  results.push(await generatePRTemplate(targetDir, !!config.asanaBaseUrl));
  results.push(
    await generateGitHubWorkflows(
      targetDir,
      config.projectType,
      config.usesTypeScript,
      config.usesEslint,
      pm
    )
  );
  results.push(await generateCodeowners(targetDir, config.codeowners));
  results.push(await generateAIReview(targetDir, config.aiReviewTool));
  results.push(await generateBranchProtectionDocs(targetDir));

  // Documentation
  results.push(await generateContributing(targetDir, !!config.asanaBaseUrl, pm));

  // Claude Code skills
  results.push(await generateClaudeSkills(targetDir));

  // Update package.json with scripts and lint-staged config
  // Note: devDependencies are installed via CLI in the real init command
  let pkg = await readPackageJson(targetDir);
  pkg = mergeScripts(pkg, { prepare: "husky", commit: "czg" }, false);

  // Add lint-staged config to package.json
  const lintStagedConfig = getLintStagedConfig(
    config.usesEslint,
    !config.usesPrettier, // If prettier wasn't configured, we added it
    config.usesTypeScript
  );
  pkg = addPackageJsonConfig(pkg, "lint-staged", lintStagedConfig, true);

  await writePackageJson(pkg, targetDir);
  results.push({
    created: [],
    modified: ["package.json"],
    skipped: [],
    backedUp: [],
  });

  // Merge results
  return results.reduce(
    (acc, result) => ({
      created: [...acc.created, ...result.created],
      modified: [...acc.modified, ...result.modified],
      skipped: [...acc.skipped, ...result.skipped],
      backedUp: [...acc.backedUp, ...result.backedUp],
    }),
    { created: [], modified: [], skipped: [], backedUp: [] }
  );
}

/**
 * Copy fixture to temp directory
 */
function copyFixture(fixtureName: string): string {
  const fixtureDir = join(FIXTURES_DIR, fixtureName);
  const tempDir = mkdtempSync(join(tmpdir(), `raftstack-e2e-${fixtureName}-`));
  cpSync(fixtureDir, tempDir, { recursive: true });
  return tempDir;
}

describe("E2E: Init Command", () => {
  afterEach(() => {
    if (TEST_DIR && existsSync(TEST_DIR)) {
      try {
        rmSync(TEST_DIR, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe("NX Project", () => {
    beforeEach(() => {
      TEST_DIR = copyFixture("nx-project");
    });

    it("should detect NX project and create appropriate files", async () => {
      const result = await runFullInit(TEST_DIR, {
        projectType: "nx",
        usesTypeScript: true,
        usesEslint: true,
        usesPrettier: false,
        codeowners: ["@team-lead"],
        aiReviewTool: "none",
      });

      // Core files created
      expect(existsSync(join(TEST_DIR, ".husky", "pre-commit"))).toBe(true);
      expect(existsSync(join(TEST_DIR, ".husky", "commit-msg"))).toBe(true);
      expect(existsSync(join(TEST_DIR, "commitlint.config.js"))).toBe(true);
      expect(existsSync(join(TEST_DIR, ".czrc"))).toBe(true);
      expect(existsSync(join(TEST_DIR, ".prettierrc"))).toBe(true);
      expect(existsSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"))).toBe(
        true
      );
      expect(existsSync(join(TEST_DIR, "CONTRIBUTING.md"))).toBe(true);

      // Verify lint-staged config is in package.json
      const pkg = JSON.parse(readFileSync(join(TEST_DIR, "package.json"), "utf-8"));
      expect(pkg).toHaveProperty("lint-staged");

      // Verify NX-specific workflow content
      const workflow = readFileSync(
        join(TEST_DIR, ".github", "workflows", "pr-checks.yml"),
        "utf-8"
      );
      expect(workflow).toContain("pnpm nx affected");
    });

    it("should have executable husky hooks", async () => {
      await runFullInit(TEST_DIR, {
        projectType: "nx",
        usesTypeScript: true,
        usesEslint: true,
        usesPrettier: false,
        codeowners: ["@team-lead"],
        aiReviewTool: "none",
      });

      const preCommitStats = statSync(join(TEST_DIR, ".husky", "pre-commit"));
      const commitMsgStats = statSync(join(TEST_DIR, ".husky", "commit-msg"));

      // Check executable bit (mode & 0o111)
      expect(preCommitStats.mode & 0o111).toBeGreaterThan(0);
      expect(commitMsgStats.mode & 0o111).toBeGreaterThan(0);
    });

    it("should update package.json with scripts and lint-staged config", async () => {
      await runFullInit(TEST_DIR, {
        projectType: "nx",
        usesTypeScript: true,
        usesEslint: true,
        usesPrettier: false,
        codeowners: ["@team-lead"],
        aiReviewTool: "none",
      });

      const pkg = JSON.parse(readFileSync(join(TEST_DIR, "package.json"), "utf-8"));

      expect(pkg.scripts).toHaveProperty("prepare", "husky");
      expect(pkg.scripts).toHaveProperty("commit", "czg");
      expect(pkg).toHaveProperty("lint-staged");
      // Note: devDependencies are installed via CLI in the real init command
    });
  });

  describe("Turbo Project", () => {
    beforeEach(() => {
      TEST_DIR = copyFixture("turbo-project");
    });

    it("should create Turbo-specific workflow", async () => {
      await runFullInit(TEST_DIR, {
        projectType: "turbo",
        usesTypeScript: true,
        usesEslint: true,
        usesPrettier: false,
        codeowners: ["@owner"],
        aiReviewTool: "none",
      });

      const workflow = readFileSync(
        join(TEST_DIR, ".github", "workflows", "pr-checks.yml"),
        "utf-8"
      );
      expect(workflow).toContain("pnpm turbo build");
      expect(workflow).toContain("pnpm turbo test");
    });

    it("should preserve existing turbo.json", async () => {
      const originalTurbo = readFileSync(join(TEST_DIR, "turbo.json"), "utf-8");

      await runFullInit(TEST_DIR, {
        projectType: "turbo",
        usesTypeScript: true,
        usesEslint: true,
        usesPrettier: false,
        codeowners: ["@owner"],
        aiReviewTool: "none",
      });

      const afterTurbo = readFileSync(join(TEST_DIR, "turbo.json"), "utf-8");
      expect(afterTurbo).toBe(originalTurbo);
    });
  });

  describe("pnpm Workspace Project", () => {
    beforeEach(() => {
      TEST_DIR = copyFixture("pnpm-workspace");
    });

    it("should create all expected files", async () => {
      const result = await runFullInit(TEST_DIR, {
        projectType: "pnpm-workspace",
        usesTypeScript: false,
        usesEslint: true,
        usesPrettier: false,
        codeowners: ["@monorepo-team"],
        aiReviewTool: "coderabbit",
      });

      expect(existsSync(join(TEST_DIR, ".husky", "pre-commit"))).toBe(true);
      expect(existsSync(join(TEST_DIR, ".coderabbit.yaml"))).toBe(true);
    });

    it("should preserve pnpm-workspace.yaml", async () => {
      const originalWorkspace = readFileSync(
        join(TEST_DIR, "pnpm-workspace.yaml"),
        "utf-8"
      );

      await runFullInit(TEST_DIR, {
        projectType: "pnpm-workspace",
        usesTypeScript: false,
        usesEslint: true,
        usesPrettier: false,
        codeowners: ["@owner"],
        aiReviewTool: "none",
      });

      const afterWorkspace = readFileSync(
        join(TEST_DIR, "pnpm-workspace.yaml"),
        "utf-8"
      );
      expect(afterWorkspace).toBe(originalWorkspace);
    });
  });

  describe("Single Project", () => {
    beforeEach(() => {
      TEST_DIR = copyFixture("single-project");
    });

    it("should create standard workflow for single project", async () => {
      await runFullInit(TEST_DIR, {
        projectType: "single",
        usesTypeScript: true,
        usesEslint: true,
        usesPrettier: false,
        codeowners: ["@developer"],
        aiReviewTool: "none",
      });

      const workflow = readFileSync(
        join(TEST_DIR, ".github", "workflows", "pr-checks.yml"),
        "utf-8"
      );
      expect(workflow).toContain("pnpm build");
      expect(workflow).toContain("pnpm test");
      expect(workflow).not.toContain("turbo");
      expect(workflow).not.toContain("nx");
    });

    it("should include TypeScript check when project uses TypeScript", async () => {
      await runFullInit(TEST_DIR, {
        projectType: "single",
        usesTypeScript: true,
        usesEslint: false,
        usesPrettier: false,
        codeowners: ["@developer"],
        aiReviewTool: "none",
      });

      const workflow = readFileSync(
        join(TEST_DIR, ".github", "workflows", "pr-checks.yml"),
        "utf-8"
      );
      expect(workflow).toContain("pnpm typecheck");
    });

    it("should preserve existing tsconfig.json", async () => {
      const originalTsconfig = readFileSync(join(TEST_DIR, "tsconfig.json"), "utf-8");

      await runFullInit(TEST_DIR, {
        projectType: "single",
        usesTypeScript: true,
        usesEslint: true,
        usesPrettier: false,
        codeowners: ["@owner"],
        aiReviewTool: "none",
      });

      const afterTsconfig = readFileSync(join(TEST_DIR, "tsconfig.json"), "utf-8");
      expect(afterTsconfig).toBe(originalTsconfig);
    });
  });

  describe("With Asana Integration", () => {
    beforeEach(() => {
      TEST_DIR = copyFixture("single-project");
    });

    it("should include Asana references in generated files", async () => {
      await runFullInit(TEST_DIR, {
        projectType: "single",
        usesTypeScript: true,
        usesEslint: true,
        usesPrettier: false,
        asanaBaseUrl: "https://app.asana.com/0/workspace",
        codeowners: ["@owner"],
        aiReviewTool: "none",
      });

      const commitlint = readFileSync(
        join(TEST_DIR, "commitlint.config.js"),
        "utf-8"
      );
      expect(commitlint).toContain("asana-task-link");

      const czConfig = readFileSync(join(TEST_DIR, "cz.config.js"), "utf-8");
      expect(czConfig).toContain("asana:");

      const prTemplate = readFileSync(
        join(TEST_DIR, ".github", "PULL_REQUEST_TEMPLATE.md"),
        "utf-8"
      );
      expect(prTemplate).toContain("Asana Task");

      const contributing = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
      expect(contributing).toContain("Linking to Asana");
    });
  });

  describe("With AI Review Tools", () => {
    beforeEach(() => {
      TEST_DIR = copyFixture("single-project");
    });

    it("should create CodeRabbit config when selected", async () => {
      await runFullInit(TEST_DIR, {
        projectType: "single",
        usesTypeScript: true,
        usesEslint: true,
        usesPrettier: false,
        codeowners: ["@owner"],
        aiReviewTool: "coderabbit",
      });

      expect(existsSync(join(TEST_DIR, ".coderabbit.yaml"))).toBe(true);
    });

    it("should create Copilot workflow when selected", async () => {
      await runFullInit(TEST_DIR, {
        projectType: "single",
        usesTypeScript: true,
        usesEslint: true,
        usesPrettier: false,
        codeowners: ["@owner"],
        aiReviewTool: "copilot",
      });

      expect(
        existsSync(join(TEST_DIR, ".github", "workflows", "copilot-review.yml"))
      ).toBe(true);
    });
  });

  describe("File Permissions", () => {
    beforeEach(() => {
      TEST_DIR = copyFixture("single-project");
    });

    it("should set correct permissions on husky hooks", async () => {
      await runFullInit(TEST_DIR, {
        projectType: "single",
        usesTypeScript: true,
        usesEslint: true,
        usesPrettier: false,
        codeowners: ["@owner"],
        aiReviewTool: "none",
      });

      const hooks = [".husky/pre-commit", ".husky/commit-msg", ".husky/pre-push"];

      for (const hook of hooks) {
        const hookPath = join(TEST_DIR, hook);
        if (existsSync(hookPath)) {
          const stats = statSync(hookPath);
          // Check executable bit
          expect(stats.mode & 0o111).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Idempotency", () => {
    beforeEach(() => {
      TEST_DIR = copyFixture("single-project");
    });

    it("should handle running init twice gracefully", async () => {
      const config = {
        projectType: "single" as ProjectType,
        usesTypeScript: true,
        usesEslint: true,
        usesPrettier: false,
        codeowners: ["@owner"],
        aiReviewTool: "none" as AIReviewTool,
      };

      // Run first time
      await runFullInit(TEST_DIR, config);

      // Run second time - should backup existing files
      const result = await runFullInit(TEST_DIR, config);

      // Should have backed up existing files
      expect(result.backedUp.length).toBeGreaterThan(0);

      // Files should still exist and be valid
      expect(existsSync(join(TEST_DIR, ".husky", "pre-commit"))).toBe(true);
      expect(existsSync(join(TEST_DIR, "commitlint.config.js"))).toBe(true);
    });
  });
});
