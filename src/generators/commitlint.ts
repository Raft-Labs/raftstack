import { join } from "node:path";
import type { GeneratorResult } from "../types/config.js";
import { writeFileSafe } from "../utils/file-system.js";

/**
 * Generate combined commitlint + cz-git configuration
 *
 * Per cz-git docs, the prompt configuration is read directly from commitlint config.
 * This eliminates the need for a separate cz.config.js file.
 *
 * Uses ES module syntax (export default) for compatibility with
 * projects that have "type": "module" in package.json.
 *
 * Note: Asana task link uses level 1 (warning) not level 2 (error)
 * Commits without task links will show a warning but won't be blocked
 */
function getCommitlintConfig(asanaBaseUrl?: string): string {
  const asanaIssueSection = asanaBaseUrl
    ? `
    allowCustomIssuePrefix: true,
    issuePrefixes: [
      { value: 'asana', name: 'asana: Link to Asana task' },
      { value: 'closes', name: 'closes: Close an issue' },
      { value: 'fixes', name: 'fixes:  Fix an issue' },
    ],`
    : `
    allowCustomIssuePrefix: false,`;

  const asanaPluginSection = asanaBaseUrl
    ? `
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
              : 'Consider adding an Asana task link in the commit body or footer (e.g., Task: https://app.asana.com/0/...)',
          ];
        },
      },
    },
  ],`
    : "";

  const asanaRule = asanaBaseUrl
    ? `
    // Asana task link (warning only - won't block commits)
    'asana-task-link': [1, 'always'],`
    : "";

  return `/** @type {import('cz-git').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  // Parser preset to support emoji prefixes in commit messages
  parserPreset: {
    parserOpts: {
      headerPattern:
        /^(?:(?:\\p{Emoji_Presentation}|\\p{Emoji}\\uFE0F?)|:[a-z_]+:)?\\s*(\\w+)(?:\\(([^)]*)\\))?:\\s*(.+)$/u,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  // cz-git prompt configuration (read directly from commitlint config)
  prompt: {
    alias: {
      fd: 'docs: fix typos',
      ur: 'docs: update README',
    },
    messages: {
      type: "Select the type of change you're committing:",
      scope: 'Denote the scope of this change (optional):',
      customScope: 'Denote the scope of this change:',
      subject: 'Write a short, imperative description of the change:\\n',
      body: 'Provide a longer description of the change (optional). Use "|" to break new line:\\n',
      breaking: 'List any BREAKING CHANGES (optional). Use "|" to break new line:\\n',
      footerPrefixSelect: 'Select the ISSUES type of change (optional):',
      customFooterPrefix: 'Input ISSUES prefix:',
      footer: 'List any ISSUES affected by this change (optional). E.g.: #31, #34:\\n',
      confirmCommit: 'Are you sure you want to proceed with the commit above?',
    },
    types: [
      { value: 'feat', name: 'feat:     ✨ A new feature', emoji: ':sparkles:' },
      { value: 'fix', name: 'fix:      🐛 A bug fix', emoji: ':bug:' },
      { value: 'docs', name: 'docs:     📝 Documentation changes', emoji: ':memo:' },
      { value: 'style', name: 'style:    💄 Code style changes', emoji: ':lipstick:' },
      { value: 'refactor', name: 'refactor: ♻️  Code refactoring', emoji: ':recycle:' },
      { value: 'perf', name: 'perf:     ⚡️ Performance improvements', emoji: ':zap:' },
      { value: 'test', name: 'test:     ✅ Adding or updating tests', emoji: ':white_check_mark:' },
      { value: 'build', name: 'build:    📦 Build system changes', emoji: ':package:' },
      { value: 'ci', name: 'ci:       🎡 CI configuration changes', emoji: ':ferris_wheel:' },
      { value: 'chore', name: 'chore:    🔧 Other changes', emoji: ':wrench:' },
      { value: 'revert', name: 'revert:   ⏪ Reverting changes', emoji: ':rewind:' },
    ],
    useEmoji: true,
    emojiAlign: 'left',
    useAI: false,
    scopes: [],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,${asanaIssueSection}
    allowEmptyIssuePrefix: true,
  },
  rules: {
    // Type must be one of the conventional types
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    // Subject should not be empty
    'subject-empty': [2, 'never'],
    // Type should not be empty
    'type-empty': [2, 'never'],
    // Subject should be lowercase
    'subject-case': [2, 'always', 'lower-case'],
    // Header max length
    'header-max-length': [2, 'always', 100],${asanaRule}
  },${asanaPluginSection}
};
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
