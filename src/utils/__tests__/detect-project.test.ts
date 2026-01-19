import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  detectProjectType,
  hasTypeScript,
  hasEslint,
  hasPrettier,
  getProjectTypeDescription,
} from "../detect-project.js";

let TEST_DIR: string;

describe("detectProjectType", () => {
  beforeEach(() => {
    // Create a unique test directory for each test
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    // Clean up test directory
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should detect NX monorepo", async () => {
    writeFileSync(join(TEST_DIR, "nx.json"), "{}");
    writeFileSync(join(TEST_DIR, "package.json"), "{}");

    const result = await detectProjectType(TEST_DIR);

    expect(result.type).toBe("nx");
    expect(result.confidence).toBe("high");
    expect(result.indicators).toContain("nx.json");
  });

  it("should detect Turborepo", async () => {
    writeFileSync(join(TEST_DIR, "turbo.json"), "{}");
    writeFileSync(join(TEST_DIR, "package.json"), "{}");

    const result = await detectProjectType(TEST_DIR);

    expect(result.type).toBe("turbo");
    expect(result.confidence).toBe("high");
    expect(result.indicators).toContain("turbo.json");
  });

  it("should detect pnpm workspace", async () => {
    writeFileSync(join(TEST_DIR, "pnpm-workspace.yaml"), "packages:\n  - packages/*");
    writeFileSync(join(TEST_DIR, "package.json"), "{}");

    const result = await detectProjectType(TEST_DIR);

    expect(result.type).toBe("pnpm-workspace");
    expect(result.confidence).toBe("high");
    expect(result.indicators).toContain("pnpm-workspace.yaml");
  });

  it("should detect single package project", async () => {
    writeFileSync(join(TEST_DIR, "package.json"), "{}");

    const result = await detectProjectType(TEST_DIR);

    expect(result.type).toBe("single");
    expect(result.confidence).toBe("low");
    expect(result.indicators).toHaveLength(0);
  });

  it("should prioritize NX over pnpm-workspace when both exist", async () => {
    writeFileSync(join(TEST_DIR, "nx.json"), "{}");
    writeFileSync(join(TEST_DIR, "pnpm-workspace.yaml"), "packages:\n  - packages/*");
    writeFileSync(join(TEST_DIR, "package.json"), "{}");

    const result = await detectProjectType(TEST_DIR);

    expect(result.type).toBe("nx");
    expect(result.confidence).toBe("high");
  });
});

describe("hasTypeScript", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should return true when tsconfig.json exists", async () => {
    writeFileSync(join(TEST_DIR, "tsconfig.json"), "{}");

    const result = await hasTypeScript(TEST_DIR);

    expect(result).toBe(true);
  });

  it("should return false when tsconfig.json does not exist", async () => {
    const result = await hasTypeScript(TEST_DIR);

    expect(result).toBe(false);
  });
});

describe("hasEslint", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should return true when .eslintrc exists", async () => {
    writeFileSync(join(TEST_DIR, ".eslintrc"), "{}");

    const result = await hasEslint(TEST_DIR);

    expect(result).toBe(true);
  });

  it("should return true when eslint.config.js exists", async () => {
    writeFileSync(join(TEST_DIR, "eslint.config.js"), "export default {}");

    const result = await hasEslint(TEST_DIR);

    expect(result).toBe(true);
  });

  it("should return true when package.json has eslintConfig", async () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({ eslintConfig: { rules: {} } }, null, 2)
    );

    const result = await hasEslint(TEST_DIR);

    expect(result).toBe(true);
  });

  it("should return false when no eslint config exists", async () => {
    const result = await hasEslint(TEST_DIR);

    expect(result).toBe(false);
  });
});

describe("hasPrettier", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should return true when .prettierrc exists", async () => {
    writeFileSync(join(TEST_DIR, ".prettierrc"), "{}");

    const result = await hasPrettier(TEST_DIR);

    expect(result).toBe(true);
  });

  it("should return true when prettier.config.js exists", async () => {
    writeFileSync(join(TEST_DIR, "prettier.config.js"), "export default {}");

    const result = await hasPrettier(TEST_DIR);

    expect(result).toBe(true);
  });

  it("should return true when package.json has prettier config", async () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({ prettier: {} })
    );

    const result = await hasPrettier(TEST_DIR);

    expect(result).toBe(true);
  });

  it("should return false when no prettier config exists", async () => {
    const result = await hasPrettier(TEST_DIR);

    expect(result).toBe(false);
  });
});

describe("getProjectTypeDescription", () => {
  it("should return correct descriptions", () => {
    expect(getProjectTypeDescription("nx")).toBe("NX Monorepo");
    expect(getProjectTypeDescription("turbo")).toBe("Turborepo");
    expect(getProjectTypeDescription("pnpm-workspace")).toBe("pnpm Workspace");
    expect(getProjectTypeDescription("single")).toBe("Single Package");
  });
});
