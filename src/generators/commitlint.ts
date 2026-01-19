import { join } from "node:path";
import type { GeneratorResult } from "../types/config.js";
import { writeFileSafe } from "../utils/file-system.js";

/**
 * Generate commitlint configuration
 * Note: Asana task link uses level 1 (warning) not level 2 (error)
 * Commits without task links will show a warning but won't be blocked
 */
function getCommitlintConfig(asanaBaseUrl?: string): string {
  const baseConfig = `// @ts-check

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of the conventional types
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'build',    // Build system changes
        'ci',       // CI configuration changes
        'chore',    // Other changes (maintenance, etc.)
        'revert',   // Reverting changes
      ],
    ],
    // Subject should not be empty
    'subject-empty': [2, 'never'],
    // Type should not be empty
    'type-empty': [2, 'never'],
    // Subject should be lowercase
    'subject-case': [2, 'always', 'lower-case'],
    // Header max length
    'header-max-length': [2, 'always', 100],
  },`;

  if (asanaBaseUrl) {
    // Add Asana task link validation as a WARNING (level 1), not error (level 2)
    return `${baseConfig}
  plugins: [
    {
      rules: {
        'asana-task-link': ({ body, footer }) => {
          const fullMessage = [body, footer].filter(Boolean).join('\\n');
          const asanaPattern = /https:\\/\\/app\\.asana\\.com\\/\\d+\\/\\d+\\/\\d+/;
          const hasAsanaLink = asanaPattern.test(fullMessage);
          return [
            hasAsanaLink,
            hasAsanaLink
              ? null
              : 'Consider adding an Asana task link in the commit body or footer',
          ];
        },
      },
    },
  ],
  // Custom rules - level 1 means WARNING (shows message but doesn't block commit)
  // Change to level 2 if you want to BLOCK commits without Asana links
  // 'asana-task-link': [1, 'always'],
};

module.exports = config;
`;
  }

  return `${baseConfig}
};

module.exports = config;
`;
}

/**
 * Generate commitlint configuration file
 */
export async function generateCommitlint(
  targetDir: string,
  asanaBaseUrl?: string
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  const configPath = join(targetDir, "commitlint.config.js");
  const writeResult = await writeFileSafe(
    configPath,
    getCommitlintConfig(asanaBaseUrl),
    { backup: true }
  );

  if (writeResult.created) {
    result.created.push("commitlint.config.js");
    if (writeResult.backedUp) {
      result.backedUp.push(writeResult.backedUp);
    }
  }

  return result;
}
