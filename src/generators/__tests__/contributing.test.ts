import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { generateContributing } from "../contributing.js";
import { getPackageManagerInfo } from "../../utils/detect-package-manager.js";

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
    const pm = getPackageManagerInfo("npm");
    const result = await generateContributing(TEST_DIR, false, pm);

    expect(result.created).toContain("CONTRIBUTING.md");
    expect(existsSync(join(TEST_DIR, "CONTRIBUTING.md"))).toBe(true);
  });

  it("should include branch naming convention", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateContributing(TEST_DIR, false, pm);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).toContain("## Branch Naming Convention");
    expect(content).toContain("feature/");
    expect(content).toContain("fix/");
    expect(content).toContain("hotfix/");
  });

  it("should include npm install command when using npm", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateContributing(TEST_DIR, false, pm);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).toContain("npm install");
    expect(content).toContain("npm run commit");
  });

  it("should include pnpm commands when using pnpm", async () => {
    const pm = getPackageManagerInfo("pnpm");
    await generateContributing(TEST_DIR, false, pm);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).toContain("pnpm install");
    expect(content).toContain("pnpm commit");
  });

  it("should include yarn commands when using yarn", async () => {
    const pm = getPackageManagerInfo("yarn");
    await generateContributing(TEST_DIR, false, pm);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).toContain("yarn install");
    expect(content).toContain("yarn commit");
  });

  it("should include commit types table", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateContributing(TEST_DIR, false, pm);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).toContain("feat");
    expect(content).toContain("fix");
    expect(content).toContain("docs");
    expect(content).toContain("refactor");
  });

  it("should include Asana section when hasAsana is true", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateContributing(TEST_DIR, true, pm);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).toContain("## Linking to Asana");
    expect(content).toContain("https://app.asana.com");
  });

  it("should not include Asana section when hasAsana is false", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateContributing(TEST_DIR, false, pm);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).not.toContain("## Linking to Asana");
  });

  it("should include PR process", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateContributing(TEST_DIR, false, pm);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).toContain("## Pull Request Process");
  });

  it("should include code quality section", async () => {
    const pm = getPackageManagerInfo("npm");
    await generateContributing(TEST_DIR, false, pm);

    const content = readFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "utf-8");
    expect(content).toContain("## Code Quality");
    expect(content).toContain("ESLint");
    expect(content).toContain("Prettier");
  });

  it("should backup existing CONTRIBUTING.md", async () => {
    const pm = getPackageManagerInfo("npm");
    writeFileSync(join(TEST_DIR, "CONTRIBUTING.md"), "# Old");

    const result = await generateContributing(TEST_DIR, false, pm);

    expect(result.backedUp.length).toBeGreaterThan(0);
  });

  it("should return correct GeneratorResult shape", async () => {
    const pm = getPackageManagerInfo("npm");
    const result = await generateContributing(TEST_DIR, false, pm);

    expect(result).toHaveProperty("created");
    expect(result).toHaveProperty("modified");
    expect(result).toHaveProperty("skipped");
    expect(result).toHaveProperty("backedUp");
  });
});
