import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  readFileSync,
  writeFileSync,
  mkdtempSync,
  rmSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateEslint, detectReact, detectNextJs } from "../eslint.js";

let TEST_DIR: string;

describe("generateEslint", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
    // Create minimal package.json
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({ name: "test-project", version: "1.0.0" }, null, 2)
    );
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it("should create eslint.config.mjs", async () => {
    const result = await generateEslint(TEST_DIR, true);

    expect(result.created).toContain("eslint.config.mjs");
    expect(existsSync(join(TEST_DIR, "eslint.config.mjs"))).toBe(true);
  });

  it("should skip if ESLint is already configured", async () => {
    writeFileSync(join(TEST_DIR, ".eslintrc.js"), "module.exports = {};");

    const result = await generateEslint(TEST_DIR, true);

    expect(result.skipped).toContain(
      "eslint.config.mjs (ESLint already configured)"
    );
    expect(result.created).not.toContain("eslint.config.mjs");
  });

  it("should force generate even if ESLint is configured", async () => {
    writeFileSync(join(TEST_DIR, ".eslintrc.js"), "module.exports = {};");

    const result = await generateEslint(TEST_DIR, true, true);

    expect(result.created).toContain("eslint.config.mjs");
    expect(existsSync(join(TEST_DIR, "eslint.config.mjs"))).toBe(true);
  });

  it("should generate TypeScript config when usesTypeScript is true", async () => {
    await generateEslint(TEST_DIR, true);

    const content = readFileSync(join(TEST_DIR, "eslint.config.mjs"), "utf-8");
    expect(content).toContain("typescript-eslint");
    expect(content).toContain("@typescript-eslint/no-unused-vars");
    expect(content).toContain("@typescript-eslint/no-explicit-any");
  });

  it("should generate JavaScript config when usesTypeScript is false", async () => {
    await generateEslint(TEST_DIR, false);

    const content = readFileSync(join(TEST_DIR, "eslint.config.mjs"), "utf-8");
    expect(content).not.toContain("typescript-eslint");
    expect(content).toContain("@eslint/js");
    expect(content).toContain("no-unused-vars");
  });

  it("should include React plugins when project uses React", async () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({
        name: "test-project",
        dependencies: { react: "^18.0.0" },
      })
    );

    await generateEslint(TEST_DIR, true);

    const content = readFileSync(join(TEST_DIR, "eslint.config.mjs"), "utf-8");
    expect(content).toContain("eslint-plugin-react");
    expect(content).toContain("eslint-plugin-react-hooks");
    expect(content).toContain("react/react-in-jsx-scope");
    expect(content).toContain("react-hooks/rules-of-hooks");
  });

  it("should not include React plugins when project does not use React", async () => {
    await generateEslint(TEST_DIR, true);

    const content = readFileSync(join(TEST_DIR, "eslint.config.mjs"), "utf-8");
    expect(content).not.toContain("eslint-plugin-react");
    expect(content).not.toContain("eslint-plugin-react-hooks");
  });

  it("should include common ignores", async () => {
    await generateEslint(TEST_DIR, true);

    const content = readFileSync(join(TEST_DIR, "eslint.config.mjs"), "utf-8");
    expect(content).toContain("node_modules");
    expect(content).toContain("dist");
    expect(content).toContain("coverage");
  });

  it("should include strict TypeScript rules", async () => {
    await generateEslint(TEST_DIR, true);

    const content = readFileSync(join(TEST_DIR, "eslint.config.mjs"), "utf-8");
    // Should use strict config
    expect(content).toContain("tseslint.configs.strict");
  });

  it("should include eslint-config-prettier", async () => {
    await generateEslint(TEST_DIR, true);

    const content = readFileSync(join(TEST_DIR, "eslint.config.mjs"), "utf-8");
    expect(content).toContain("eslint-config-prettier");
  });

  it("should include consistent-type-imports rule", async () => {
    await generateEslint(TEST_DIR, true);

    const content = readFileSync(join(TEST_DIR, "eslint.config.mjs"), "utf-8");
    expect(content).toContain("@typescript-eslint/consistent-type-imports");
  });

  it("should backup existing eslint.config.mjs", async () => {
    writeFileSync(join(TEST_DIR, "eslint.config.mjs"), "// old config");

    const result = await generateEslint(TEST_DIR, true, true);

    expect(result.backedUp.length).toBeGreaterThan(0);
    expect(existsSync(join(TEST_DIR, "eslint.config.mjs.backup"))).toBe(true);
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generateEslint(TEST_DIR, true);

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });

  it("should generate Next.js config when project uses Next.js", async () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({
        name: "test-project",
        dependencies: { next: "^14.0.0", react: "^18.0.0" },
      })
    );

    await generateEslint(TEST_DIR, true);

    const content = readFileSync(join(TEST_DIR, "eslint.config.mjs"), "utf-8");
    expect(content).toContain("eslint-config-next");
    expect(content).toContain("globalIgnores");
    expect(content).toContain(".next/**");
  });
});

describe("detectReact", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it("should return true when react is in dependencies", async () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({
        name: "test",
        dependencies: { react: "^18.0.0" },
      })
    );

    const result = await detectReact(TEST_DIR);
    expect(result).toBe(true);
  });

  it("should return true when react-dom is in dependencies", async () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({
        name: "test",
        dependencies: { "react-dom": "^18.0.0" },
      })
    );

    const result = await detectReact(TEST_DIR);
    expect(result).toBe(true);
  });

  it("should return true when react is in devDependencies", async () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({
        name: "test",
        devDependencies: { react: "^18.0.0" },
      })
    );

    const result = await detectReact(TEST_DIR);
    expect(result).toBe(true);
  });

  it("should return false when react is not present", async () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({
        name: "test",
        dependencies: { express: "^4.0.0" },
      })
    );

    const result = await detectReact(TEST_DIR);
    expect(result).toBe(false);
  });

  it("should return false when package.json does not exist", async () => {
    const result = await detectReact(TEST_DIR);
    expect(result).toBe(false);
  });
});

describe("detectNextJs", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it("should return true when next is in dependencies", async () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({
        name: "test",
        dependencies: { next: "^14.0.0" },
      })
    );

    const result = await detectNextJs(TEST_DIR);
    expect(result).toBe(true);
  });

  it("should return true when next is in devDependencies", async () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({
        name: "test",
        devDependencies: { next: "^14.0.0" },
      })
    );

    const result = await detectNextJs(TEST_DIR);
    expect(result).toBe(true);
  });

  it("should return false when next is not present", async () => {
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify({
        name: "test",
        dependencies: { react: "^18.0.0" },
      })
    );

    const result = await detectNextJs(TEST_DIR);
    expect(result).toBe(false);
  });

  it("should return false when package.json does not exist", async () => {
    const result = await detectNextJs(TEST_DIR);
    expect(result).toBe(false);
  });
});
