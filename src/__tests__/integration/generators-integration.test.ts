import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

// Import generators
import {
  generateHuskyHooks,
  generateCommitlint,
  generateCzGit,
  generateLintStaged,
  generateBranchValidation,
  generatePRTemplate,
  generateGitHubWorkflows,
  generateCodeowners,
  generateAIReview,
  generateBranchProtectionDocs,
  generateContributing,
  generatePrettier,
  generateClaudeSkills,
} from "../../generators/index.js";

// Import utils
import {
  mergeDevDependencies,
  mergeScripts,
  readPackageJson,
  writePackageJson,
  RAFTSTACK_DEV_DEPENDENCIES,
} from "../../utils/package-json.js";

let TEST_DIR: string;

describe("Generators Integration", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-integration-"));
    // Create minimal package.json
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({ name: "test-project", version: "1.0.0" }, null, 2)
    );
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  describe("Full init simulation for single project", () => {
    it("should create all expected files for a single TypeScript project", async () => {
      // Simulate TypeScript project
      writeFileSync(join(TEST_DIR, "tsconfig.json"), "{}");

      // Run all generators in the correct order
      const results = [];

      results.push(await generateHuskyHooks(TEST_DIR, "single"));
      results.push(await generateCommitlint(TEST_DIR, undefined));
      results.push(await generateCzGit(TEST_DIR, undefined));
      results.push(await generateLintStaged(TEST_DIR, "single", true, true, true));
      results.push(await generateBranchValidation(TEST_DIR));
      results.push(await generatePrettier(TEST_DIR));
      results.push(await generatePRTemplate(TEST_DIR, false));
      results.push(await generateGitHubWorkflows(TEST_DIR, "single", true, true));
      results.push(await generateCodeowners(TEST_DIR, ["@owner1"]));
      results.push(await generateAIReview(TEST_DIR, "none"));
      results.push(await generateBranchProtectionDocs(TEST_DIR));
      results.push(await generateContributing(TEST_DIR, false));
      results.push(await generateClaudeSkills(TEST_DIR));

      // Collect all created files
      const allCreated = results.flatMap((r) => r.created);

      // Verify core files exist
      expect(existsSync(join(TEST_DIR, ".husky", "pre-commit"))).toBe(true);
      expect(existsSync(join(TEST_DIR, ".husky", "commit-msg"))).toBe(true);
      expect(existsSync(join(TEST_DIR, "commitlint.config.js"))).toBe(true);
      expect(existsSync(join(TEST_DIR, ".czrc"))).toBe(true);
      expect(existsSync(join(TEST_DIR, ".lintstagedrc.js"))).toBe(true);
      expect(existsSync(join(TEST_DIR, ".prettierrc"))).toBe(true);
      expect(existsSync(join(TEST_DIR, ".github", "PULL_REQUEST_TEMPLATE.md"))).toBe(true);
      expect(existsSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"))).toBe(true);
      expect(existsSync(join(TEST_DIR, ".github", "CODEOWNERS"))).toBe(true);
      expect(existsSync(join(TEST_DIR, "CONTRIBUTING.md"))).toBe(true);
    });

    it("should update package.json with scripts and devDependencies", async () => {
      let pkg = await readPackageJson(TEST_DIR);

      // Add scripts
      pkg = mergeScripts(pkg, { prepare: "husky", commit: "czg" }, false);

      // Add devDependencies
      pkg = mergeDevDependencies(pkg, RAFTSTACK_DEV_DEPENDENCIES);

      await writePackageJson(pkg, TEST_DIR);

      // Verify
      const updated = JSON.parse(readFileSync(join(TEST_DIR, "package.json"), "utf-8"));

      expect(updated.scripts).toHaveProperty("prepare", "husky");
      expect(updated.scripts).toHaveProperty("commit", "czg");
      expect(updated.devDependencies).toHaveProperty("husky");
      expect(updated.devDependencies).toHaveProperty("@commitlint/cli");
      expect(updated.devDependencies).toHaveProperty("cz-git");
      expect(updated.devDependencies).toHaveProperty("lint-staged");
      expect(updated.devDependencies).toHaveProperty("validate-branch-name");
    });
  });

  describe("Full init simulation for NX project", () => {
    it("should create NX-specific workflow", async () => {
      writeFileSync(join(TEST_DIR, "nx.json"), "{}");
      writeFileSync(join(TEST_DIR, "tsconfig.base.json"), "{}");

      await generateGitHubWorkflows(TEST_DIR, "nx", true, true);

      const workflow = readFileSync(
        join(TEST_DIR, ".github", "workflows", "pr-checks.yml"),
        "utf-8"
      );
      expect(workflow).toContain("pnpm nx affected");
      expect(workflow).toContain("--target=build");
      expect(workflow).toContain("--target=test");
    });

    it("should create NX-specific lint-staged config", async () => {
      writeFileSync(join(TEST_DIR, "nx.json"), "{}");

      await generateLintStaged(TEST_DIR, "nx", true, true, true);

      const config = readFileSync(join(TEST_DIR, ".lintstagedrc.js"), "utf-8");
      expect(config).toContain("module.exports");
      expect(config).toContain("eslint --fix");
    });
  });

  describe("Full init simulation for Turbo project", () => {
    it("should create Turbo-specific workflow", async () => {
      writeFileSync(join(TEST_DIR, "turbo.json"), "{}");

      await generateGitHubWorkflows(TEST_DIR, "turbo", true, true);

      const workflow = readFileSync(
        join(TEST_DIR, ".github", "workflows", "pr-checks.yml"),
        "utf-8"
      );
      expect(workflow).toContain("pnpm turbo build");
      expect(workflow).toContain("pnpm turbo test");
    });
  });

  describe("With Asana integration", () => {
    it("should include Asana sections in relevant files", async () => {
      const asanaUrl = "https://app.asana.com/0/workspace";

      await generateCommitlint(TEST_DIR, asanaUrl);
      await generateCzGit(TEST_DIR, asanaUrl);
      await generatePRTemplate(TEST_DIR, true);
      await generateContributing(TEST_DIR, true);

      // Verify Asana references
      const commitlint = readFileSync(join(TEST_DIR, "commitlint.config.js"), "utf-8");
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

  describe("With AI review tools", () => {
    it("should create CodeRabbit config", async () => {
      await generateAIReview(TEST_DIR, "coderabbit");

      expect(existsSync(join(TEST_DIR, ".coderabbit.yaml"))).toBe(true);
      const config = readFileSync(join(TEST_DIR, ".coderabbit.yaml"), "utf-8");
      expect(config).toContain("reviews:");
    });

    it("should create Copilot workflow", async () => {
      await generateAIReview(TEST_DIR, "copilot");

      expect(existsSync(join(TEST_DIR, ".github", "workflows", "copilot-review.yml"))).toBe(
        true
      );
    });
  });

  describe("Backup behavior", () => {
    it("should backup existing files", async () => {
      // Create existing files
      mkdirSync(join(TEST_DIR, ".husky"), { recursive: true });
      writeFileSync(join(TEST_DIR, ".husky", "pre-commit"), "# old hook");
      writeFileSync(join(TEST_DIR, "commitlint.config.js"), "// old config");

      const huskyResult = await generateHuskyHooks(TEST_DIR, "single");
      const commitlintResult = await generateCommitlint(TEST_DIR, undefined);

      expect(huskyResult.backedUp.length).toBeGreaterThan(0);
      expect(commitlintResult.backedUp.length).toBeGreaterThan(0);

      // Verify backup files exist
      expect(existsSync(join(TEST_DIR, ".husky", "pre-commit.backup"))).toBe(true);
      expect(existsSync(join(TEST_DIR, "commitlint.config.js.backup"))).toBe(true);
    });
  });

  describe("Skip behavior", () => {
    it("should skip prettier if already configured", async () => {
      writeFileSync(join(TEST_DIR, ".prettierrc"), "{}");

      const result = await generatePrettier(TEST_DIR);

      expect(result.skipped).toContain(".prettierrc (already exists)");
      expect(result.created).not.toContain(".prettierrc");
    });

    it("should skip branch validation if already configured", async () => {
      writeFileSync(
        join(TEST_DIR, "package.json"),
        JSON.stringify({
          name: "test",
          "validate-branch-name": { pattern: "custom" },
        })
      );

      const result = await generateBranchValidation(TEST_DIR);

      expect(result.skipped).toContain("validate-branch-name config (already exists)");
    });
  });
});
