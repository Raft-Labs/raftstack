import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import spawn from "cross-spawn";
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
 * Version comments for reference - actual versions resolved by package manager
 */
export const RAFTSTACK_PACKAGES: string[] = [
  // Commit tooling
  "@commitlint/cli",           // ^20.3.0
  "@commitlint/config-conventional", // ^20.3.0
  "cz-git",                    // ^1.12.0
  "czg",                       // ^1.12.0
  "husky",                     // ^9.1.7
  "lint-staged",               // ^16.2.0
  "validate-branch-name",      // ^1.3.2

  // Linting & formatting
  "eslint",                    // ^9.39.0
  "@eslint/js",                // ^9.39.0
  "typescript-eslint",         // ^8.39.0
  "eslint-config-prettier",    // ^10.1.0
  "prettier",                  // ^3.8.0
  "globals",                   // ^17.0.0
];

/**
 * Additional ESLint packages for React projects (non-Next.js)
 */
export const REACT_ESLINT_PACKAGES: string[] = [
  "eslint-plugin-react",       // ^7.37.0
  "eslint-plugin-react-hooks", // ^5.2.0
];

/**
 * Additional ESLint packages for Next.js projects
 * eslint-config-next includes React plugin configurations
 */
export const NEXTJS_ESLINT_PACKAGES: string[] = [
  "eslint-config-next",        // ^16.1.0
];

/**
 * Result of package installation
 */
export interface InstallResult {
  success: boolean;
  error?: string;
}

/**
 * Check if directory is a pnpm workspace root
 */
function isPnpmWorkspace(targetDir: string): boolean {
  return existsSync(join(targetDir, "pnpm-workspace.yaml"));
}

/**
 * Install packages using the package manager CLI
 *
 * Uses cross-spawn with shell: true for reliable PATH resolution
 * in sandboxed environments (pnpm dlx, npx). This is the industry
 * standard approach used by create-next-app, create-vite, etc.
 */
export async function installPackages(
  pm: PackageManagerInfo,
  packages: string[],
  targetDir: string
): Promise<InstallResult> {
  if (packages.length === 0) {
    return { success: true };
  }

  return new Promise((resolve) => {
    // Build the command: e.g., "pnpm add -D pkg1 pkg2 ..."
    const pmCommand = pm.name === "npm" ? "npm" : pm.name.replace("-berry", "");
    const parts = [pmCommand, ...pm.addDev.split(" ")];

    // For pnpm workspaces, add -w flag to install at workspace root
    if (pm.name === "pnpm" && isPnpmWorkspace(targetDir)) {
      parts.push("-w");
    }

    parts.push(...packages);

    // Join as single command string to avoid Node.js deprecation warning
    // about passing args with shell: true
    const fullCommand = parts.join(" ");

    const child = spawn(fullCommand, [], {
      cwd: targetDir,
      stdio: "inherit", // Show install progress to user
      shell: true, // Key: use shell to resolve PATH in sandboxed envs
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        resolve({
          success: false,
          error: `Installation failed with exit code ${code}`,
        });
      }
    });

    child.on("error", (err) => {
      resolve({
        success: false,
        error: err.message,
      });
    });
  });
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
