import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateContributing } from "../contributing.js";

let TEST_DIR: string;

describe("generateContributing", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should create CONTRIBUTING.md", async () => {
    const result = await generateContributing(TEST_DIR, false);

    expect(result.created).toContain("CONTRIBUTING.md");
    expect(existsSync(join(TEST_DIR, "CONTRIBUTING.md"))).toBe(true);
  });

  it("should include branch naming convention", async () => {
    await generateContributing(TEST_DIR, false);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).toContain("## Branch Naming Convention");
    expect(content).toContain("feature/");
    expect(content).toContain("fix/");
    expect(content).toContain("hotfix/");
  });

  it("should include commit convention", async () => {
    await generateContributing(TEST_DIR, false);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).toContain("## Commit Convention");
    expect(content).toContain("pnpm commit");
  });

  it("should include commit types table", async () => {
    await generateContributing(TEST_DIR, false);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).toContain("feat");
    expect(content).toContain("fix");
    expect(content).toContain("docs");
    expect(content).toContain("refactor");
  });

  it("should include Asana section when hasAsana is true", async () => {
    await generateContributing(TEST_DIR, true);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).toContain("## Linking to Asana");
    expect(content).toContain("https://app.asana.com");
  });

  it("should not include Asana section when hasAsana is false", async () => {
    await generateContributing(TEST_DIR, false);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).not.toContain("## Linking to Asana");
  });

  it("should include PR process", async () => {
    await generateContributing(TEST_DIR, false);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).toContain("## Pull Request Process");
  });

  it("should include code quality section", async () => {
    await generateContributing(TEST_DIR, false);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).toContain("## Code Quality");
    expect(content).toContain("ESLint");
    expect(content).toContain("Prettier");
  });

  it("should backup existing CONTRIBUTING.md", async () => {
    writeFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "# Old");

    const result = await generateContributing(TEST_DIR, false);

    expect(result.backedUp.length).toBeGreaterThan(0);
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generateContributing(TEST_DIR, false);

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });
});
