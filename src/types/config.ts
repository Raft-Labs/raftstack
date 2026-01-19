/**
 * Project type detection result
 */
export type ProjectType = "nx" | "turbo" | "pnpm-workspace" | "single";

/**
 * AI code review tool selection
 */
export type AIReviewTool = "coderabbit" | "copilot" | "none";

/**
 * User configuration collected during init
 */
export interface RaftStackConfig {
  /** Detected or user-selected project type */
  projectType: ProjectType;

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
