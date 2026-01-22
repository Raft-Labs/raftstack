import * as p from "@clack/prompts";
import pc from "picocolors";
import type { GeneratorResult, RaftStackConfig } from "../types/config.js";
import { collectConfig } from "../prompts/index.js";
import {
  generateHuskyHooks,
  generateCommitlint,
  generateCzGit,
  getLintStagedConfig,
  generateBranchValidation,
  generatePRTemplate,
  generateGitHubWorkflows,
  generateCodeowners,
  generateAIReview,
  generateBranchProtectionDocs,
  generateContributing,
  generatePrettier,
  generateClaudeSkills,
  generateQuickReference,
  generateEslint,
  detectReact,
} from "../generators/index.js";
import {
  addPackageJsonConfig,
  mergeDevDependencies,
  mergeScripts,
  readPackageJson,
  writePackageJson,
  RAFTSTACK_DEV_DEPENDENCIES,
  REACT_ESLINT_DEPS,
} from "../utils/package-json.js";
import { isGitRepo } from "../utils/git.js";

/**
 * Merge generator results
 */
function mergeResults(results: GeneratorResult[]): GeneratorResult {
  return results.reduce(
    (acc, result) => ({
      created: [...acc.created, ...result.created],
      modified: [...acc.modified, ...result.modified],
      skipped: [...acc.skipped, ...result.skipped],
      backedUp: [...acc.backedUp, ...result.backedUp],
    }),
    { created: [], modified: [], skipped: [], backedUp: [] }
  );
}

/**
 * Update package.json with required scripts, dependencies, and lint-staged config
 */
async function updateProjectPackageJson(
  targetDir: string,
  config: RaftStackConfig,
  usesReact: boolean
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  try {
    let pkg = await readPackageJson(targetDir);

    // Add scripts
    const scripts: Record<string, string> = {
      prepare: "husky",
      commit: "czg",
    };
    pkg = mergeScripts(pkg, scripts, false);

    // Add core dev dependencies
    pkg = mergeDevDependencies(pkg, RAFTSTACK_DEV_DEPENDENCIES);

    // Add React ESLint deps if React is detected
    if (usesReact) {
      pkg = mergeDevDependencies(pkg, REACT_ESLINT_DEPS);
    }

    // Add lint-staged config to package.json (instead of separate file)
    // Always enable eslint and prettier since we're installing them
    const lintStagedConfig = getLintStagedConfig(
      true, // usesEslint - always true now since we install it
      true, // usesPrettier - always true now since we install it
      config.usesTypeScript
    );
    pkg = addPackageJsonConfig(pkg, "lint-staged", lintStagedConfig, true);

    await writePackageJson(pkg, targetDir);
    result.modified.push("package.json");
  } catch (error) {
    result.skipped.push("package.json (error updating)");
  }

  return result;
}

/**
 * Run the init command
 */
export async function runInit(targetDir: string = process.cwd()): Promise<void> {
  // Check if this is a git repository
  const isRepo = await isGitRepo(targetDir);
  if (!isRepo) {
    p.log.warn(
      pc.yellow(
        "This directory is not a git repository. Some features may not work correctly."
      )
    );
    const proceed = await p.confirm({
      message: "Continue anyway?",
      initialValue: false,
    });

    if (p.isCancel(proceed) || !proceed) {
      p.cancel("Setup cancelled.");
      process.exit(0);
    }
  }

  // Collect configuration from user
  const config = await collectConfig(targetDir);

  if (!config) {
    return;
  }

  // Generate files with progress spinner
  const spinner = p.spinner();
  spinner.start("Generating configuration files...");

  const results: GeneratorResult[] = [];

  try {
    // Detect React for conditional dependencies
    const usesReact = await detectReact(targetDir);

    // Core Git hooks and commit conventions
    results.push(
      await generateHuskyHooks(targetDir, config.projectType, config.packageManager)
    );
    results.push(await generateCommitlint(targetDir, config.asanaBaseUrl));
    results.push(await generateCzGit(targetDir, config.asanaBaseUrl));
    results.push(await generateBranchValidation(targetDir));

    // ESLint configuration (always generate since we install it)
    results.push(await generateEslint(targetDir, config.usesTypeScript, false));

    // Prettier (always generate since we install it)
    results.push(await generatePrettier(targetDir));

    // GitHub integration
    results.push(await generatePRTemplate(targetDir, !!config.asanaBaseUrl));
    results.push(
      await generateGitHubWorkflows(
        targetDir,
        config.projectType,
        config.usesTypeScript,
        true, // usesEslint - always true now
        config.packageManager
      )
    );
    results.push(await generateCodeowners(targetDir, config.codeowners));
    results.push(await generateAIReview(targetDir, config.aiReviewTool));
    results.push(await generateBranchProtectionDocs(targetDir));

    // Documentation
    results.push(
      await generateContributing(targetDir, !!config.asanaBaseUrl, config.packageManager)
    );
    results.push(await generateQuickReference(targetDir, config.packageManager));

    // Claude Code skills for AI-assisted development
    results.push(await generateClaudeSkills(targetDir));

    // Update package.json (includes lint-staged config, dependencies)
    results.push(await updateProjectPackageJson(targetDir, config, usesReact));

    spinner.stop("Configuration files generated!");
  } catch (error) {
    spinner.stop("Error generating files");
    p.log.error(
      pc.red(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    );
    process.exit(1);
  }

  // Merge all results
  const finalResult = mergeResults(results);

  // Show summary
  console.log();

  if (finalResult.created.length > 0) {
    p.log.success(pc.green("Created files:"));
    for (const file of finalResult.created) {
      console.log(`  ${pc.dim("+")} ${file}`);
    }
  }

  if (finalResult.modified.length > 0) {
    console.log();
    p.log.info(pc.blue("Modified files:"));
    for (const file of finalResult.modified) {
      console.log(`  ${pc.dim("~")} ${file}`);
    }
  }

  if (finalResult.skipped.length > 0) {
    console.log();
    p.log.warn(pc.yellow("Skipped (already exist):"));
    for (const file of finalResult.skipped) {
      console.log(`  ${pc.dim("-")} ${file}`);
    }
  }

  if (finalResult.backedUp.length > 0) {
    console.log();
    p.log.info(pc.dim("Backed up files:"));
    for (const file of finalResult.backedUp) {
      console.log(`  ${pc.dim("→")} ${file}`);
    }
  }

  // Show next steps
  console.log();
  p.note(
    [
      `${pc.cyan("1.")} Run ${pc.yellow(config.packageManager.install)} to install dependencies`,
      `${pc.cyan("2.")} Review the generated configuration files`,
      `${pc.cyan("3.")} Use ${pc.yellow(`${config.packageManager.run} commit`)} for interactive commits`,
      `${pc.cyan("4.")} Set up branch protection rules (see .github/BRANCH_PROTECTION_SETUP.md)`,
    ].join("\n"),
    "Next Steps"
  );

  p.outro(pc.green("RaftStack setup complete! Happy coding! 🚀"));
}
