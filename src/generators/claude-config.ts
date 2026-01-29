import { existsSync } from "node:fs";
import { readdir, copyFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { GeneratorResult } from "../types/config.js";
import { ensureDir, backupFile, writeFileSafe } from "../utils/file-system.js";

/**
 * Get the path to the .claude directory in the installed package
 */
function getPackageConfigDir(): string {
  // In ESM, we use import.meta.url to find the package location
  // tsup bundles everything into dist/cli.js, so we only need to go up 1 level
  const currentFilePath = fileURLToPath(import.meta.url);
  const packageRoot = join(dirname(currentFilePath), "..");
  return join(packageRoot, ".claude");
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
 * Generate Claude Code configuration files
 *
 * This creates:
 * - .claude/settings.json with default model configuration
 * - .claude/subagents/ directory with bundled subagent definitions
 */
export async function generateClaudeConfig(
  targetDir: string
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  const packageConfigDir = getPackageConfigDir();
  const targetClaudeDir = join(targetDir, ".claude");

  // Ensure target .claude directory exists
  await ensureDir(targetClaudeDir);

  // Generate settings.json
  const settingsContent = JSON.stringify({ model: "opusplan" }, null, 2) + "\n";
  const settingsResult = await writeFileSafe(
    join(targetClaudeDir, "settings.json"),
    settingsContent,
    { backup: true }
  );

  if (settingsResult.created) {
    result.created.push(".claude/settings.json");
    if (settingsResult.backedUp) {
      result.backedUp.push(settingsResult.backedUp);
    }
  }

  // Copy subagents directory if it exists
  const packageSubagentsDir = join(packageConfigDir, "subagents");
  const targetSubagentsDir = join(targetClaudeDir, "subagents");

  if (existsSync(packageSubagentsDir)) {
    await copyDirectory(packageSubagentsDir, targetSubagentsDir, result, targetDir);
  } else {
    // Subagents not bundled (development mode or missing)
    console.warn(
      "Warning: Subagents directory not found in package. Skipping subagents generation."
    );
  }

  return result;
}
