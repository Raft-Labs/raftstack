import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateBranchProtectionDocs } from "../branch-protection.js";

let TEST_DIR: string;

describe("generateBranchProtectionDocs", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should create .github/BRANCH_PROTECTION_SETUP.md", async () => {
    const result = await generateBranchProtectionDocs(TEST_DIR);

    expect(result.created).toContain(".github/BRANCH_PROTECTION_SETUP.md");
    expect(existsSync(join(TEST_DIR, ".github", "BRANCH_PROTECTION_SETUP.md"))).toBe(true);
  });

  it("should create .github directory if not exists", async () => {
    await generateBranchProtectionDocs(TEST_DIR);

    expect(existsSync(join(TEST_DIR, ".github"))).toBe(true);
  });

  it("should include recommended settings", async () => {
    await generateBranchProtectionDocs(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, ".github", "BRANCH_PROTECTION_SETUP.md"), "utf-8");
    expect(content).toContain("## Recommended Settings");
    expect(content).toContain("Require a pull request before merging");
    expect(content).toContain("Require approvals");
  });

  it("should include manual setup instructions", async () => {
    await generateBranchProtectionDocs(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, ".github", "BRANCH_PROTECTION_SETUP.md"), "utf-8");
    expect(content).toContain("## Manual Setup via GitHub UI");
    expect(content).toContain("Settings");
    expect(content).toContain("Branches");
  });

  it("should include automated setup instructions", async () => {
    await generateBranchProtectionDocs(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, ".github", "BRANCH_PROTECTION_SETUP.md"), "utf-8");
    expect(content).toContain("## Automated Setup");
    expect(content).toContain("raftstack setup-protection");
  });

  it("should include branch naming convention", async () => {
    await generateBranchProtectionDocs(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, ".github", "BRANCH_PROTECTION_SETUP.md"), "utf-8");
    expect(content).toContain("## Branch Naming Convention");
    expect(content).toContain("feature/*");
    expect(content).toContain("fix/*");
    expect(content).toContain("hotfix/*");
  });

  it("should backup existing docs", async () => {
    mkdirSync(join(TEST_DIR, ".github"), { recursive: true });
    writeFileSync(join(TEST_DIR, ".github", "BRANCH_PROTECTION_SETUP.md"), "# Old");

    const result = await generateBranchProtectionDocs(TEST_DIR);

    expect(result.backedUp.length).toBeGreaterThan(0);
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generateBranchProtectionDocs(TEST_DIR);

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });
});
