import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, rmSync, readFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  readPackageJson,
  writePackageJson,
  mergeScripts,
  addPackageJsonConfig,
  updatePackageJson,
  RAFTSTACK_PACKAGES,
  REACT_ESLINT_PACKAGES,
} from "../package-json.js";
import type { PackageJson } from "../../types/config.js";

let TEST_DIR: string;

describe("readPackageJson", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should read package.json successfully", async () => {
    const pkg = {
      name: "test-package",
      version: "1.0.0",
    };
    writeFileSync(join(TEST_DIR, "package.json"), JSON.stringify(pkg, null, 2));

    const result = await readPackageJson(TEST_DIR);

    expect(result.name).toBe("test-package");
    expect(result.version).toBe("1.0.0");
  });

  it("should throw error when package.json does not exist", async () => {
    await expect(readPackageJson(TEST_DIR)).rejects.toThrow();
  });
});

describe("writePackageJson", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should write package.json with proper formatting", async () => {
    const pkg: PackageJson = {
      name: "test-package",
      version: "1.0.0",
    };

    await writePackageJson(pkg, TEST_DIR);

    const content = readFileSync(join(TEST_DIR, "package.json"), "utf-8");
    expect(content).toContain('"name": "test-package"');
    expect(content).toContain('"version": "1.0.0"');
    expect(content).toMatch(/\n$/); // Should end with newline
  });
});

describe("mergeScripts", () => {
  it("should add new scripts without overwriting existing ones", () => {
    const pkg: PackageJson = {
      scripts: {
        test: "vitest",
        build: "tsc",
      },
    };

    const result = mergeScripts(pkg, {
      lint: "eslint .",
      format: "prettier --write .",
    });

    expect(result.scripts).toEqual({
      test: "vitest",
      build: "tsc",
      lint: "eslint .",
      format: "prettier --write .",
    });
  });

  it("should not overwrite existing scripts by default", () => {
    const pkg: PackageJson = {
      scripts: {
        test: "jest",
      },
    };

    const result = mergeScripts(pkg, {
      test: "vitest",
    });

    expect(result.scripts?.test).toBe("jest");
  });

  it("should overwrite existing scripts when overwrite is true", () => {
    const pkg: PackageJson = {
      scripts: {
        test: "jest",
      },
    };

    const result = mergeScripts(
      pkg,
      {
        test: "vitest",
      },
      true
    );

    expect(result.scripts?.test).toBe("vitest");
  });

  it("should create scripts object if it doesn't exist", () => {
    const pkg: PackageJson = {};

    const result = mergeScripts(pkg, {
      test: "vitest",
    });

    expect(result.scripts).toEqual({
      test: "vitest",
    });
  });
});

describe("RAFTSTACK_PACKAGES", () => {
  it("should contain all core packages as strings without versions", () => {
    expect(RAFTSTACK_PACKAGES).toContain("@commitlint/cli");
    expect(RAFTSTACK_PACKAGES).toContain("husky");
    expect(RAFTSTACK_PACKAGES).toContain("lint-staged");
    expect(RAFTSTACK_PACKAGES).toContain("eslint");
    expect(RAFTSTACK_PACKAGES).toContain("prettier");

    // Ensure no version numbers in package names
    for (const pkg of RAFTSTACK_PACKAGES) {
      expect(pkg).not.toMatch(/@\d/);
      expect(pkg).not.toMatch(/\^/);
    }
  });
});

describe("REACT_ESLINT_PACKAGES", () => {
  it("should contain React ESLint packages as strings without versions", () => {
    expect(REACT_ESLINT_PACKAGES).toContain("eslint-plugin-react");
    expect(REACT_ESLINT_PACKAGES).toContain("eslint-plugin-react-hooks");

    // Ensure no version numbers in package names
    for (const pkg of REACT_ESLINT_PACKAGES) {
      expect(pkg).not.toMatch(/@\d/);
      expect(pkg).not.toMatch(/\^/);
    }
  });
});

describe("addPackageJsonConfig", () => {
  it("should add config to package.json", () => {
    const pkg: PackageJson = {};

    const result = addPackageJsonConfig(pkg, "prettier", {
      semi: true,
      singleQuote: true,
    });

    expect(result.prettier).toEqual({
      semi: true,
      singleQuote: true,
    });
  });

  it("should not overwrite existing config by default", () => {
    const pkg: PackageJson = {
      prettier: {
        semi: false,
      },
    };

    const result = addPackageJsonConfig(pkg, "prettier", {
      semi: true,
      singleQuote: true,
    });

    expect(result.prettier).toEqual({
      semi: false,
    });
  });

  it("should overwrite existing config when overwrite is true", () => {
    const pkg: PackageJson = {
      prettier: {
        semi: false,
      },
    };

    const result = addPackageJsonConfig(
      pkg,
      "prettier",
      {
        semi: true,
        singleQuote: true,
      },
      true
    );

    expect(result.prettier).toEqual({
      semi: true,
      singleQuote: true,
    });
  });
});

describe("updatePackageJson", () => {
  beforeEach(() => {
    TEST_DIR = mkdtempSync(join(tmpdir(), "raftstack-test-"));
  });

  afterEach(() => {
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("should read, update, and write package.json", async () => {
    const initialPkg = {
      name: "test-package",
      version: "1.0.0",
    };
    writeFileSync(
      join(TEST_DIR, "package.json"),
      JSON.stringify(initialPkg, null, 2)
    );

    const result = await updatePackageJson(TEST_DIR, (pkg) => ({
      ...pkg,
      version: "2.0.0",
      description: "Updated package",
    }));

    expect(result.version).toBe("2.0.0");
    expect(result.description).toBe("Updated package");

    const content = await readPackageJson(TEST_DIR);
    expect(content.version).toBe("2.0.0");
    expect(content.description).toBe("Updated package");
  });
});
