import { execa } from "execa";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { isGitRepo } from "../utils/git.js";

interface MetricsResult {
  totalCommits: number;
  commitsWithTaskLinks: number;
  taskLinkCompliance: number;
  branchNames: string[];
  validBranches: number;
  invalidBranches: number;
  branchCompliance: number;
}

/**
 * Get commits from the last N days
 */
async function getRecentCommits(
  targetDir: string,
  days: number
): Promise<string[]> {
  try {
    const { stdout } = await execa(
      "git",
      ["log", `--since=${days} days ago`, "--oneline", "--no-merges"],
      { cwd: targetDir }
    );
    return stdout.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Get commit messages with full body
 */
async function getCommitMessages(
  targetDir: string,
  days: number
): Promise<string[]> {
  try {
    const { stdout } = await execa(
      "git",
      [
        "log",
        `--since=${days} days ago`,
        "--format=%B---COMMIT_SEPARATOR---",
        "--no-merges",
      ],
      { cwd: targetDir }
    );
    return stdout.split("---COMMIT_SEPARATOR---").filter((m) => m.trim());
  } catch {
    return [];
  }
}

/**
 * Get all branch names
 */
async function getBranchNames(targetDir: string): Promise<string[]> {
  try {
    const { stdout } = await execa(
      "git",
      ["branch", "-a", "--format=%(refname:short)"],
      { cwd: targetDir }
    );
    return stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((b) => b.replace("origin/", ""))
      .filter((b, i, arr) => arr.indexOf(b) === i); // unique
  } catch {
    return [];
  }
}

/**
 * Validate branch name against convention
 */
function isValidBranchName(name: string): boolean {
  const pattern =
    /^(main|staging|development|master)$|^(feature|bugfix|hotfix|chore|refactor)\/[a-z0-9-]+$/;
  return pattern.test(name);
}

/**
 * Check if commit has task link
 */
function hasTaskLink(message: string): boolean {
  return (
    message.includes("app.asana.com") ||
    message.includes("Task:") ||
    message.includes("task:") ||
    message.includes("Closes #") ||
    message.includes("Fixes #")
  );
}

/**
 * Calculate metrics for the repository
 */
async function calculateMetrics(
  targetDir: string,
  days: number
): Promise<MetricsResult> {
  const [commits, commitMessages, branches] = await Promise.all([
    getRecentCommits(targetDir, days),
    getCommitMessages(targetDir, days),
    getBranchNames(targetDir),
  ]);

  const commitsWithTaskLinks = commitMessages.filter(hasTaskLink).length;
  const validBranches = branches.filter(isValidBranchName);
  const invalidBranches = branches.filter((b) => !isValidBranchName(b));

  return {
    totalCommits: commits.length,
    commitsWithTaskLinks,
    taskLinkCompliance:
      commits.length > 0
        ? Math.round((commitsWithTaskLinks / commits.length) * 100)
        : 100,
    branchNames: branches,
    validBranches: validBranches.length,
    invalidBranches: invalidBranches.length,
    branchCompliance:
      branches.length > 0
        ? Math.round((validBranches.length / branches.length) * 100)
        : 100,
  };
}

/**
 * Format compliance percentage with color
 */
function formatCompliance(percentage: number): string {
  if (percentage >= 90) return pc.green(`${percentage}%`);
  if (percentage >= 70) return pc.yellow(`${percentage}%`);
  return pc.red(`${percentage}%`);
}

/**
 * Run the metrics command
 */
export async function runMetrics(targetDir: string): Promise<void> {
  p.intro(pc.bgCyan(pc.black(" RaftStack Metrics ")));

  if (!(await isGitRepo(targetDir))) {
    p.cancel("Not a git repository");
    process.exit(1);
  }

  const daysOption = await p.select({
    message: "Time period to analyze:",
    options: [
      { value: 7, label: "Last 7 days" },
      { value: 14, label: "Last 14 days" },
      { value: 30, label: "Last 30 days" },
      { value: 90, label: "Last 90 days" },
    ],
  });

  if (p.isCancel(daysOption)) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  const days = daysOption as number;

  const spinner = p.spinner();
  spinner.start("Analyzing repository...");

  const metrics = await calculateMetrics(targetDir, days);

  spinner.stop("Analysis complete");

  p.note(
    `${pc.bold("Commits")} (last ${days} days)
  Total: ${metrics.totalCommits}
  With task links: ${metrics.commitsWithTaskLinks}
  Compliance: ${formatCompliance(metrics.taskLinkCompliance)}

${pc.bold("Branches")}
  Total: ${metrics.branchNames.length}
  Valid naming: ${metrics.validBranches}
  Invalid naming: ${metrics.invalidBranches}
  Compliance: ${formatCompliance(metrics.branchCompliance)}`,
    "Repository Metrics"
  );

  if (metrics.invalidBranches > 0) {
    const invalidBranches = metrics.branchNames.filter(
      (b) => !isValidBranchName(b)
    );
    p.log.warn(
      `Invalid branch names:\n  ${invalidBranches.slice(0, 10).join("\n  ")}${
        invalidBranches.length > 10
          ? `\n  ... and ${invalidBranches.length - 10} more`
          : ""
      }`
    );
  }

  const overallCompliance = Math.round(
    (metrics.taskLinkCompliance + metrics.branchCompliance) / 2
  );

  if (overallCompliance >= 90) {
    p.outro(pc.green("✓ Excellent compliance! Keep up the good work."));
  } else if (overallCompliance >= 70) {
    p.outro(pc.yellow("⚠ Good progress, but there's room for improvement."));
  } else {
    p.outro(pc.red("✗ Compliance needs attention. Review the guidelines."));
  }
}
