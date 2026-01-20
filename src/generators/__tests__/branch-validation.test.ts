import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateBranchValidation } from "../branch-validation.js";

let TEST_DIR: string;

describe("generateBranchValidation", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should add validate-branch-name to package.json", async () => {
    writeFileSync(join(TEST_DIR, "package.json"), JSON.stringify({ name: "test" }, null, 2));

    const result = await generateBranchValidation(TEST_DIR);

    expect(result.modified).toContain("package.json (validate-branch-name)");
  });

  it("should add pattern to validate-branch-name config", async () => {
    writeFileSync(join(TEST_DIR, "package.json"), JSON.stringify({ name: "test" }, null, 2));

    await generateBranchValidation(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, "package.json"), "utf-8");
    const pkg = JSON.parse(content);
    expect(pkg["validate-branch-name"]).toHaveProperty("pattern");
    expect(pkg["validate-branch-name"].pattern).toContain("feature");
    expect(pkg["validate-branch-name"].pattern).toContain("fix");
    expect(pkg["validate-branch-name"].pattern).toContain("hotfix");
  });

  it("should add errorMsg to validate-branch-name config", async () => {
    writeFileSync(join(TEST_DIR, "package.json"), JSON.stringify({ name: "test" }, null, 2));

    await generateBranchValidation(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, "package.json"), "utf-8");
    const pkg = JSON.parse(content);
    expect(pkg["validate-branch-name"]).toHaveProperty("errorMsg");
  });

  it("should skip if validate-branch-name already exists", async () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({
        name: "test",
        "validate-branch-name": { pattern: "custom" },
      }, null, 2)
    );

    const result = await generateBranchValidation(TEST_DIR);

    expect(result.skipped).toContain("validate-branch-name config (already exists)");
  });

  it("should skip if package.json does not exist", async () => {
    const result = await generateBranchValidation(TEST_DIR);

    expect(result.skipped).toContain("validate-branch-name config (no package.json)");
  });

  it("should return correct GeneratorResult shape", async () => {
    writeFileSync(join(TEST_DIR, "package.json"), JSON.stringify({ name: "test" }, null, 2));

    const result = await generateBranchValidation(TEST_DIR);

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });

  it("should support main/master/develop branch names in pattern", async () => {
    writeFileSync(join(TEST_DIR, "package.json"), JSON.stringify({ name: "test" }, null, 2));

    await generateBranchValidation(TEST_DIR);

    const content = readFileSync(join(TEST_DIR, "package.json"), "utf-8");
    const pkg = JSON.parse(content);
    expect(pkg["validate-branch-name"].pattern).toContain("main");
    expect(pkg["validate-branch-name"].pattern).toContain("develop");
    expect(pkg["validate-branch-name"].pattern).toContain("staging");
  });
});
