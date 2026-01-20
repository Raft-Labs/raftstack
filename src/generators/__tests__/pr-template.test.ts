import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generatePRTemplate } from "../pr-template.js";

let TEST_DIR: string;

describe("generatePRTemplate", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should create .github/PULL_REQUEST_TEMPLATE.md", async () => {
    const result = await generatePRTemplate(TEST_DIR, false);

    expect(result.created).toContain(".github/PULL_REQUEST_TEMPLATE.md");
    expect(existsSync(join(TEST_DIR, ".github", "PULL_REQUEST_TEMPLATE.md"))).toBe(true);
  });

  it("should create .github directory if not exists", async () => {
    await generatePRTemplate(TEST_DIR, false);

    expect(existsSync(join(TEST_DIR, ".github"))).toBe(true);
  });

  it("should include Description section", async () => {
    await generatePRTemplate(TEST_DIR, false);

    const content = readFileSync(join(TEST_DIR, ".github", "PULL_REQUEST_TEMPLATE.md"), "utf-8");
    expect(content).toContain("## Description");
  });

  it("should include Type of Change section", async () => {
    await generatePRTemplate(TEST_DIR, false);

    const content = readFileSync(join(TEST_DIR, ".github", "PULL_REQUEST_TEMPLATE.md"), "utf-8");
    expect(content).toContain("## Type of Change");
    expect(content).toContain("Bug fix");
    expect(content).toContain("New feature");
  });

  it("should include Testing section", async () => {
    await generatePRTemplate(TEST_DIR, false);

    const content = readFileSync(join(TEST_DIR, ".github", "PULL_REQUEST_TEMPLATE.md"), "utf-8");
    expect(content).toContain("## Testing");
  });

  it("should include Checklist section", async () => {
    await generatePRTemplate(TEST_DIR, false);

    const content = readFileSync(join(TEST_DIR, ".github", "PULL_REQUEST_TEMPLATE.md"), "utf-8");
    expect(content).toContain("## Checklist");
  });

  it("should include Asana section when hasAsana is true", async () => {
    await generatePRTemplate(TEST_DIR, true);

    const content = readFileSync(join(TEST_DIR, ".github", "PULL_REQUEST_TEMPLATE.md"), "utf-8");
    expect(content).toContain("## Asana Task");
    expect(content).toContain("https://app.asana.com");
  });

  it("should not include Asana section when hasAsana is false", async () => {
    await generatePRTemplate(TEST_DIR, false);

    const content = readFileSync(join(TEST_DIR, ".github", "PULL_REQUEST_TEMPLATE.md"), "utf-8");
    expect(content).not.toContain("## Asana Task");
  });

  it("should backup existing template", async () => {
    mkdirSync(join(TEST_DIR, ".github"), { recursive: true });
    writeFileSync(join(TEST_DIR, ".github", "PULL_REQUEST_TEMPLATE.md"), "# Old template");

    const result = await generatePRTemplate(TEST_DIR, false);

    expect(result.backedUp.length).toBeGreaterThan(0);
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generatePRTemplate(TEST_DIR, false);

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });
});
