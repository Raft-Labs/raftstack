import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generatePrettier } from "../prettier.js";

let TEST_DIR: string;

describe("generatePrettier", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should create .prettierrc", async () => {
    const result = await generatePrettier(TEST_DIR);

    expect(result.created).toContain(".prettierrc");
    expect(existsSync(join(TEST_DIR, ".prettierrc"))).toBe(true);
  });

  it("should create .prettierignore", async () => {
    const result = await generatePrettier(TEST_DIR);

    expect(result.created).toContain(".prettierignore");
    expect(existsSync(join(TEST_DIR, ".prettierignore"))).toBe(true);
  });

  it("should have correct Prettier config options", async () => {
    await generatePrettier(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, ".prettierrc"), "utf-8");
    const config = JSON.parse(content);

    expect(config.semi).toBe(true);
    expect(config.singleQuote).toBe(true);
    expect(config.tabWidth).toBe(2);
    expect(config.trailingComma).toBe("es5");
    expect(config.printWidth).toBe(100);
  });

  it("should skip if .prettierrc already exists", async () => {
    writeFileSync(join(TEST_DIR, ".prettierrc"), "{}");

    const result = await generatePrettier(TEST_DIR);

    expect(result.skipped).toContain(".prettierrc (already exists)");
    expect(result.created).not.toContain(".prettierrc");
  });

  it("should skip if prettier.config.js already exists", async () => {
    writeFileSync(join(TEST_DIR, "prettier.config.js"), "module.exports = {}");

    const result = await generatePrettier(TEST_DIR);

    expect(result.skipped).toContain(".prettierrc (already exists)");
  });

  it("should skip if .prettierrc.json already exists", async () => {
    writeFileSync(join(TEST_DIR, ".prettierrc.json"), "{}");

    const result = await generatePrettier(TEST_DIR);

    expect(result.skipped).toContain(".prettierrc (already exists)");
  });

  it("should include common ignore patterns", async () => {
    await generatePrettier(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, ".prettierignore"), "utf-8");
    expect(content).toContain("node_modules/");
    expect(content).toContain("dist/");
    expect(content).toContain("coverage/");
    expect(content).toContain("pnpm-lock.yaml");
  });

  it("should not overwrite existing .prettierignore", async () => {
    writeFileSync(join(TEST_DIR, ".prettierignore"), "# custom ignore");

    const result = await generatePrettier(TEST_DIR);

    expect(result.skipped).toContain(".prettierignore (already exists)");
    const content = readFileSync(join(TEST_DIR, ".prettierignore"), "utf-8");
    expect(content).toBe("# custom ignore");
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generatePrettier(TEST_DIR);

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });
});
