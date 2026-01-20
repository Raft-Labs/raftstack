import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateCodeowners } from "../codeowners.js";

let TEST_DIR: string;

describe("generateCodeowners", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should create .github/CODEOWNERS", async () => {
    const result = await generateCodeowners(TEST_DIR, ["@owner1"]);

    expect(result.created).toContain(".github/CODEOWNERS");
    expect(existsSync(join(TEST_DIR, ".github", "CODEOWNERS"))).toBe(true);
  });

  it("should create .github directory if not exists", async () => {
    await generateCodeowners(TEST_DIR, []);

    expect(existsSync(join(TEST_DIR, ".github"))).toBe(true);
  });

  it("should include owners in file", async () => {
    await generateCodeowners(TEST_DIR, ["@owner1", "@owner2"]);

    const content = readFileSync(join(TEST_DIR, ".github", "CODEOWNERS"), "utf-8");
    expect(content).toContain("@owner1");
    expect(content).toContain("@owner2");
  });

  it("should have default rule for all files", async () => {
    await generateCodeowners(TEST_DIR, ["@owner1"]);

    const content = readFileSync(join(TEST_DIR, ".github", "CODEOWNERS"), "utf-8");
    expect(content).toContain("* @owner1");
  });

  it("should handle empty owners list", async () => {
    await generateCodeowners(TEST_DIR, []);

    const content = readFileSync(join(TEST_DIR, ".github", "CODEOWNERS"), "utf-8");
    expect(content).toContain("CODEOWNERS");
    expect(content).toContain("# * @owner1 @owner2");
  });

  it("should include documentation link", async () => {
    await generateCodeowners(TEST_DIR, []);

    const content = readFileSync(join(TEST_DIR, ".github", "CODEOWNERS"), "utf-8");
    expect(content).toContain("docs.github.com");
    expect(content).toContain("about-code-owners");
  });

  it("should include example path rules", async () => {
    await generateCodeowners(TEST_DIR, ["@owner1"]);

    const content = readFileSync(join(TEST_DIR, ".github", "CODEOWNERS"), "utf-8");
    expect(content).toContain("/docs/");
    expect(content).toContain("/src/api/");
  });

  it("should backup existing CODEOWNERS", async () => {
    mkdirSync(join(TEST_DIR, ".github"), { recursive: true });
    writeFileSync(join(TEST_DIR, ".github", "CODEOWNERS"), "# old");

    const result = await generateCodeowners(TEST_DIR, ["@owner1"]);

    expect(result.backedUp.length).toBeGreaterThan(0);
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generateCodeowners(TEST_DIR, []);

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });
});
