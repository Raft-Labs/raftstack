/**
 * Project type detection result
 */
export type ProjectType = "nx" | "turbo" | "pnpm-workspace" | "single";

/**
 * AI code review tool selection
 */
export type AIReviewTool = "coderabbit" | "copilot" | "none";

/**
 * Package manager type
 */
export type PackageManager = "npm" | "pnpm" | "yarn" | "yarn-berry";

/**
 * Package manager metadata and command information
 */
export interface PackageManagerInfo {
  /** Package manager name */
  name: PackageManager;

  /** Install command (e.g., "npm install") */
  install: string;

  /** Run command (e.g., "npm run") */
  run: string;

  /** Execute command for running binaries (e.g., "npx") */
  exec: string;

  /** Lockfile name (e.g., "package-lock.json") */
  lockfile: string;

  /** Frozen/immutable install command for CI (e.g., "npm ci") */
  installFrozen: string;

  /** Add dev dependency command (e.g., "install -D" for npm, "add -D" for pnpm/yarn) */
  addDev: string;

  /** Whether this PM needs a setup action in GitHub workflows (pnpm only) */
  needsSetupAction: boolean;

  /** Cache key pattern for GitHub actions cache */
  cacheKey: string;
}

/**
 * User configuration collected during init
 */
export interface RaftStackConfig {
  /** Detected or user-selected project type */
  projectType: ProjectType;

  /** Detected or user-selected package manager */
  packageManager: PackageManagerInfo;

  /** Asana workspace base URL for task linking */
  asanaBaseUrl?: string;

  /** Selected AI review tool */
  aiReviewTool: AIReviewTool;

  /** GitHub usernames for CODEOWNERS */
  codeowners: string[];

  /** Whether the project uses TypeScript */
  usesTypeScript: boolean;

  /** Whether the project uses ESLint */
  usesEslint: boolean;

  /** Whether the project uses Prettier */
  usesPrettier: boolean;
}

/**
 * Result of project type detection
 */
export interface DetectionResult {
  /** Detected project type */
  type: ProjectType;

  /** Confidence level of detection */
  confidence: "high" | "medium" | "low";

  /** Files that were found to make this determination */
  indicators: string[];
}

/**
 * Options for file generation
 */
export interface GeneratorOptions {
  /** Target directory (defaults to cwd) */
  targetDir?: string;

  /** Whether to overwrite existing files */
  overwrite?: boolean;

  /** Whether to create backups of existing files */
  backup?: boolean;
}

/**
 * Result of a generator operation
 */
export interface GeneratorResult {
  /** Files that were created */
  created: string[];

  /** Files that were modified */
  modified: string[];

  /** Files that were skipped (already exist) */
  skipped: string[];

  /** Files that were backed up */
  backedUp: string[];
}

/**
 * Package.json structure (partial)
 */
export interface PackageJson {
  name?: string;
  version?: string;
  type?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}
