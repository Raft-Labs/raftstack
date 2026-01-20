import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PackageManager, PackageManagerInfo, PackageJson } from "../types/config.js";

/**
 * Package manager metadata and commands
 */
export const PACKAGE_MANAGERS: Record<PackageManager, PackageManagerInfo> = {
  npm: {
    name: "npm",
    install: "npm install",
    run: "npm run",
    exec: "npx",
    lockfile: "package-lock.json",
    installFrozen: "npm ci",
    needsSetupAction: false,
    cacheKey: "npm-${{ hashFiles('**/package-lock.json') }}",
  },
  pnpm: {
    name: "pnpm",
    install: "pnpm install",
    run: "pnpm",
    exec: "pnpm dlx",
    lockfile: "pnpm-lock.yaml",
    installFrozen: "pnpm install --frozen-lockfile",
    needsSetupAction: true,
    cacheKey: "pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}",
  },
  yarn: {
    name: "yarn",
    install: "yarn install",
    run: "yarn",
    exec: "yarn",
    lockfile: "yarn.lock",
    installFrozen: "yarn install --frozen-lockfile",
    needsSetupAction: false,
    cacheKey: "yarn-${{ hashFiles('**/yarn.lock') }}",
  },
  "yarn-berry": {
    name: "yarn-berry",
    install: "yarn install",
    run: "yarn",
    exec: "yarn dlx",
    lockfile: "yarn.lock",
    installFrozen: "yarn install --immutable",
    needsSetupAction: false,
    cacheKey: "yarn-${{ hashFiles('**/yarn.lock') }}",
  },
};

/**
 * Detect Yarn version from package.json packageManager field
 * @param targetDir Directory to check
 * @returns "yarn" for 1.x, "yarn-berry" for 2+, or null if not specified
 */
export function detectYarnVersion(targetDir: string): "yarn" | "yarn-berry" | null {
  const packageJsonPath = join(targetDir, "package.json");

  if (!existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    const packageManager = packageJson.packageManager as string | undefined;

    if (!packageManager) {
      return null;
    }

    // Parse packageManager field (e.g., "yarn@3.6.0", "yarn@1.22.19")
    const match = packageManager.match(/^yarn@(\d+)\./);
    if (match) {
      const majorVersion = Number.parseInt(match[1], 10);
      return majorVersion >= 2 ? "yarn-berry" : "yarn";
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Detect package manager from lockfiles
 * Priority: pnpm-lock.yaml > yarn.lock > package-lock.json
 * @param targetDir Directory to check for lockfiles
 * @returns Detected package manager or null if no lockfile found
 */
export function detectPackageManager(targetDir: string): PackageManagerInfo | null {
  // Check pnpm first (highest priority)
  if (existsSync(join(targetDir, "pnpm-lock.yaml"))) {
    return PACKAGE_MANAGERS.pnpm;
  }

  // Check yarn second
  if (existsSync(join(targetDir, "yarn.lock"))) {
    const yarnVersion = detectYarnVersion(targetDir);

    // If packageManager field specifies version, use that
    if (yarnVersion === "yarn-berry") {
      return PACKAGE_MANAGERS["yarn-berry"];
    }

    // Default to Yarn 1.x (classic)
    return PACKAGE_MANAGERS.yarn;
  }

  // Check npm last (lowest priority)
  if (existsSync(join(targetDir, "package-lock.json"))) {
    return PACKAGE_MANAGERS.npm;
  }

  // No lockfile found
  return null;
}

/**
 * Get package manager metadata by name
 * @param name Package manager name
 * @returns Package manager metadata
 */
export function getPackageManagerInfo(name: PackageManager): PackageManagerInfo {
  return PACKAGE_MANAGERS[name];
}

/**
 * Get human-readable description of package manager
 * @param pm Package manager info
 * @returns Human-readable description
 */
export function getPackageManagerDescription(pm: PackageManagerInfo): string {
  switch (pm.name) {
    case "npm":
      return "npm (Node Package Manager)";
    case "pnpm":
      return "pnpm (Performant npm)";
    case "yarn":
      return "Yarn Classic (1.x)";
    case "yarn-berry":
      return "Yarn Berry (2+)";
    default:
      return pm.name;
  }
}
