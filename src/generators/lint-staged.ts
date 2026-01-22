import type { GeneratorResult } from "../types/config.js";

/**
 * Lint-staged configuration type for package.json
 */
export type LintStagedConfig = Record<string, string | string[]>;

/**
 * Generate lint-staged configuration for package.json (matching zero-to-one pattern)
 *
 * This function returns a configuration object to be added to package.json
 * instead of creating a separate file.
 */
export function getLintStagedConfig(
  usesEslint: boolean,
  usesPrettier: boolean,
  usesTypeScript: boolean
): LintStagedConfig {
  const config: LintStagedConfig = {};

  // Determine which file patterns to lint
  const codePatterns: string[] = [];

  if (usesTypeScript) {
    codePatterns.push("ts", "mts", "cts", "tsx");
  }
  // Always include JavaScript patterns
  codePatterns.push("js", "mjs", "cjs", "jsx");

  // Build commands for code files
  const codeCommands: string[] = [];
  if (usesEslint) {
    codeCommands.push("eslint --fix");
  }
  if (usesPrettier) {
    codeCommands.push("prettier --write");
  }

  // Add code file pattern if we have any commands
  if (codeCommands.length > 0) {
    const pattern = `*.{${codePatterns.join(",")}}`;
    config[pattern] = codeCommands;
  }

  // Add non-code files for Prettier only
  if (usesPrettier) {
    config["*.{json,css,md}"] = ["prettier --write"];
  }

  return config;
}

/**
 * Generate lint-staged configuration
 *
 * Note: This generator doesn't create files - instead it returns a GeneratorResult
 * and the config should be merged into package.json by the init command.
 *
 * @deprecated Use getLintStagedConfig() instead and merge into package.json
 */
export async function generateLintStaged(
  _targetDir: string,
  _projectType: string,
  usesEslint: boolean,
  usesPrettier: boolean,
  usesTypeScript: boolean
): Promise<GeneratorResult & { config: LintStagedConfig }> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  const config = getLintStagedConfig(usesEslint, usesPrettier, usesTypeScript);

  // Note: The actual addition to package.json is handled by init.ts
  // This function now just returns the config

  return {
    ...result,
    config,
  };
}
