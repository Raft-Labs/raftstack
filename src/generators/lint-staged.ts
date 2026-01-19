import { join } from "node:path";
import type { GeneratorResult, ProjectType } from "../types/config.js";
import { writeFileSafe } from "../utils/file-system.js";

/**
 * Generate lint-staged configuration based on project type
 */
function getLintStagedConfig(
  projectType: ProjectType,
  usesEslint: boolean,
  usesPrettier: boolean,
  usesTypeScript: boolean
): string {
  const rules: Record<string, string | string[]> = {};

  // TypeScript/JavaScript files
  if (usesTypeScript) {
    const tsCommands: string[] = [];
    if (usesEslint) {
      tsCommands.push("eslint --fix");
    }
    if (usesPrettier) {
      tsCommands.push("prettier --write");
    }
    if (tsCommands.length > 0) {
      rules["*.{ts,tsx}"] = tsCommands;
    }
  }

  // JavaScript files
  const jsCommands: string[] = [];
  if (usesEslint) {
    jsCommands.push("eslint --fix");
  }
  if (usesPrettier) {
    jsCommands.push("prettier --write");
  }
  if (jsCommands.length > 0) {
    rules["*.{js,jsx,mjs,cjs}"] = jsCommands;
  }

  // JSON, MD, YAML files (Prettier only)
  if (usesPrettier) {
    rules["*.{json,md,yaml,yml}"] = "prettier --write";
  }

  // CSS/SCSS files
  if (usesPrettier) {
    rules["*.{css,scss,less}"] = "prettier --write";
  }

  // NX-specific configuration
  if (projectType === "nx") {
    return `// @ts-check

/**
 * @type {import('lint-staged').Config}
 */
module.exports = {
${Object.entries(rules)
  .map(([pattern, commands]) => {
    const cmdStr = Array.isArray(commands)
      ? JSON.stringify(commands)
      : JSON.stringify([commands]);
    return `  '${pattern}': ${cmdStr},`;
  })
  .join("\n")}
};
`;
  }

  // Standard configuration
  return `// @ts-check

/**
 * @type {import('lint-staged').Config}
 */
module.exports = {
${Object.entries(rules)
  .map(([pattern, commands]) => {
    const cmdStr = Array.isArray(commands)
      ? JSON.stringify(commands)
      : JSON.stringify([commands]);
    return `  '${pattern}': ${cmdStr},`;
  })
  .join("\n")}
};
`;
}

/**
 * Generate lint-staged configuration file
 */
export async function generateLintStaged(
  targetDir: string,
  projectType: ProjectType,
  usesEslint: boolean,
  usesPrettier: boolean,
  usesTypeScript: boolean
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  const configPath = join(targetDir, ".lintstagedrc.js");
  const writeResult = await writeFileSafe(
    configPath,
    getLintStagedConfig(projectType, usesEslint, usesPrettier, usesTypeScript),
    { backup: true }
  );

  if (writeResult.created) {
    result.created.push(".lintstagedrc.js");
    if (writeResult.backedUp) {
      result.backedUp.push(writeResult.backedUp);
    }
  }

  return result;
}
