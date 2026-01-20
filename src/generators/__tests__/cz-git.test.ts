import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateCzGit } from "../cz-git.js";

let TEST_DIR: string;

describe("generateCzGit", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should create .czrc", async () => {
    const result = await generateCzGit(TEST_DIR);

    expect(result.created).toContain(".czrc");
    expect(existsSync(join(TEST_DIR, ".czrc"))).toBe(true);
  });

  it("should create cz.config.js", async () => {
    const result = await generateCzGit(TEST_DIR);

    expect(result.created).toContain("cz.config.js");
    expect(existsSync(join(TEST_DIR, "cz.config.js"))).toBe(true);
  });

  it("should reference cz-git in .czrc", async () => {
    await generateCzGit(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, ".czrc"), "utf-8");
    const config = JSON.parse(content);
    expect(config.path).toContain("cz-git");
  });

  it("should include all commit types with emojis", async () => {
    await generateCzGit(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, "cz.config.js"), "utf-8");
    expect(content).toContain("feat");
    expect(content).toContain("fix");
    expect(content).toContain("docs");
    expect(content).toContain("style");
    expect(content).toContain("refactor");
    expect(content).toContain("perf");
    expect(content).toContain("test");
    expect(content).toContain("build");
    expect(content).toContain("ci");
    expect(content).toContain("chore");
    expect(content).toContain("revert");
    expect(content).toContain("emoji");
  });

  it("should enable emojis", async () => {
    await generateCzGit(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, "cz.config.js"), "utf-8");
    expect(content).toContain("useEmoji: true");
  });

  it("should include Asana prefixes when baseUrl provided", async () => {
    await generateCzGit(TEST_DIR, "https://app.asana.com/0/workspace");

    const content = readFileSync(join(TEST_DIR, "cz.config.js"), "utf-8");
    expect(content).toContain("asana:");
    expect(content).toContain("issuePrefixes");
  });

  it("should not include Asana prefixes when no baseUrl", async () => {
    await generateCzGit(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, "cz.config.js"), "utf-8");
    expect(content).not.toContain("issuePrefixes");
  });

  it("should backup existing .czrc", async () => {
    writeFileSync(join(TEST_DIR, ".czrc"), "{}");

    const result = await generateCzGit(TEST_DIR);

    expect(result.backedUp.length).toBeGreaterThan(0);
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generateCzGit(TEST_DIR);

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });
});
