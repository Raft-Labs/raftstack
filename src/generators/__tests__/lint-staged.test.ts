import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateLintStaged } from "../lint-staged.js";

let TEST_DIR: string;

describe("generateLintStaged", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should create .lintstagedrc.js", async () => {
    const result = await generateLintStaged(TEST_DIR, "single", true, true, true);

    expect(result.created).toContain(".lintstagedrc.js");
  });

  it("should include ESLint when enabled", async () => {
    await generateLintStaged(TEST_DIR, "single", true, false, true);

    const content = readFileSync(join(TEST_DIR, ".lintstagedrc.js"), "utf-8");
    expect(content).toContain("eslint --fix");
  });

  it("should include Prettier when enabled", async () => {
    await generateLintStaged(TEST_DIR, "single", false, true, true);

    const content = readFileSync(join(TEST_DIR, ".lintstagedrc.js"), "utf-8");
    expect(content).toContain("prettier --write");
  });

  it("should include TypeScript patterns when enabled", async () => {
    await generateLintStaged(TEST_DIR, "single", true, true, true);

    const content = readFileSync(join(TEST_DIR, ".lintstagedrc.js"), "utf-8");
    expect(content).toContain("*.{ts,tsx}");
  });

  it("should always include JavaScript patterns", async () => {
    await generateLintStaged(TEST_DIR, "single", true, true, false);

    const content = readFileSync(join(TEST_DIR, ".lintstagedrc.js"), "utf-8");
    expect(content).toContain("*.{js,jsx,mjs,cjs}");
  });

  it("should include JSON/MD/YAML patterns with Prettier", async () => {
    await generateLintStaged(TEST_DIR, "single", false, true, false);

    const content = readFileSync(join(TEST_DIR, ".lintstagedrc.js"), "utf-8");
    expect(content).toContain("*.{json,md,yaml,yml}");
  });

  it("should include CSS patterns with Prettier", async () => {
    await generateLintStaged(TEST_DIR, "single", false, true, false);

    const content = readFileSync(join(TEST_DIR, ".lintstagedrc.js"), "utf-8");
    expect(content).toContain("*.{css,scss,less}");
  });

  it("should work with NX project type", async () => {
    const result = await generateLintStaged(TEST_DIR, "nx", true, true, true);

    expect(result.created).toContain(".lintstagedrc.js");
    const content = readFileSync(join(TEST_DIR, ".lintstagedrc.js"), "utf-8");
    expect(content).toContain("module.exports");
  });

  it("should work with Turbo project type", async () => {
    const result = await generateLintStaged(TEST_DIR, "turbo", true, true, true);

    expect(result.created).toContain(".lintstagedrc.js");
  });

  it("should work with pnpm-workspace project type", async () => {
    const result = await generateLintStaged(TEST_DIR, "pnpm-workspace", true, true, true);

    expect(result.created).toContain(".lintstagedrc.js");
  });

  it("should backup existing config", async () => {
    writeFileSync(join(TEST_DIR, ".lintstagedrc.js"), "// old config");

    const result = await generateLintStaged(TEST_DIR, "single", true, true, true);

    expect(result.backedUp.length).toBeGreaterThan(0);
    expect(result.backedUp[0]).toContain(".backup");
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generateLintStaged(TEST_DIR, "single", true, true, true);

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });

  it("should handle no eslint or prettier", async () => {
    await generateLintStaged(TEST_DIR, "single", false, false, true);

    const content = readFileSync(join(TEST_DIR, ".lintstagedrc.js"), "utf-8");
    expect(content).toContain("module.exports");
    // Should not have any file patterns since no tools are enabled
    expect(content).not.toContain("eslint");
    expect(content).not.toContain("prettier");
  });
});
