import { execa } from "execa";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { isGitRepo } from "../utils/git.js";
import { analyzeCodebase } from "../utils/code-analyzer.js";
import type {
  CommitInfo,
  AuthorMetrics,
  MetricsOptions,
  CodebaseMetrics,
  CodeQualityRule,
} from "../types/metrics.js";

interface BranchMetricsResult {
  branchNames: string[];
  validBranches: number;
  invalidBranches: number;
  branchCompliance: number;
}

/**
 * Full conventional commit pattern with emoji + type(scope): desc
 * Supported emojis: ✨(feat) 🐛(fix) 📝(docs) 💄(style) ♻️(refactor)
 *                   ⚡(perf) ✅(test) 📦(build) 👷(ci) 🔧(chore) ⏪(revert)
 */
const CONVENTIONAL_COMMIT_PATTERN =
  /^(✨|🐛|📝|💄|♻️|⚡|✅|📦|👷|🔧|⏪)\s+(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?:\s.+/;

/**
 * Get commits with full author information
 */
async function getCommitsWithAuthors(
  targetDir: string,
  days: number
): Promise<CommitInfo[]> {
  try {
    const { stdout } = await execa(
      "git",
      [
        "log",
        `--since=${days} days ago`,
        "--format=%H|%an|%ae|%s---BODY---%B---END---",
        "--no-merges",
      ],
      { cwd: targetDir }
    );

    const commits: CommitInfo[] = [];
    const entries = stdout.split("---END---").filter((e) => e.trim());

    for (const entry of entries) {
      const bodyMarker = entry.indexOf("---BODY---");
      if (bodyMarker === -1) continue;

      const headerPart = entry.substring(0, bodyMarker).trim();
      const bodyPart = entry.substring(bodyMarker + 10).trim();

      const parts = headerPart.split("|");
      if (parts.length >= 4) {
        commits.push({
          hash: parts[0],
          authorName: parts[1],
          authorEmail: parts[2],
          subject: parts.slice(3).join("|"), // Subject might contain |
          body: bodyPart,
        });
      }
    }

    return commits;
  } catch {
    return [];
  }
}

/**
 * Check if commit follows conventional commit format with emoji
 */
export function isConventionalCommit(subject: string): boolean {
  return CONVENTIONAL_COMMIT_PATTERN.test(subject);
}

/**
 * Check if commit has a task link
 */
function hasTaskLink(commit: CommitInfo): boolean {
  const fullMessage = `${commit.subject}\n${commit.body}`;
  return (
    fullMessage.includes("app.asana.com") ||
    fullMessage.includes("Task:") ||
    fullMessage.includes("task:") ||
    fullMessage.includes("Closes #") ||
    fullMessage.includes("Fixes #") ||
    fullMessage.includes("Resolves #") ||
    /https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+/.test(fullMessage)
  );
}

/**
 * Calculate metrics for each author
 */
export function calculateAuthorMetrics(commits: CommitInfo[]): AuthorMetrics[] {
  const authorMap = new Map<
    string,
    {
      name: string;
      email: string;
      commits: CommitInfo[];
    }
  >();

  // Group commits by author email
  for (const commit of commits) {
    const existing = authorMap.get(commit.authorEmail);
    if (existing) {
      existing.commits.push(commit);
      // Use most recent name
      existing.name = commit.authorName;
    } else {
      authorMap.set(commit.authorEmail, {
        name: commit.authorName,
        email: commit.authorEmail,
        commits: [commit],
      });
    }
  }

  // Calculate metrics for each author
  const authorMetrics: AuthorMetrics[] = [];

  for (const [, author] of authorMap) {
    const totalCommits = author.commits.length;
    const withTaskLinks = author.commits.filter(hasTaskLink).length;
    const conventional = author.commits.filter((c) =>
      isConventionalCommit(c.subject)
    ).length;

    const taskLinkCompliance =
      totalCommits > 0 ? Math.round((withTaskLinks / totalCommits) * 100) : 100;
    const conventionalCompliance =
      totalCommits > 0 ? Math.round((conventional / totalCommits) * 100) : 100;

    // Weighted score: 40% task links, 60% conventional commits
    const overallScore = Math.round(
      taskLinkCompliance * 0.4 + conventionalCompliance * 0.6
    );

    authorMetrics.push({
      name: author.name,
      email: author.email,
      totalCommits,
      taskLinkCompliance,
      conventionalCompliance,
      overallScore,
    });
  }

  // Sort by overall score descending
  return authorMetrics.sort((a, b) => b.overallScore - a.overallScore);
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
 * Calculate branch metrics
 */
async function calculateBranchMetrics(
  targetDir: string
): Promise<BranchMetricsResult> {
  const branches = await getBranchNames(targetDir);
  const validBranches = branches.filter(isValidBranchName);
  const invalidBranches = branches.filter((b) => !isValidBranchName(b));

  return {
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
 * Format author leaderboard
 */
function formatLeaderboard(
  authors: AuthorMetrics[],
  title: string,
  limit: number
): string {
  if (authors.length === 0) return "";

  const lines = [pc.bold(title)];

  const displayed = authors.slice(0, limit);
  displayed.forEach((author, index) => {
    const score = formatCompliance(author.overallScore);
    const truncatedEmail =
      author.email.length > 25
        ? author.email.substring(0, 22) + "..."
        : author.email;
    lines.push(
      `  ${index + 1}. ${author.name} (${truncatedEmail}) - ${score} - ${author.totalCommits} commits`
    );
  });

  return lines.join("\n");
}

/**
 * Format codebase metrics display
 */
function formatCodebaseMetrics(metrics: CodebaseMetrics): string {
  const ruleNames: Record<CodeQualityRule, string> = {
    "file-length": `File length (≤300)`,
    "function-length": `Function length (≤30)`,
    "max-params": `Max parameters (≤3)`,
    "cyclomatic-complexity": `Cyclomatic complexity`,
    "magic-number": `Magic numbers`,
  };

  const lines = [
    pc.bold("CODEBASE COMPLIANCE"),
    `  Files analyzed: ${metrics.filesAnalyzed}`,
    `  Total lines: ${metrics.totalLines.toLocaleString()}`,
    "",
    pc.bold("  RULE COMPLIANCE"),
  ];

  for (const rule of Object.keys(ruleNames) as CodeQualityRule[]) {
    const compliance = metrics.complianceByRule[rule];
    const label = ruleNames[rule].padEnd(28);
    lines.push(`    ${label}${formatCompliance(compliance)}`);
  }

  lines.push("");
  lines.push(`  ${pc.bold("OVERALL:")} ${formatCompliance(metrics.overallCompliance)}`);

  if (metrics.worstFiles.length > 0) {
    lines.push("");
    lines.push(pc.bold("  TOP VIOLATIONS"));

    for (const file of metrics.worstFiles.slice(0, 5)) {
      lines.push(`    ${file.path} (${file.count} violations)`);

      // Group violations by rule for this file
      const fileViolations = metrics.violations.filter(
        (v) => v.filePath === file.path
      );
      const byRule = new Map<CodeQualityRule, number>();
      for (const v of fileViolations) {
        byRule.set(v.rule, (byRule.get(v.rule) || 0) + 1);
      }

      for (const [rule, count] of byRule) {
        lines.push(`      - ${count}x ${rule}`);
      }
    }
  }

  return lines.join("\n");
}

/**
 * Run the metrics command
 */
export async function runMetrics(
  targetDir: string,
  options: MetricsOptions = {}
): Promise<void> {
  const { git: gitOnly, code: codeOnly, ci: ciMode, threshold = 70 } = options;
  const showGit = !codeOnly;
  const showCode = !gitOnly;

  // In CI mode, skip interactive prompts
  const days = options.days || (ciMode ? 30 : null);

  if (!ciMode) {
    p.intro(pc.bgCyan(pc.black(" RaftStack Metrics ")));
  }

  if (!(await isGitRepo(targetDir))) {
    if (ciMode) {
      console.error("Error: Not a git repository");
      process.exit(1);
    }
    p.cancel("Not a git repository");
    process.exit(1);
  }

  let selectedDays = days;
  if (!selectedDays && !ciMode) {
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

    selectedDays = daysOption as number;
  }

  const analyzeDays = selectedDays || 30;

  const spinner = ciMode ? null : p.spinner();
  spinner?.start("Analyzing repository...");

  let overallCompliance = 100;
  const complianceScores: number[] = [];

  // Git metrics (commits, branches, authors)
  if (showGit) {
    const [commits, branchMetrics] = await Promise.all([
      getCommitsWithAuthors(targetDir, analyzeDays),
      calculateBranchMetrics(targetDir),
    ]);

    const authorMetrics = calculateAuthorMetrics(commits);

    // Calculate overall git compliance
    const totalCommits = commits.length;
    const withTaskLinks = commits.filter(hasTaskLink).length;
    const conventional = commits.filter((c) =>
      isConventionalCommit(c.subject)
    ).length;

    const taskLinkCompliance =
      totalCommits > 0 ? Math.round((withTaskLinks / totalCommits) * 100) : 100;
    const conventionalCompliance =
      totalCommits > 0 ? Math.round((conventional / totalCommits) * 100) : 100;

    complianceScores.push(
      taskLinkCompliance,
      conventionalCompliance,
      branchMetrics.branchCompliance
    );

    spinner?.stop("Git analysis complete");

    if (ciMode) {
      console.log("\n=== GIT METRICS ===");
      console.log(`Commits (last ${analyzeDays} days): ${totalCommits}`);
      console.log(`Task link compliance: ${taskLinkCompliance}%`);
      console.log(`Conventional commit compliance: ${conventionalCompliance}%`);
      console.log(`Branch compliance: ${branchMetrics.branchCompliance}%`);
    } else {
      // Display git metrics
      p.note(
        `${pc.bold("Commits")} (last ${analyzeDays} days)
  Total: ${totalCommits}
  With task links: ${withTaskLinks} (${formatCompliance(taskLinkCompliance)})
  Conventional format: ${conventional} (${formatCompliance(conventionalCompliance)})

${pc.bold("Branches")}
  Total: ${branchMetrics.branchNames.length}
  Valid naming: ${branchMetrics.validBranches}
  Invalid naming: ${branchMetrics.invalidBranches}
  Compliance: ${formatCompliance(branchMetrics.branchCompliance)}`,
        "Git Metrics"
      );

      // Author leaderboard
      if (authorMetrics.length > 0) {
        const topPerformers = authorMetrics.filter((a) => a.overallScore >= 70);
        const needsImprovement = authorMetrics
          .filter((a) => a.overallScore < 70)
          .reverse(); // Worst first

        let leaderboardText = "";

        if (topPerformers.length > 0) {
          leaderboardText += formatLeaderboard(
            topPerformers,
            "TOP PERFORMERS",
            5
          );
        }

        if (needsImprovement.length > 0) {
          if (leaderboardText) leaderboardText += "\n\n";
          leaderboardText += formatLeaderboard(
            needsImprovement,
            "NEEDS IMPROVEMENT",
            5
          );
        }

        if (leaderboardText) {
          p.note(leaderboardText, "Author Leaderboard");
        }
      }

      // Show invalid branches
      if (branchMetrics.invalidBranches > 0) {
        const invalidBranches = branchMetrics.branchNames.filter(
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
    }
  }

  // Codebase metrics
  if (showCode) {
    if (!ciMode && showGit) {
      spinner?.start("Analyzing codebase...");
    } else if (!ciMode) {
      spinner?.start("Analyzing codebase...");
    }

    const codebaseMetrics = await analyzeCodebase(targetDir);
    complianceScores.push(codebaseMetrics.overallCompliance);

    spinner?.stop("Codebase analysis complete");

    if (ciMode) {
      console.log("\n=== CODEBASE METRICS ===");
      console.log(`Files analyzed: ${codebaseMetrics.filesAnalyzed}`);
      console.log(`Overall compliance: ${codebaseMetrics.overallCompliance}%`);

      for (const [rule, compliance] of Object.entries(
        codebaseMetrics.complianceByRule
      )) {
        console.log(`  ${rule}: ${compliance}%`);
      }
    } else {
      p.note(formatCodebaseMetrics(codebaseMetrics), "Codebase Analysis");
    }
  }

  // Calculate overall compliance
  if (complianceScores.length > 0) {
    overallCompliance = Math.round(
      complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length
    );
  }

  // CI mode exit handling
  if (ciMode) {
    console.log(`\nOVERALL COMPLIANCE: ${overallCompliance}%`);
    console.log(`THRESHOLD: ${threshold}%`);

    if (overallCompliance < threshold) {
      console.log(
        `\nFAILED: Compliance ${overallCompliance}% is below threshold ${threshold}%`
      );
      process.exit(1);
    } else {
      console.log(`\nPASSED: Compliance meets threshold`);
      process.exit(0);
    }
  }

  // Interactive outro
  if (overallCompliance >= 90) {
    p.outro(pc.green("✓ Excellent compliance! Keep up the good work."));
  } else if (overallCompliance >= 70) {
    p.outro(pc.yellow("⚠ Good progress, but there's room for improvement."));
  } else {
    p.outro(pc.red("✗ Compliance needs attention. Review the guidelines."));
  }
}
