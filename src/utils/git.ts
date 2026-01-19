import { execa } from "execa";
import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Check if directory is a git repository
 */
export async function isGitRepo(
  targetDir: string = process.cwd()
): Promise<boolean> {
  // Quick check for .git directory
  if (existsSync(join(targetDir, ".git"))) {
    return true;
  }

  // Fallback to git command (handles worktrees, etc.)
  try {
    await execa("git", ["rev-parse", "--git-dir"], { cwd: targetDir });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the root directory of the git repository
 */
export async function getGitRoot(
  targetDir: string = process.cwd()
): Promise<string | null> {
  try {
    const { stdout } = await execa("git", ["rev-parse", "--show-toplevel"], {
      cwd: targetDir,
    });
    return stdout.trim();
  } catch {
    return null;
  }
}

/**
 * Get current branch name
 */
export async function getCurrentBranch(
  targetDir: string = process.cwd()
): Promise<string | null> {
  try {
    const { stdout } = await execa("git", ["branch", "--show-current"], {
      cwd: targetDir,
    });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Check if gh CLI is available and authenticated
 */
export async function isGhCliAvailable(): Promise<boolean> {
  try {
    await execa("gh", ["auth", "status"]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get GitHub repository info (owner/repo)
 */
export async function getGitHubRepoInfo(
  targetDir: string = process.cwd()
): Promise<{ owner: string; repo: string } | null> {
  try {
    const { stdout } = await execa("gh", ["repo", "view", "--json", "owner,name"], {
      cwd: targetDir,
    });
    const data = JSON.parse(stdout);
    return {
      owner: data.owner.login,
      repo: data.name,
    };
  } catch {
    return null;
  }
}

/**
 * Initialize husky in the repository
 */
export async function initHusky(
  targetDir: string = process.cwd()
): Promise<void> {
  await execa("npx", ["husky", "init"], { cwd: targetDir });
}

/**
 * Run a git command
 */
export async function runGitCommand(
  args: string[],
  targetDir: string = process.cwd()
): Promise<string> {
  const { stdout } = await execa("git", args, { cwd: targetDir });
  return stdout;
}
