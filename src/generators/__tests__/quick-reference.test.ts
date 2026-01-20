import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateQuickReference } from "../quick-reference.js";

let TEST_DIR: string;

describe("generateQuickReference", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-quick-ref-test-"));
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("should create QUICK_REFERENCE.md in .github directory", async () => {
    const result = await generateQuickReference(TEST_DIR);

    expect(result.created).toContain(".github/QUICK_REFERENCE.md");
    expect(existsSync(join(TEST_DIR, ".github", "QUICK_REFERENCE.md"))).toBe(
      true
    );
  });

  it("should include branch naming conventions", async () => {
    await generateQuickReference(TEST_DIR);

    const content = readFileSync(
      join(TEST_DIR, ".github", "QUICK_REFERENCE.md"),
      "utf-8"
    );

    expect(content).toContain("feature/");
    expect(content).toContain("bugfix/");
    expect(content).toContain("hotfix/");
    // Branch types listed (not as examples with slash)
    expect(content).toContain("`chore`");
    expect(content).toContain("`refactor`");
  });

  it("should include commit types with emojis", async () => {
    await generateQuickReference(TEST_DIR);

    const content = readFileSync(
      join(TEST_DIR, ".github", "QUICK_REFERENCE.md"),
      "utf-8"
    );

    expect(content).toContain("feat");
    expect(content).toContain("fix");
    expect(content).toContain("✨");
    expect(content).toContain("🐛");
  });

  it("should include pnpm commit command", async () => {
    await generateQuickReference(TEST_DIR);

    const content = readFileSync(
      join(TEST_DIR, ".github", "QUICK_REFERENCE.md"),
      "utf-8"
    );

    expect(content).toContain("pnpm commit");
  });

  it("should include PR checklist", async () => {
    await generateQuickReference(TEST_DIR);

    const content = readFileSync(
      join(TEST_DIR, ".github", "QUICK_REFERENCE.md"),
      "utf-8"
    );

    expect(content).toContain("PR Checklist");
    expect(content).toContain("Branch name follows convention");
    expect(content).toContain("Tests pass locally");
  });

  it("should include common mistakes section", async () => {
    await generateQuickReference(TEST_DIR);

    const content = readFileSync(
      join(TEST_DIR, ".github", "QUICK_REFERENCE.md"),
      "utf-8"
    );

    expect(content).toContain("Common Mistakes");
    expect(content).toContain("Wrong");
    expect(content).toContain("Right");
  });

  it("should include metrics command reference", async () => {
    await generateQuickReference(TEST_DIR);

    const content = readFileSync(
      join(TEST_DIR, ".github", "QUICK_REFERENCE.md"),
      "utf-8"
    );

    expect(content).toContain("raftstack metrics");
  });

  it("should backup existing file when run twice", async () => {
    // First run
    await generateQuickReference(TEST_DIR);
    expect(existsSync(join(TEST_DIR, ".github", "QUICK_REFERENCE.md"))).toBe(
      true
    );

    // Second run
    const result = await generateQuickReference(TEST_DIR);

    expect(result.modified).toContain(".github/QUICK_REFERENCE.md");
    expect(result.backedUp).toContain(".github/QUICK_REFERENCE.md");
    expect(
      existsSync(join(TEST_DIR, ".github", "QUICK_REFERENCE.md.backup"))
    ).toBe(true);
  });
});
