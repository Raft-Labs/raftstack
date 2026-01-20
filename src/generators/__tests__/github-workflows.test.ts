import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateGitHubWorkflows } from "../github-workflows.js";

let TEST_DIR: string;

describe("generateGitHubWorkflows", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should create .github/workflows/pr-checks.yml", async () => {
    const result = await generateGitHubWorkflows(TEST_DIR, "single", true, true);

    expect(result.created).toContain(".github/workflows/pr-checks.yml");
    expect(existsSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"))).toBe(true);
  });

  it("should create .github/workflows directory", async () => {
    await generateGitHubWorkflows(TEST_DIR, "single", true, true);

    expect(existsSync(join(TEST_DIR, ".github", "workflows"))).toBe(true);
  });

  it("should include checkout step", async () => {
    await generateGitHubWorkflows(TEST_DIR, "single", true, true);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("actions/checkout@v4");
  });

  it("should include pnpm setup", async () => {
    await generateGitHubWorkflows(TEST_DIR, "single", true, true);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("pnpm/action-setup");
  });

  it("should include typecheck when TypeScript is used", async () => {
    await generateGitHubWorkflows(TEST_DIR, "single", true, false);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("pnpm typecheck");
  });

  it("should not include typecheck when TypeScript is not used", async () => {
    await generateGitHubWorkflows(TEST_DIR, "single", false, false);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).not.toContain("pnpm typecheck");
  });

  it("should include lint when ESLint is used", async () => {
    await generateGitHubWorkflows(TEST_DIR, "single", false, true);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("pnpm lint");
  });

  it("should use NX commands for NX projects", async () => {
    await generateGitHubWorkflows(TEST_DIR, "nx", true, true);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("pnpm nx affected");
    expect(content).toContain("--target=build");
    expect(content).toContain("--target=test");
  });

  it("should use Turbo commands for Turbo projects", async () => {
    await generateGitHubWorkflows(TEST_DIR, "turbo", true, true);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("pnpm turbo build");
    expect(content).toContain("pnpm turbo test");
  });

  it("should use standard commands for single projects", async () => {
    await generateGitHubWorkflows(TEST_DIR, "single", true, true);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("pnpm build");
    expect(content).toContain("pnpm test");
  });

  it("should include concurrency settings", async () => {
    await generateGitHubWorkflows(TEST_DIR, "single", true, true);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("concurrency:");
    expect(content).toContain("cancel-in-progress: true");
  });

  it("should backup existing workflow", async () => {
    mkdirSync(join(TEST_DIR, ".github", "workflows"), { recursive: true });
    writeFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "# old");

    const result = await generateGitHubWorkflows(TEST_DIR, "single", true, true);

    expect(result.backedUp.length).toBeGreaterThan(0);
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generateGitHubWorkflows(TEST_DIR, "single", true, true);

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });
});
