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
  generateClaudeCommands,
  generateClaudeConfig,
  generateQuickReference,
  generateEslint,
  detectReact,
  detectNextJs,
  generateSharedConfigs,
  isMonorepo,
} from "../generators/index.js";
import {
  addPackageJsonConfig,
  mergeScripts,
  readPackageJson,
  writePackageJson,
  installPackages,
  RAFTSTACK_PACKAGES,
  REACT_ESLINT_PACKAGES,
  NEXTJS_ESLINT_PACKAGES,
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
 * Update package.json with required scripts and lint-staged config
 * (Dependencies are installed separately via CLI)
 */
async function updateProjectPackageJson(
  targetDir: string,
  config: RaftStackConfig
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
      // ESLint scripts (always added since we install ESLint)
      lint: "eslint .",
      "lint:fix": "eslint . --fix",
      // Prettier scripts (always added since we install Prettier)
      format: "prettier --write .",
      "format:check": "prettier --check .",
    };

    // Add typecheck script if TypeScript is detected
    if (config.usesTypeScript) {
      scripts.typecheck = "tsc --noEmit";
    }

    pkg = mergeScripts(pkg, scripts, false);

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

  // Detect frameworks for conditional dependencies
  const usesReact = await detectReact(targetDir);
  const usesNextJs = await detectNextJs(targetDir);

  // Install dependencies using CLI
  const installSpinner = p.spinner();
  let packagesToInstall = [...RAFTSTACK_PACKAGES];

  // Add framework-specific packages
  if (usesNextJs) {
    // Next.js includes React, so only add Next.js ESLint packages
    packagesToInstall = [...packagesToInstall, ...NEXTJS_ESLINT_PACKAGES];
  } else if (usesReact) {
    // Non-Next.js React projects need React ESLint packages
    packagesToInstall = [...packagesToInstall, ...REACT_ESLINT_PACKAGES];
  }

  installSpinner.start("Installing dependencies...");
  const installResult = await installPackages(
    config.packageManager,
    packagesToInstall,
    targetDir
  );

  let installFailed = false;
  if (installResult.success) {
    installSpinner.stop("Dependencies installed!");
  } else {
    installSpinner.stop("Failed to install dependencies");
    p.log.warn(
      pc.yellow(
        `Could not install dependencies automatically: ${installResult.error || "Unknown error"}`
      )
    );
    p.log.info(
      pc.dim(
        `You can install them manually with: ${config.packageManager.name} ${config.packageManager.addDev} ${packagesToInstall.join(" ")}`
      )
    );
    installFailed = true;
  }

  // Generate files with progress spinner
  const spinner = p.spinner();
  spinner.start("Generating configuration files...");

  const results: GeneratorResult[] = [];

  try {
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

    // Shared config packages for monorepos (ESLint + TypeScript configs)
    if (isMonorepo(config.projectType)) {
      results.push(await generateSharedConfigs(targetDir, config.projectType));
    }

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

    // Claude Code skills and commands for AI-assisted development
    results.push(await generateClaudeSkills(targetDir, {
      includeAsana: !!config.asanaBaseUrl
    }));
    results.push(await generateClaudeCommands(targetDir));
    results.push(await generateClaudeConfig(targetDir));

    // Update package.json (scripts and lint-staged config)
    results.push(await updateProjectPackageJson(targetDir, config));

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
  const nextSteps = installFailed
    ? [
        `${pc.cyan("1.")} Run ${pc.yellow(config.packageManager.install)} to install dependencies`,
        `${pc.cyan("2.")} Review the generated configuration files`,
        `${pc.cyan("3.")} Use ${pc.yellow(`${config.packageManager.run} commit`)} for interactive commits`,
        `${pc.cyan("4.")} Set up branch protection rules (see .github/BRANCH_PROTECTION_SETUP.md)`,
      ]
    : [
        `${pc.cyan("1.")} Review the generated configuration files`,
        `${pc.cyan("2.")} Use ${pc.yellow(`${config.packageManager.run} commit`)} for interactive commits`,
        `${pc.cyan("3.")} Set up branch protection rules (see .github/BRANCH_PROTECTION_SETUP.md)`,
      ];
  p.note(nextSteps.join("\n"), "Next Steps");

  p.outro(pc.green("RaftStack setup complete! Happy coding! 🚀"));
}
