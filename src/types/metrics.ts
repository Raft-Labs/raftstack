/**
 * Information about a single commit
 */
export interface CommitInfo {
  /** Commit hash */
  hash: string;
  /** Author's display name */
  authorName: string;
  /** Author's email (used as unique identifier) */
  authorEmail: string;
  /** Commit subject line */
  subject: string;
  /** Full commit body */
  body: string;
}

/**
 * Aggregated metrics for a single author
 */
export interface AuthorMetrics {
  /** Author's display name */
  name: string;
  /** Author's email (unique identifier) */
  email: string;
  /** Total number of commits in the time period */
  totalCommits: number;
  /** Percentage of commits with task links (0-100) */
  taskLinkCompliance: number;
  /** Percentage of commits following conventional format (0-100) */
  conventionalCompliance: number;
  /** Weighted overall score (40% task links, 60% conventional) */
  overallScore: number;
}

/**
 * Code quality rules from RaftLabs standards
 */
export type CodeQualityRule =
  | "file-length"
  | "function-length"
  | "max-params"
  | "cyclomatic-complexity"
  | "magic-number";

/**
 * A single code quality violation
 */
export interface FileViolation {
  /** Path to the file */
  filePath: string;
  /** Which rule was violated */
  rule: CodeQualityRule;
  /** Line number where violation occurs */
  line: number;
  /** Human-readable violation message */
  message: string;
}

/**
 * Aggregated codebase compliance metrics
 */
export interface CodebaseMetrics {
  /** Number of files analyzed */
  filesAnalyzed: number;
  /** Total lines of code analyzed */
  totalLines: number;
  /** All violations found */
  violations: FileViolation[];
  /** Compliance percentage for each rule (0-100) */
  complianceByRule: Record<CodeQualityRule, number>;
  /** Overall codebase compliance percentage (0-100) */
  overallCompliance: number;
  /** Files with most violations, sorted descending */
  worstFiles: { path: string; count: number }[];
}

/**
 * Options for the metrics command
 */
export interface MetricsOptions {
  /** Only show Git metrics (commits, branches, authors) */
  git?: boolean;
  /** Only show codebase compliance metrics */
  code?: boolean;
  /** CI mode: exit 1 if below threshold */
  ci?: boolean;
  /** Minimum compliance percentage (default: 70) */
  threshold?: number;
  /** Time period in days (default: 30) */
  days?: number;
}
