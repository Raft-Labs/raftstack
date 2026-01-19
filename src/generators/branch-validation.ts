import type { GeneratorResult } from "../types/config.js";
import {
  addPackageJsonConfig,
  readPackageJson,
  writePackageJson,
} from "../utils/package-json.js";

/**
 * Branch naming pattern configuration
 */
interface BranchValidationConfig {
  pattern: string;
  errorMsg: string;
}

/**
 * Get the default branch validation configuration
 */
function getBranchValidationConfig(): BranchValidationConfig {
  return {
    pattern:
      "^(main|master|develop|staging|production)$|^(feature|fix|hotfix|bugfix|release|chore|docs|refactor|test|ci)\\/[a-z0-9._-]+$",
    errorMsg:
      "Branch name must follow pattern: feature/*, fix/*, hotfix/*, bugfix/*, release/*, chore/*, docs/*, refactor/*, test/*, ci/* or be main/master/develop/staging/production",
  };
}

/**
 * Add validate-branch-name configuration to package.json
 */
export async function generateBranchValidation(
  targetDir: string
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  try {
    const pkg = await readPackageJson(targetDir);
    const config = getBranchValidationConfig();

    const updatedPkg = addPackageJsonConfig(
      pkg,
      "validate-branch-name",
      config,
      false // Don't overwrite if exists
    );

    // Check if we actually added something
    if (JSON.stringify(pkg) !== JSON.stringify(updatedPkg)) {
      await writePackageJson(updatedPkg, targetDir);
      result.modified.push("package.json (validate-branch-name)");
    } else {
      result.skipped.push("validate-branch-name config (already exists)");
    }
  } catch (error) {
    // If package.json doesn't exist or can't be read, skip
    result.skipped.push("validate-branch-name config (no package.json)");
  }

  return result;
}
