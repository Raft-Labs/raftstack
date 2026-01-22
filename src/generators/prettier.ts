import { join } from "node:path";
import type { GeneratorResult } from "../types/config.js";
import { fileExists, writeFileSafe } from "../utils/file-system.js";

/**
 * Get Prettier configuration (matching zero-to-one project pattern)
 */
function getPrettierConfig(): string {
  return (
    JSON.stringify(
      {
        semi: true,
        trailingComma: "es5",
        singleQuote: false,
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        arrowParens: "always",
        endOfLine: "lf",
      },
      null,
      2
    ) + "\n"
  );
}

/**
 * Get Prettier ignore file content (matching zero-to-one project pattern)
 */
function getPrettierIgnore(): string {
  return `node_modules
dist
build
.turbo
.next
*.lock
pnpm-lock.yaml
coverage
`;
}

/**
 * Check if Prettier is already configured
 */
function hasPrettierConfig(targetDir: string): boolean {
  const prettierFiles = [
    ".prettierrc",
    ".prettierrc.js",
    ".prettierrc.cjs",
    ".prettierrc.json",
    ".prettierrc.yaml",
    ".prettierrc.yml",
    ".prettierrc.toml",
    "prettier.config.js",
    "prettier.config.cjs",
    "prettier.config.mjs",
  ];

  return prettierFiles.some((file) => fileExists(join(targetDir, file)));
}

/**
 * Generate Prettier configuration
 */
export async function generatePrettier(
  targetDir: string
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  // Skip if Prettier is already configured
  if (hasPrettierConfig(targetDir)) {
    result.skipped.push(".prettierrc (already exists)");
    return result;
  }

  // Create .prettierrc
  const configPath = join(targetDir, ".prettierrc");
  const configResult = await writeFileSafe(configPath, getPrettierConfig(), {
    backup: true,
  });

  if (configResult.created) {
    result.created.push(".prettierrc");
    if (configResult.backedUp) {
      result.backedUp.push(configResult.backedUp);
    }
  }

  // Create .prettierignore
  const ignorePath = join(targetDir, ".prettierignore");
  const ignoreResult = await writeFileSafe(ignorePath, getPrettierIgnore(), {
    backup: true,
    overwrite: false, // Don't overwrite existing ignore file
  });

  if (ignoreResult.created) {
    result.created.push(".prettierignore");
    if (ignoreResult.backedUp) {
      result.backedUp.push(ignoreResult.backedUp);
    }
  } else {
    result.skipped.push(".prettierignore (already exists)");
  }

  return result;
}
