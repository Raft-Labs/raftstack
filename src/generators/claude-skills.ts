import { existsSync } from "node:fs";
import { readdir, copyFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { GeneratorResult } from "../types/config.js";
import { ensureDir, backupFile } from "../utils/file-system.js";

/**
 * Get the path to the skills directory in the installed package
 */
function getPackageSkillsDir(): string {
  // In ESM, we use import.meta.url to find the package location
  const currentFilePath = fileURLToPath(import.meta.url);
  const packageRoot = join(dirname(currentFilePath), "..", "..");
  return join(packageRoot, ".claude", "skills");
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
 * Generate Claude Code skills by copying them to the target project
 *
 * This copies the bundled .claude/skills/ directory to the target project,
 * enabling AI-assisted code quality enforcement when using Claude Code.
 */
export async function generateClaudeSkills(
  targetDir: string
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  const packageSkillsDir = getPackageSkillsDir();
  const targetSkillsDir = join(targetDir, ".claude", "skills");

  // Check if source skills directory exists
  if (!existsSync(packageSkillsDir)) {
    // Skills not bundled (development mode or missing)
    console.warn(
      "Warning: Skills directory not found in package. Skipping skills generation."
    );
    return result;
  }

  // Ensure target .claude directory exists
  await ensureDir(join(targetDir, ".claude"));

  // Copy all skills
  await copyDirectory(packageSkillsDir, targetSkillsDir, result, targetDir);

  return result;
}