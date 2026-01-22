import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { execa } from "execa";
import type { PackageJson, PackageManagerInfo } from "../types/config.js";

/**
 * Read package.json from a directory
 */
export async function readPackageJson(
  targetDir: string = process.cwd()
): Promise<PackageJson> {
  const pkgPath = join(targetDir, "package.json");

  if (!existsSync(pkgPath)) {
    throw new Error(`No package.json found in ${targetDir}`);
  }

  const content = await readFile(pkgPath, "utf-8");
  return JSON.parse(content) as PackageJson;
}

/**
 * Write package.json to a directory
 */
export async function writePackageJson(
  pkg: PackageJson,
  targetDir: string = process.cwd()
): Promise<void> {
  const pkgPath = join(targetDir, "package.json");
  const content = JSON.stringify(pkg, null, 2) + "\n";
  await writeFile(pkgPath, content, "utf-8");
}

/**
 * Merge scripts into package.json without overwriting existing ones
 */
export function mergeScripts(
  pkg: PackageJson,
  scripts: Record<string, string>,
  overwrite: boolean = false
): PackageJson {
  const existingScripts = pkg.scripts || {};
  const newScripts: Record<string, string> = { ...existingScripts };

  for (const [name, command] of Object.entries(scripts)) {
    if (overwrite || !existingScripts[name]) {
      newScripts[name] = command;
    }
  }

  return {
    ...pkg,
    scripts: newScripts,
  };
}


/**
 * Add a config section to package.json (e.g., lint-staged, validate-branch-name)
 */
export function addPackageJsonConfig<T>(
  pkg: PackageJson,
  key: string,
  config: T,
  overwrite: boolean = false
): PackageJson {
  if (!overwrite && pkg[key]) {
    return pkg;
  }

  return {
    ...pkg,
    [key]: config,
  };
}

/**
 * Update package.json with multiple changes at once
 */
export async function updatePackageJson(
  targetDir: string,
  updater: (pkg: PackageJson) => PackageJson
): Promise<PackageJson> {
  const pkg = await readPackageJson(targetDir);
  const updated = updater(pkg);
  await writePackageJson(updated, targetDir);
  return updated;
}

/**
 * Core packages that RaftStack will install in the target project
 */
export const RAFTSTACK_PACKAGES: string[] = [
  // Commit tooling
  "@commitlint/cli",
  "@commitlint/config-conventional",
  "cz-git",
  "czg",
  "husky",
  "lint-staged",
  "validate-branch-name",

  // Linting & formatting
  "eslint",
  "@eslint/js",
  "typescript-eslint",
  "eslint-config-prettier",
  "prettier",
  "globals",
];

/**
 * Additional ESLint packages for React projects
 */
export const REACT_ESLINT_PACKAGES: string[] = [
  "eslint-plugin-react",
  "eslint-plugin-react-hooks",
];

/**
 * Result of package installation
 */
export interface InstallResult {
  success: boolean;
  error?: string;
}

/**
 * Install packages using the package manager CLI
 *
 * Uses execa instead of spawn for better PATH resolution,
 * especially when running via `pnpm dlx` or `npx`.
 */
export async function installPackages(
  pm: PackageManagerInfo,
  packages: string[],
  targetDir: string
): Promise<InstallResult> {
  if (packages.length === 0) {
    return { success: true };
  }

  try {
    // Build the command: e.g., "pnpm add -D pkg1 pkg2 ..."
    // addDev is like "install -D" or "add -D"
    const addDevArgs = pm.addDev.split(" ");
    const pmCommand = pm.name === "npm" ? "npm" : pm.name.replace("-berry", "");
    const args = [...addDevArgs, ...packages];

    await execa(pmCommand, args, {
      cwd: targetDir,
      stdio: "inherit", // Show install progress to user
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get package manager-specific scripts
 * This can be used in the future to add PM-specific setup scripts
 */
export function getPackageManagerScripts(
  _pm: PackageManagerInfo
): Record<string, string> {
  // Currently, all package managers use the same scripts
  // This function is here for future extensibility if we need
  // different scripts for different package managers
  return {
    commit: "czg",
    prepare: "husky",
  };
}
