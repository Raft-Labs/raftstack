import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateClaudeConfig } from "../claude-config.js";

describe("generateClaudeConfig", () => {
  let TEST_DIR: string;

  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("should create .claude directory structure", async () => {
    const result = await generateClaudeConfig(TEST_DIR);

    expect(existsSync(join(TEST_DIR, ".claude"))).toBe(true);
    expect(result.created.length).toBeGreaterThan(0);
  });

  it("should create settings.json with correct content", async () => {
    await generateClaudeConfig(TEST_DIR);

    const settingsPath = join(TEST_DIR, ".claude", "settings.json");
    expect(existsSync(settingsPath)).toBe(true);

    const content = JSON.parse(readFileSync(settingsPath, "utf-8"));
    expect(content).toEqual({ model: "opusplan" });
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generateClaudeConfig(TEST_DIR);

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
    expect(Array.isArray(result.created)).toBe(true);
  });

  it("should include settings.json in created files", async () => {
    const result = await generateClaudeConfig(TEST_DIR);

    expect(result.created).toContain(".claude/settings.json");
  });

  it("should backup existing settings.json", async () => {
    // Create existing settings.json
    const claudeDir = join(TEST_DIR, ".claude");
    const settingsPath = join(claudeDir, "settings.json");
    rmSync(claudeDir, { recursive: true, force: true });

    // Run first time
    await generateClaudeConfig(TEST_DIR);

    // Run second time to trigger backup
    const result = await generateClaudeConfig(TEST_DIR);

    // backedUp array contains backup file paths (absolute paths)
    expect(result.backedUp.length).toBeGreaterThan(0);
    expect(result.backedUp[0]).toContain("settings.json.backup");
  });

  it("should preserve existing .claude directory", async () => {
    // Create .claude directory first
    const claudeDir = join(TEST_DIR, ".claude");
    rmSync(claudeDir, { recursive: true, force: true });
    await generateClaudeConfig(TEST_DIR);

    expect(existsSync(claudeDir)).toBe(true);

    // Run again
    await generateClaudeConfig(TEST_DIR);

    expect(existsSync(claudeDir)).toBe(true);
  });
});
