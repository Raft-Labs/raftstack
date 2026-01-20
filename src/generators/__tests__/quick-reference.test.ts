import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateQuickReference } from "../quick-reference.js";
import { getPackageManagerInfo } from "../../utils/detect-package-manager.js";

let TEST_DIR: string;

describe("generateQuickReference", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-quick-ref-test-"));
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("should create QUICK_REFERENCE.md in .github directory", async () => {
    const pm = getPackageManagerInfo("npm");
    const result = await generateQuickReference(TEST_DIR, pm);

    expect(result.created).toContain(".github/QUICK_REFERENCE.md");
    expect(existsSync(join(TEST_DIR, ".github", "QUICK_REFERENCE.md"))).toBe(
      true
    );
  });

  it("should include branch naming conventions", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateQuickReference(TEST_DIR, pm);

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
    const pm = getPackageManagerInfo("npm");
    await generateQuickReference(TEST_DIR, pm);

    const content = readFileSync(
      join(TEST_DIR, ".github", "QUICK_REFERENCE.md"),
      "utf-8"
    );

    expect(content).toContain("feat");
    expect(content).toContain("fix");
    expect(content).toContain("✨");
    expect(content).toContain("🐛");
  });

  it("should include npm commit command when using npm", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateQuickReference(TEST_DIR, pm);

    const content = readFileSync(
      join(TEST_DIR, ".github", "QUICK_REFERENCE.md"),
      "utf-8"
    );

    expect(content).toContain("npm run commit");
  });

  it("should include pnpm commands when using pnpm", async () => {
    const pm = getPackageManagerInfo("pnpm");
    await generateQuickReference(TEST_DIR, pm);

    const content = readFileSync(
      join(TEST_DIR, ".github", "QUICK_REFERENCE.md"),
      "utf-8"
    );

    expect(content).toContain("pnpm commit");
    expect(content).toContain("pnpm dlx @raftlabs/raftstack metrics");
  });

  it("should include yarn commands when using yarn", async () => {
    const pm = getPackageManagerInfo("yarn");
    await generateQuickReference(TEST_DIR, pm);

    const content = readFileSync(
      join(TEST_DIR, ".github", "QUICK_REFERENCE.md"),
      "utf-8"
    );

    expect(content).toContain("yarn commit");
    expect(content).toContain("yarn @raftlabs/raftstack metrics");
  });

  it("should include PR checklist", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateQuickReference(TEST_DIR, pm);

    const content = readFileSync(
      join(TEST_DIR, ".github", "QUICK_REFERENCE.md"),
      "utf-8"
    );

    expect(content).toContain("PR Checklist");
    expect(content).toContain("Branch name follows convention");
    expect(content).toContain("Tests pass locally");
  });

  it("should include common mistakes section", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateQuickReference(TEST_DIR, pm);

    const content = readFileSync(
      join(TEST_DIR, ".github", "QUICK_REFERENCE.md"),
      "utf-8"
    );

    expect(content).toContain("Common Mistakes");
    expect(content).toContain("Wrong");
    expect(content).toContain("Right");
  });

  it("should include metrics command reference", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateQuickReference(TEST_DIR, pm);

    const content = readFileSync(
      join(TEST_DIR, ".github", "QUICK_REFERENCE.md"),
      "utf-8"
    );

    expect(content).toContain("raftstack metrics");
  });

  it("should backup existing file when run twice", async () => {
    const pm = getPackageManagerInfo("npm");
    // First run
    await generateQuickReference(TEST_DIR, pm);
    expect(existsSync(join(TEST_DIR, ".github", "QUICK_REFERENCE.md"))).toBe(
      true
    );

    // Second run
    const result = await generateQuickReference(TEST_DIR, pm);

    expect(result.modified).toContain(".github/QUICK_REFERENCE.md");
    expect(result.backedUp).toContain(".github/QUICK_REFERENCE.md");
    expect(
      existsSync(join(TEST_DIR, ".github", "QUICK_REFERENCE.md.backup"))
    ).toBe(true);
  });
});
