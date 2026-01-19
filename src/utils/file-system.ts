import { existsSync } from "node:fs";
import {
  mkdir,
  readFile,
  writeFile,
  copyFile,
  chmod,
} from "node:fs/promises";
import { dirname, join } from "node:path";

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDir(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

/**
 * Backup a file if it exists
 * Returns the backup path if a backup was created, null otherwise
 */
export async function backupFile(filePath: string): Promise<string | null> {
  if (!existsSync(filePath)) {
    return null;
  }

  const backupPath = `${filePath}.backup`;
  await copyFile(filePath, backupPath);
  return backupPath;
}

/**
 * Write a file safely with optional backup
 */
export async function writeFileSafe(
  filePath: string,
  content: string,
  options: {
    backup?: boolean;
    overwrite?: boolean;
    executable?: boolean;
  } = {}
): Promise<{ created: boolean; backedUp: string | null }> {
  const { backup = true, overwrite = true, executable = false } = options;

  // Check if file exists
  const exists = existsSync(filePath);

  // If file exists and we shouldn't overwrite, skip
  if (exists && !overwrite) {
    return { created: false, backedUp: null };
  }

  // Backup existing file if requested
  let backedUp: string | null = null;
  if (exists && backup) {
    backedUp = await backupFile(filePath);
  }

  // Ensure directory exists
  await ensureDir(dirname(filePath));

  // Write the file
  await writeFile(filePath, content, "utf-8");

  // Make executable if requested
  if (executable) {
    await chmod(filePath, 0o755);
  }

  return { created: true, backedUp };
}

/**
 * Read a file, returning null if it doesn't exist
 */
export async function readFileSafe(filePath: string): Promise<string | null> {
  if (!existsSync(filePath)) {
    return null;
  }
  return readFile(filePath, "utf-8");
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * Get relative path from target directory
 */
export function getRelativePath(
  filePath: string,
  targetDir: string = process.cwd()
): string {
  if (filePath.startsWith(targetDir)) {
    return filePath.slice(targetDir.length + 1);
  }
  return filePath;
}

/**
 * Join paths and normalize
 */
export function joinPath(...paths: string[]): string {
  return join(...paths);
}
