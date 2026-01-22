import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  readFileSync,
  writeFileSync,
  mkdtempSync,
  rmSync,
  statSync,
  mkdirSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateHuskyHooks } from "../husky.js";

let TEST_DIR: string;

describe("generateHuskyHooks", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it("should create .husky directory", async () => {
    const result = await generateHuskyHooks(TEST_DIR, "single");

    expect(result.created).toContain(".husky/pre-commit");
    expect(result.created).toContain(".husky/commit-msg");
    expect(result.created).toContain(".husky/pre-push");
  });

  it("should create pre-commit hook with direct lint-staged command", async () => {
    await generateHuskyHooks(TEST_DIR, "single");

    const content = readFileSync(
      join(TEST_DIR, ".husky", "pre-commit"),
      "utf-8"
    );
    // Husky v9+ format: just the command, no shebang or shim needed
    expect(content).toContain("lint-staged");
    expect(content).not.toContain("npx");
    expect(content).not.toContain("pnpm dlx");
    expect(content).not.toContain("yarn dlx");
    // New format doesn't use shell wrapper
    expect(content).not.toContain("#!/usr/bin/env sh");
    expect(content).not.toContain("husky.sh");
  });

  it("should create commit-msg hook with direct commitlint command", async () => {
    await generateHuskyHooks(TEST_DIR, "single");

    const content = readFileSync(
      join(TEST_DIR, ".husky", "commit-msg"),
      "utf-8"
    );
    expect(content).toContain("commitlint --edit");
    expect(content).toContain('"$1"');
    // Should use direct command, not npx
    expect(content).not.toContain("npx");
    expect(content).not.toContain("--no --");
  });

  it("should create pre-push hook with direct validate-branch-name command", async () => {
    await generateHuskyHooks(TEST_DIR, "single");

    const content = readFileSync(
      join(TEST_DIR, ".husky", "pre-push"),
      "utf-8"
    );
    expect(content).toContain("validate-branch-name");
    // Should use direct command, not npx
    expect(content).not.toContain("npx");
  });

  it("should make hooks executable", async () => {
    await generateHuskyHooks(TEST_DIR, "single");

    const preCommitStats = statSync(join(TEST_DIR, ".husky", "pre-commit"));
    // Check if executable (mode & 0o111 should be non-zero)
    expect(preCommitStats.mode & 0o111).toBeGreaterThan(0);
  });

  it("should backup existing hooks", async () => {
    // Create existing hook
    mkdirSync(join(TEST_DIR, ".husky"), { recursive: true });
    writeFileSync(join(TEST_DIR, ".husky", "pre-commit"), "# old hook");

    const result = await generateHuskyHooks(TEST_DIR, "single");

    // backedUp contains full backup paths with .backup suffix
    expect(result.backedUp.length).toBeGreaterThan(0);
    expect(result.backedUp[0]).toContain(".backup");
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generateHuskyHooks(TEST_DIR, "single");

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
    expect(Array.isArray(result.created)).toBe(true);
    expect(Array.isArray(result.modified)).toBe(true);
    expect(Array.isArray(result.skipped)).toBe(true);
    expect(Array.isArray(result.backedUp)).toBe(true);
  });

  it("should work with NX project type", async () => {
    const result = await generateHuskyHooks(TEST_DIR, "nx");

    expect(result.created).toHaveLength(3);
    const content = readFileSync(
      join(TEST_DIR, ".husky", "pre-commit"),
      "utf-8"
    );
    expect(content).toContain("lint-staged");
  });

  it("should work with Turbo project type", async () => {
    const result = await generateHuskyHooks(TEST_DIR, "turbo");

    expect(result.created).toHaveLength(3);
  });

  it("should work with pnpm-workspace project type", async () => {
    const result = await generateHuskyHooks(TEST_DIR, "pnpm-workspace");

    expect(result.created).toHaveLength(3);
  });

  it("should ignore pm parameter (backward compatibility)", async () => {
    // The pm parameter is now ignored, but should not cause errors
    const mockPm = {
      name: "npm" as const,
      install: "npm install",
      run: "npm run",
      exec: "npx",
      lockfile: "package-lock.json",
      installFrozen: "npm ci",
      needsSetupAction: false,
      cacheKey: "npm",
    };

    const result = await generateHuskyHooks(TEST_DIR, "single", mockPm);

    expect(result.created).toHaveLength(3);
    // Should still use direct commands regardless of pm
    const content = readFileSync(
      join(TEST_DIR, ".husky", "pre-commit"),
      "utf-8"
    );
    expect(content).not.toContain("npx");
    expect(content).toContain("lint-staged");
  });
});
