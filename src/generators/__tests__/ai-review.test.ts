import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateAIReview } from "../ai-review.js";

let TEST_DIR: string;

describe("generateAIReview", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should do nothing when tool is none", async () => {
    const result = await generateAIReview(TEST_DIR, "none");

    expect(result.created).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
  });

  it("should create .coderabbit.yaml for coderabbit", async () => {
    const result = await generateAIReview(TEST_DIR, "coderabbit");

    expect(result.created).toContain(".coderabbit.yaml");
    expect(existsSync(join(TEST_DIR, ".coderabbit.yaml"))).toBe(true);
  });

  it("should have correct coderabbit config", async () => {
    await generateAIReview(TEST_DIR, "coderabbit");

    const content = readFileSync(join(TEST_DIR, ".coderabbit.yaml"), "utf-8");
    expect(content).toContain("language:");
    expect(content).toContain("reviews:");
    expect(content).toContain("auto_review:");
  });

  it("should create copilot workflow for copilot", async () => {
    const result = await generateAIReview(TEST_DIR, "copilot");

    expect(result.created).toContain(".github/workflows/copilot-review.yml");
    expect(existsSync(join(TEST_DIR, ".github", "workflows", "copilot-review.yml"))).toBe(true);
  });

  it("should have correct copilot workflow config", async () => {
    await generateAIReview(TEST_DIR, "copilot");

    const content = readFileSync(join(TEST_DIR, ".github", "workflows", "copilot-review.yml"), "utf-8");
    expect(content).toContain("name: Copilot Code Review");
    expect(content).toContain("pull_request:");
    expect(content).toContain("permissions:");
  });

  it("should create .github/workflows directory for copilot", async () => {
    await generateAIReview(TEST_DIR, "copilot");

    expect(existsSync(join(TEST_DIR, ".github", "workflows"))).toBe(true);
  });

  it("should backup existing coderabbit config", async () => {
    writeFileSync(join(TEST_DIR, ".coderabbit.yaml"), "# old");

    const result = await generateAIReview(TEST_DIR, "coderabbit");

    expect(result.backedUp.length).toBeGreaterThan(0);
  });

  it("should backup existing copilot workflow", async () => {
    mkdirSync(join(TEST_DIR, ".github", "workflows"), { recursive: true });
    writeFileSync(join(TEST_DIR, ".github", "workflows", "copilot-review.yml"), "# old");

    const result = await generateAIReview(TEST_DIR, "copilot");

    expect(result.backedUp.length).toBeGreaterThan(0);
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generateAIReview(TEST_DIR, "none");

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });
});
