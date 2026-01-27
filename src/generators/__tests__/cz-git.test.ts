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

  it("should only create .czrc (not cz.config.js)", async () => {
    const result = await generateCzGit(TEST_DIR);

    // cz-git now reads prompt config from commitlint.config.js
    // so we only need .czrc pointing to cz-git
    expect(result.created).toContain(".czrc");
    expect(result.created).not.toContain("cz.config.js");
    expect(existsSync(join(TEST_DIR, "cz.config.js"))).toBe(false);
  });

  it("should reference cz-git in .czrc", async () => {
    await generateCzGit(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, ".czrc"), "utf-8");
    const config = JSON.parse(content);
    expect(config.path).toContain("cz-git");
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
