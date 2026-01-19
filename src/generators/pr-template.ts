import { join } from "node:path";
import type { GeneratorResult } from "../types/config.js";
import { ensureDir, writeFileSafe } from "../utils/file-system.js";

/**
 * Get the PR template content
 */
function getPRTemplate(hasAsana: boolean): string {
  const asanaSection = hasAsana
    ? `## Asana Task
<!-- Link to the Asana task -->
- [ ] https://app.asana.com/0/...

`
    : "";

  return `## Description
<!-- Provide a brief description of the changes in this PR -->

## Type of Change
<!-- Mark the appropriate option with an "x" -->
- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🔧 Configuration change
- [ ] ♻️ Refactoring (no functional changes)
- [ ] ✅ Test update

${asanaSection}## Changes Made
<!-- List the specific changes made in this PR -->
-

## Testing
<!-- Describe how you tested your changes -->
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Screenshots (if applicable)
<!-- Add screenshots to help explain your changes -->

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged and published

## Additional Notes
<!-- Add any additional information that reviewers should know -->
`;
}

/**
 * Generate GitHub PR template
 */
export async function generatePRTemplate(
  targetDir: string,
  hasAsana: boolean
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  const githubDir = join(targetDir, ".github");
  await ensureDir(githubDir);

  const templatePath = join(githubDir, "PULL_REQUEST_TEMPLATE.md");
  const writeResult = await writeFileSafe(
    templatePath,
    getPRTemplate(hasAsana),
    { backup: true }
  );

  if (writeResult.created) {
    result.created.push(".github/PULL_REQUEST_TEMPLATE.md");
    if (writeResult.backedUp) {
      result.backedUp.push(writeResult.backedUp);
    }
  }

  return result;
}
