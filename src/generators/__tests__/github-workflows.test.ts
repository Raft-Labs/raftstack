import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateGitHubWorkflows } from "../github-workflows.js";
import { getPackageManagerInfo } from "../../utils/detect-package-manager.js";

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
    const pm = getPackageManagerInfo("npm");
    const result = await generateGitHubWorkflows(TEST_DIR, "single", true, true, pm);

    expect(result.created).toContain(".github/workflows/pr-checks.yml");
    expect(existsSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"))).toBe(true);
  });

  it("should create .github/workflows directory", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateGitHubWorkflows(TEST_DIR, "single", true, true, pm);

    expect(existsSync(join(TEST_DIR, ".github", "workflows"))).toBe(true);
  });

  it("should include checkout step", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateGitHubWorkflows(TEST_DIR, "single", true, true, pm);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("actions/checkout@v4");
  });

  it("should include pnpm setup when using pnpm", async () => {
    const pm = getPackageManagerInfo("pnpm");
    await generateGitHubWorkflows(TEST_DIR, "single", true, true, pm);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("pnpm/action-setup");
  });

  it("should not include pnpm setup when using npm", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateGitHubWorkflows(TEST_DIR, "single", true, true, pm);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).not.toContain("pnpm/action-setup");
  });

  it("should include typecheck when TypeScript is used with pnpm", async () => {
    const pm = getPackageManagerInfo("pnpm");
    await generateGitHubWorkflows(TEST_DIR, "single", true, false, pm);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("pnpm typecheck");
  });

  it("should not include typecheck when TypeScript is not used", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateGitHubWorkflows(TEST_DIR, "single", false, false, pm);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).not.toContain("typecheck");
  });

  it("should include lint when ESLint is used with npm", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateGitHubWorkflows(TEST_DIR, "single", false, true, pm);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("npm run lint");
  });

  it("should use yarn commands when yarn is selected", async () => {
    const pm = getPackageManagerInfo("yarn");
    await generateGitHubWorkflows(TEST_DIR, "single", true, true, pm);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("yarn install --frozen-lockfile");
    expect(content).toContain("yarn typecheck");
    expect(content).toContain("yarn lint");
  });

  it("should use NX commands for NX projects", async () => {
    const pm = getPackageManagerInfo("pnpm");
    await generateGitHubWorkflows(TEST_DIR, "nx", true, true, pm);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("pnpm nx affected");
    expect(content).toContain("--target=build");
    expect(content).toContain("--target=test");
  });

  it("should use Turbo commands for Turbo projects", async () => {
    const pm = getPackageManagerInfo("pnpm");
    await generateGitHubWorkflows(TEST_DIR, "turbo", true, true, pm);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("pnpm turbo build");
    expect(content).toContain("pnpm turbo test");
  });

  it("should use standard commands for single projects with npm", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateGitHubWorkflows(TEST_DIR, "single", true, true, pm);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("npm run build");
    expect(content).toContain("npm run test");
  });

  it("should include concurrency settings", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateGitHubWorkflows(TEST_DIR, "single", true, true, pm);

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "utf-8");
    expect(content).toContain("concurrency:");
    expect(content).toContain("cancel-in-progress: true");
  });

  it("should backup existing workflow", async () => {
    const pm = getPackageManagerInfo("npm");
    mkdirSync(join(TEST_DIR, ".github", "workflows"), { recursive: true });
    writeFileSync(join(TEST_DIR, ".github", "workflows", "pr-checks.yml"), "# old");

    const result = await generateGitHubWorkflows(TEST_DIR, "single", true, true, pm);

    expect(result.backedUp.length).toBeGreaterThan(0);
  });

  it("should return correct GeneratorResult shape", async () => {
    const pm = getPackageManagerInfo("npm");
    const result = await generateGitHubWorkflows(TEST_DIR, "single", true, true, pm);

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });
});
