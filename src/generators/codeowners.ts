import { join } from "node:path";
import type { GeneratorResult } from "../types/config.js";
import { ensureDir, writeFileSafe } from "../utils/file-system.js";

/**
 * Get the CODEOWNERS content
 */
function getCodeownersContent(owners: string[]): string {
  if (owners.length === 0) {
    return `# CODEOWNERS file
# Learn about CODEOWNERS: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

# Default owners for everything in the repo
# Uncomment and modify the line below to set default owners
# * @owner1 @owner2
`;
  }

  const ownersList = owners.join(" ");

  return `# CODEOWNERS file
# Learn about CODEOWNERS: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners

# Default owners for everything in the repo
* ${ownersList}

# You can also specify owners for specific paths:
# /docs/ @docs-team
# /src/api/ @backend-team
# /src/ui/ @frontend-team
# *.ts @typescript-team
`;
}

/**
 * Generate CODEOWNERS file
 */
export async function generateCodeowners(
  targetDir: string,
  owners: string[]
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  const githubDir = join(targetDir, ".github");
  await ensureDir(githubDir);

  const codeownersPath = join(githubDir, "CODEOWNERS");
  const writeResult = await writeFileSafe(
    codeownersPath,
    getCodeownersContent(owners),
    { backup: true }
  );

  if (writeResult.created) {
    result.created.push(".github/CODEOWNERS");
    if (writeResult.backedUp) {
      result.backedUp.push(writeResult.backedUp);
    }
  }

  return result;
}
