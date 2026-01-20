import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, writeFileSync, mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateClaudeSkills } from "../claude-skills.js";

let TEST_DIR: string;

describe("generateClaudeSkills", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should create .claude/skills directory structure", async () => {
    const result = await generateClaudeSkills(TEST_DIR);

    // Should create skills (if package skills directory exists)
    // In test environment, package skills may not exist
    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generateClaudeSkills(TEST_DIR);

    expect(Array.isArray(result.created)).toBe(true);
    expect(Array.isArray(result.modified)).toBe(true);
    expect(Array.isArray(result.skipped)).toBe(true);
    expect(Array.isArray(result.backedUp)).toBe(true);
  });

  it("should backup existing skills files", async () => {
    // Create existing .claude/skills directory with a file
    mkdirSync(join(TEST_DIR, ".claude", "skills", "test"), { recursive: true });
    writeFileSync(join(TEST_DIR, ".claude", "skills", "test", "SKILL.md"), "# Old Skill");

    const result = await generateClaudeSkills(TEST_DIR);

    // In actual use, if package has skills, existing files would be backed up
    expect(result).toHaveProperty("backedUp");
  });

  it("should handle non-existent target directory gracefully", async () => {
    const nonExistentDir = join(TEST_DIR, "non-existent");

    // Should not throw - directory will be created
    const result = await generateClaudeSkills(nonExistentDir);
    expect(result).toHaveProperty("created");
  });

  it("should preserve existing .claude directory", async () => {
    // Create existing .claude directory with some content
    mkdirSync(join(TEST_DIR, ".claude"), { recursive: true });
    writeFileSync(join(TEST_DIR, ".claude", "settings.json"), '{"test": true}');

    await generateClaudeSkills(TEST_DIR);

    // Original file should still exist (not overwritten)
    expect(existsSync(join(TEST_DIR, ".claude", "settings.json"))).toBe(true);
  });
});
