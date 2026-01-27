import { join } from "node:path";
import type { GeneratorResult } from "../types/config.js";
import { writeFileSafe } from "../utils/file-system.js";

/**
 * Generate cz-git configuration file
 *
 * Only generates .czrc pointing to cz-git.
 * The prompt configuration is now read directly from commitlint.config.js
 * per cz-git documentation: https://cz-git.qbb.sh/config/
 */
export async function generateCzGit(
  targetDir: string,
  _asanaBaseUrl?: string
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  const configPath = join(targetDir, ".czrc");
  const writeResult = await writeFileSafe(
    configPath,
    JSON.stringify({ path: "node_modules/cz-git" }, null, 2) + "\n",
    { backup: true }
  );

  if (writeResult.created) {
    result.created.push(".czrc");
    if (writeResult.backedUp) {
      result.backedUp.push(writeResult.backedUp);
    }
  }

  return result;
}
