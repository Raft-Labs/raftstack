import { existsSync } from "node:fs";
import { readdir, copyFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { GeneratorResult } from "../types/config.js";
import { ensureDir, backupFile } from "../utils/file-system.js";

/**
 * Get the path to the commands directory in the installed package
 */
function getPackageCommandsDir(): string {
  // In ESM, we use import.meta.url to find the package location
  // tsup bundles everything into dist/cli.js, so we only need to go up 1 level
  const currentFilePath = fileURLToPath(import.meta.url);
  const packageRoot = join(dirname(currentFilePath), "..");
  return join(packageRoot, ".claude", "commands");
}

/**
 * Recursively copy a directory
 */
async function copyDirectory(
  srcDir: string,
  destDir: string,
  result: GeneratorResult,
  baseDir: string
): Promise<void> {
  await ensureDir(destDir);

  const entries = await readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);
    const relativePath = destPath.replace(baseDir + "/", "");

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, result, baseDir);
    } else {
      // Check if destination exists
      if (existsSync(destPath)) {
        // Backup existing file
        const backupPath = await backupFile(destPath);
        if (backupPath) {
          result.backedUp.push(relativePath);
        }
      }

      // Copy the file
      await copyFile(srcPath, destPath);
      result.created.push(relativePath);
    }
  }
}

/**
 * Generate Claude Code commands by copying them to the target project
 *
 * This copies the bundled .claude/commands/ directory to the target project,
 * enabling AI-assisted development workflows when using Claude Code.
 *
 * Commands included:
 * - /raftstack/init-context - Analyze codebase and generate constitution
 * - /raftstack/shape - Scale-adaptive feature planning
 * - /raftstack/discover - Extract patterns into standards
 * - /raftstack/inject - Surface relevant standards and skills
 * - /raftstack/index - Maintain standards registry
 * - /raftstack/help - Get guidance on what to do next
 */
export async function generateClaudeCommands(
  targetDir: string
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  const packageCommandsDir = getPackageCommandsDir();
  const targetCommandsDir = join(targetDir, ".claude", "commands");

  // Check if source commands directory exists
  if (!existsSync(packageCommandsDir)) {
    // Commands not bundled (development mode or missing)
    console.warn(
      "Warning: Commands directory not found in package. Skipping commands generation."
    );
    return result;
  }

  // Ensure target .claude directory exists
  await ensureDir(join(targetDir, ".claude"));

  // Copy all commands
  await copyDirectory(packageCommandsDir, targetCommandsDir, result, targetDir);

  return result;
}
