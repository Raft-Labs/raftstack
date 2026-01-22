import { describe, it, expect } from "vitest";
import { getLintStagedConfig, generateLintStaged } from "../lint-staged.js";

describe("getLintStagedConfig", () => {
  it("should return config object for package.json", () => {
    const config = getLintStagedConfig(true, true, true);

    expect(typeof config).toBe("object");
    expect(config).not.toBeNull();
  });

  it("should include TypeScript patterns when usesTypeScript is true", () => {
    const config = getLintStagedConfig(true, true, true);

    // Should have a pattern that includes ts, tsx
    const patterns = Object.keys(config);
    const hasTypeScriptPattern = patterns.some(
      (p) => p.includes("ts") && p.includes("tsx")
    );
    expect(hasTypeScriptPattern).toBe(true);
  });

  it("should include JavaScript patterns when usesTypeScript is false", () => {
    const config = getLintStagedConfig(true, true, false);

    const patterns = Object.keys(config);
    const hasJsPattern = patterns.some((p) => p.includes("js"));
    expect(hasJsPattern).toBe(true);
  });

  it("should include ESLint command when usesEslint is true", () => {
    const config = getLintStagedConfig(true, false, true);

    const commands = Object.values(config).flat();
    expect(commands).toContain("eslint --fix");
  });

  it("should not include ESLint command when usesEslint is false", () => {
    const config = getLintStagedConfig(false, true, true);

    const commands = Object.values(config).flat();
    expect(commands).not.toContain("eslint --fix");
  });

  it("should include Prettier command when usesPrettier is true", () => {
    const config = getLintStagedConfig(false, true, true);

    const commands = Object.values(config).flat();
    expect(commands).toContain("prettier --write");
  });

  it("should not include Prettier command for code files when usesPrettier is false", () => {
    const config = getLintStagedConfig(true, false, true);

    // Get commands for TypeScript files
    const tsPattern = Object.keys(config).find((p) => p.includes("ts"));
    if (tsPattern) {
      const commands = config[tsPattern];
      const commandArray = Array.isArray(commands) ? commands : [commands];
      expect(commandArray).not.toContain("prettier --write");
    }
  });

  it("should include JSON/CSS/MD pattern when usesPrettier is true", () => {
    const config = getLintStagedConfig(false, true, false);

    const patterns = Object.keys(config);
    const hasNonCodePattern = patterns.some(
      (p) => p.includes("json") && p.includes("css") && p.includes("md")
    );
    expect(hasNonCodePattern).toBe(true);
  });

  it("should not include JSON/CSS/MD pattern when usesPrettier is false", () => {
    const config = getLintStagedConfig(true, false, true);

    const patterns = Object.keys(config);
    const hasNonCodePattern = patterns.some(
      (p) => p.includes("json") && p.includes("css") && p.includes("md")
    );
    expect(hasNonCodePattern).toBe(false);
  });

  it("should return empty object when no tools are enabled", () => {
    const config = getLintStagedConfig(false, false, true);

    expect(Object.keys(config)).toHaveLength(0);
  });

  it("should match zero-to-one pattern format", () => {
    const config = getLintStagedConfig(true, true, true);

    // Expected pattern: "*.{ts,mts,cts,tsx,js,mjs,cjs,jsx}": ["eslint --fix", "prettier --write"]
    const codePattern = Object.keys(config).find((p) =>
      p.includes("ts") && p.includes("js")
    );
    expect(codePattern).toBeDefined();

    if (codePattern) {
      const commands = config[codePattern];
      expect(Array.isArray(commands)).toBe(true);
      expect(commands).toContain("eslint --fix");
      expect(commands).toContain("prettier --write");
    }
  });
});

describe("generateLintStaged (deprecated)", () => {
  it("should return config object in result", async () => {
    const result = await generateLintStaged(
      "/tmp",
      "single",
      true,
      true,
      true
    );

    expect(result).toHaveProperty("config");
    expect(typeof result.config).toBe("object");
  });

  it("should return empty created/modified arrays (no file creation)", async () => {
    const result = await generateLintStaged(
      "/tmp",
      "single",
      true,
      true,
      true
    );

    expect(result.created).toHaveLength(0);
    expect(result.modified).toHaveLength(0);
  });

  it("should return correct GeneratorResult shape", async () => {
    const result = await generateLintStaged(
      "/tmp",
      "single",
      true,
      true,
      true
    );

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });
});
