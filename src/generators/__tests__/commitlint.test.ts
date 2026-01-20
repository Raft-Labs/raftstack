import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateCommitlint } from "../commitlint.js";

let TEST_DIR: string;

describe("generateCommitlint", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should create commitlint.config.js", async () => {
    const result = await generateCommitlint(TEST_DIR);

    expect(result.created).toContain("commitlint.config.js");
  });

  it("should extend @commitlint/config-conventional", async () => {
    await generateCommitlint(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, "commitlint.config.js"), "utf-8");
    expect(content).toContain("@commitlint/config-conventional");
  });

  it("should include all conventional commit types", async () => {
    await generateCommitlint(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, "commitlint.config.js"), "utf-8");
    expect(content).toContain("'feat'");
    expect(content).toContain("'fix'");
    expect(content).toContain("'docs'");
    expect(content).toContain("'style'");
    expect(content).toContain("'refactor'");
    expect(content).toContain("'perf'");
    expect(content).toContain("'test'");
    expect(content).toContain("'build'");
    expect(content).toContain("'ci'");
    expect(content).toContain("'chore'");
    expect(content).toContain("'revert'");
  });

  it("should include Asana task validation when baseUrl provided", async () => {
    await generateCommitlint(TEST_DIR, "https://app.asana.com/0/workspace");

    const content = readFileSync(join(TEST_DIR, "commitlint.config.js"), "utf-8");
    expect(content).toContain("asana-task-link");
    expect(content).toContain("plugins:");
  });

  it("should not include Asana validation when no baseUrl", async () => {
    await generateCommitlint(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, "commitlint.config.js"), "utf-8");
    expect(content).not.toContain("asana-task-link");
    expect(content).not.toContain("plugins:");
  });

  it("should have subject-empty rule", async () => {
    await generateCommitlint(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, "commitlint.config.js"), "utf-8");
    expect(content).toContain("'subject-empty': [2, 'never']");
  });

  it("should have type-empty rule", async () => {
    await generateCommitlint(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, "commitlint.config.js"), "utf-8");
    expect(content).toContain("'type-empty': [2, 'never']");
  });

  it("should backup existing config", async () => {
    writeFileSync(join(TEST_DIR, "commitlint.config.js"), "// old config");

    const result = await generateCommitlint(TEST_DIR);

    expect(result.backedUp.length).toBeGreaterThan(0);
    expect(result.backedUp[0]).toContain(".backup");
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generateCommitlint(TEST_DIR);

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
    expect(Array.isArray(result.created)).toBe(true);
  });
});
