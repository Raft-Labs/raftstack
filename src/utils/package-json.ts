import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { PackageJson } from "../types/config.js";

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
 * Merge devDependencies into package.json
 */
export function mergeDevDependencies(
  pkg: PackageJson,
  deps: Record<string, string>
): PackageJson {
  const existingDeps = pkg.devDependencies || {};

  return {
    ...pkg,
    devDependencies: {
      ...existingDeps,
      ...deps,
    },
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
 * Dependencies that RaftStack will install in the target project
 */
export const RAFTSTACK_DEV_DEPENDENCIES: Record<string, string> = {
  "@commitlint/cli": "^18.0.0",
  "@commitlint/config-conventional": "^18.0.0",
  "cz-git": "^1.8.0",
  czg: "^1.8.0",
  husky: "^9.0.0",
  "lint-staged": "^15.0.0",
  "validate-branch-name": "^1.3.0",
};
