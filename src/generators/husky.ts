import { join } from "node:path";
import type { GeneratorResult, ProjectType } from "../types/config.js";
import { ensureDir, writeFileSafe } from "../utils/file-system.js";

/**
 * Generate Husky pre-commit hook with direct command execution
 *
 * Uses Husky v9+ format (just the command, no shim).
 * Direct commands work because Husky adds node_modules/.bin to PATH.
 */
function getPreCommitHook(_projectType: ProjectType): string {
  return `lint-staged
`;
}

/**
 * Generate Husky commit-msg hook for commitlint
 */
function getCommitMsgHook(): string {
  return `commitlint --edit "$1"
`;
}

/**
 * Generate Husky pre-push hook for branch validation
 */
function getPrePushHook(): string {
  return `validate-branch-name
`;
}

/**
 * Generate all Husky hooks
 *
 * Note: The pm parameter is kept for backward compatibility but is no longer
 * used since hooks now use direct commands.
 */
export async function generateHuskyHooks(
  targetDir: string,
  projectType: ProjectType,
  _pm?: unknown
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  const huskyDir = join(targetDir, ".husky");
  await ensureDir(huskyDir);

  // Pre-commit hook
  const preCommitPath = join(huskyDir, "pre-commit");
  const preCommitResult = await writeFileSafe(
    preCommitPath,
    getPreCommitHook(projectType),
    { executable: true, backup: true }
  );
  if (preCommitResult.created) {
    result.created.push(".husky/pre-commit");
    if (preCommitResult.backedUp) {
      result.backedUp.push(preCommitResult.backedUp);
    }
  }

  // Commit-msg hook
  const commitMsgPath = join(huskyDir, "commit-msg");
  const commitMsgResult = await writeFileSafe(
    commitMsgPath,
    getCommitMsgHook(),
    { executable: true, backup: true }
  );
  if (commitMsgResult.created) {
    result.created.push(".husky/commit-msg");
    if (commitMsgResult.backedUp) {
      result.backedUp.push(commitMsgResult.backedUp);
    }
  }

  // Pre-push hook
  const prePushPath = join(huskyDir, "pre-push");
  const prePushResult = await writeFileSafe(prePushPath, getPrePushHook(), {
    executable: true,
    backup: true,
  });
  if (prePushResult.created) {
    result.created.push(".husky/pre-push");
    if (prePushResult.backedUp) {
      result.backedUp.push(prePushResult.backedUp);
    }
  }

  return result;
}
