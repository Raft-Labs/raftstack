import * as p from "@clack/prompts";
import pc from "picocolors";
import { execa } from "execa";
import { isGhCliAvailable, getGitHubRepoInfo } from "../utils/git.js";

/**
 * Merge strategy options
 */
export type MergeStrategy = "rebase" | "squash" | "merge";

/**
 * Branch protection settings
 */
export interface BranchProtectionSettings {
  branch: string;
  requiredReviews: number;
  dismissStaleReviews: boolean;
  requireCodeOwners: boolean;
  requireStatusChecks: boolean;
  statusChecks: string[];
  requireConversationResolution: boolean;
  restrictPushes: boolean;
  blockForcePushes: boolean;
  blockDeletions: boolean;
}

/**
 * Repository settings for merge strategies
 */
export interface RepositorySettings {
  allowMergeCommit: boolean;
  allowSquashMerge: boolean;
  allowRebaseMerge: boolean;
  deleteBranchOnMerge: boolean;
}

/**
 * Default branch protection settings
 */
function getDefaultSettings(branch: string): BranchProtectionSettings {
  return {
    branch,
    requiredReviews: 1,
    dismissStaleReviews: true,
    requireCodeOwners: true,
    requireStatusChecks: true,
    statusChecks: ["check"],
    requireConversationResolution: true,
    restrictPushes: false,
    blockForcePushes: true,
    blockDeletions: true,
  };
}

/**
 * Get repository settings based on merge strategy
 */
function getMergeStrategySettings(strategy: MergeStrategy): RepositorySettings {
  switch (strategy) {
    case "rebase":
      return {
        allowMergeCommit: false,
        allowSquashMerge: false,
        allowRebaseMerge: true,
        deleteBranchOnMerge: true,
      };
    case "squash":
      return {
        allowMergeCommit: false,
        allowSquashMerge: true,
        allowRebaseMerge: false,
        deleteBranchOnMerge: true,
      };
    case "merge":
      return {
        allowMergeCommit: true,
        allowSquashMerge: false,
        allowRebaseMerge: false,
        deleteBranchOnMerge: true,
      };
  }
}

/**
 * Apply branch protection using gh CLI
 */
async function applyBranchProtection(
  owner: string,
  repo: string,
  settings: BranchProtectionSettings
): Promise<void> {
  const args = [
    "api",
    "-X",
    "PUT",
    `/repos/${owner}/${repo}/branches/${settings.branch}/protection`,
    "-f",
    `required_pull_request_reviews[required_approving_review_count]=${settings.requiredReviews}`,
    "-f",
    `required_pull_request_reviews[dismiss_stale_reviews]=${settings.dismissStaleReviews}`,
    "-f",
    `required_pull_request_reviews[require_code_owner_reviews]=${settings.requireCodeOwners}`,
    "-f",
    `required_status_checks[strict]=true`,
    "-f",
    `enforce_admins=true`,
    "-f",
    `allow_force_pushes=${!settings.blockForcePushes}`,
    "-f",
    `allow_deletions=${!settings.blockDeletions}`,
    "-f",
    `required_conversation_resolution=${settings.requireConversationResolution}`,
  ];

  // Add status checks
  if (settings.requireStatusChecks && settings.statusChecks.length > 0) {
    for (const check of settings.statusChecks) {
      args.push("-f", `required_status_checks[contexts][]=${check}`);
    }
  } else {
    args.push("-F", "required_status_checks=null");
  }

  // Add restrictions (null means no restrictions beyond PRs)
  args.push("-F", "restrictions=null");

  await execa("gh", args);
}

/**
 * Apply repository merge settings using gh CLI
 */
async function applyMergeStrategy(
  owner: string,
  repo: string,
  settings: RepositorySettings
): Promise<void> {
  const args = [
    "api",
    "-X",
    "PATCH",
    `/repos/${owner}/${repo}`,
    "-f",
    `allow_merge_commit=${settings.allowMergeCommit}`,
    "-f",
    `allow_squash_merge=${settings.allowSquashMerge}`,
    "-f",
    `allow_rebase_merge=${settings.allowRebaseMerge}`,
    "-f",
    `delete_branch_on_merge=${settings.deleteBranchOnMerge}`,
  ];

  await execa("gh", args);
}

/**
 * Run the setup-protection command
 */
export async function runSetupProtection(
  targetDir: string = process.cwd()
): Promise<void> {
  console.log();
  p.intro(pc.bgCyan(pc.black(" Branch Protection Setup ")));

  // Check gh CLI
  const spinner = p.spinner();
  spinner.start("Checking GitHub CLI...");

  const ghAvailable = await isGhCliAvailable();

  if (!ghAvailable) {
    spinner.stop("GitHub CLI not found or not authenticated");
    console.log();
    p.log.error(pc.red("The GitHub CLI (gh) is required for this command."));
    p.log.info("Install it from: https://cli.github.com/");
    p.log.info("Then run: gh auth login");
    console.log();
    p.log.info(
      pc.dim(
        "Alternatively, see .github/BRANCH_PROTECTION_SETUP.md for manual instructions."
      )
    );
    process.exit(1);
  }

  spinner.stop("GitHub CLI ready");

  // Get repo info
  spinner.start("Getting repository info...");
  const repoInfo = await getGitHubRepoInfo(targetDir);

  if (!repoInfo) {
    spinner.stop("Could not determine repository");
    p.log.error(
      pc.red("Could not determine the GitHub repository for this directory.")
    );
    p.log.info("Make sure you're in a git repository with a GitHub remote.");
    process.exit(1);
  }

  spinner.stop(`Repository: ${pc.cyan(`${repoInfo.owner}/${repoInfo.repo}`)}`);

  // Ask which branches to protect
  const branches = await p.multiselect({
    message: "Which branches need protection?",
    options: [
      { value: "main", label: "main", hint: "recommended" },
      { value: "master", label: "master", hint: "legacy default" },
      { value: "staging", label: "staging", hint: "staging environment" },
      { value: "production", label: "production", hint: "production environment" },
      { value: "development", label: "development", hint: "development branch" },
      { value: "develop", label: "develop", hint: "alternative dev branch" },
    ],
    required: true,
    initialValues: ["main"],
  });

  if (p.isCancel(branches)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  // Ask for merge strategy
  const mergeStrategy = await p.select({
    message: "Default merge strategy for PRs?",
    options: [
      {
        value: "rebase",
        label: "Rebase merge",
        hint: "recommended - clean linear history",
      },
      {
        value: "squash",
        label: "Squash merge",
        hint: "single commit per PR",
      },
      {
        value: "merge",
        label: "Merge commit",
        hint: "preserve all commits with merge commit",
      },
    ],
    initialValue: "rebase",
  });

  if (p.isCancel(mergeStrategy)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  // Ask for number of required reviews
  const reviews = await p.text({
    message: "How many approving reviews are required?",
    placeholder: "1",
    initialValue: "1",
    validate: (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0 || num > 6) {
        return "Must be a number between 0 and 6";
      }
      return undefined;
    },
  });

  if (p.isCancel(reviews)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  const requiredReviews = parseInt(reviews, 10);

  // Confirm settings
  const mergeStrategyLabels: Record<MergeStrategy, string> = {
    rebase: "Rebase merge",
    squash: "Squash merge",
    merge: "Merge commit",
  };

  console.log();
  p.note(
    [
      `${pc.cyan("Repository:")} ${repoInfo.owner}/${repoInfo.repo}`,
      `${pc.cyan("Protected branches:")} ${(branches as string[]).join(", ")}`,
      `${pc.cyan("Merge strategy:")} ${mergeStrategyLabels[mergeStrategy as MergeStrategy]}`,
      `${pc.cyan("Required reviews:")} ${requiredReviews}`,
      `${pc.cyan("Dismiss stale reviews:")} Yes`,
      `${pc.cyan("Require code owners:")} Yes`,
      `${pc.cyan("Require status checks:")} Yes`,
      `${pc.cyan("Block force pushes:")} Yes`,
      `${pc.cyan("Block deletions:")} Yes`,
      `${pc.cyan("Delete branch on merge:")} Yes`,
    ].join("\n"),
    "Branch Protection Settings"
  );

  const confirmed = await p.confirm({
    message: "Apply these branch protection rules?",
    initialValue: true,
  });

  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  // Apply merge strategy settings first
  spinner.start("Configuring merge strategy...");

  try {
    const repoSettings = getMergeStrategySettings(mergeStrategy as MergeStrategy);
    await applyMergeStrategy(repoInfo.owner, repoInfo.repo, repoSettings);
    spinner.stop("Merge strategy configured!");
  } catch (error) {
    spinner.stop("Failed to configure merge strategy");
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    p.log.warn(pc.yellow(`Warning: Could not set merge strategy: ${errorMsg}`));
    p.log.info(pc.dim("Continuing with branch protection..."));
  }

  // Apply branch protection for each branch
  const protectedBranches: string[] = [];
  const failedBranches: string[] = [];

  for (const branch of branches as string[]) {
    spinner.start(`Protecting branch: ${branch}...`);

    try {
      const settings = getDefaultSettings(branch);
      settings.requiredReviews = requiredReviews;

      await applyBranchProtection(repoInfo.owner, repoInfo.repo, settings);
      protectedBranches.push(branch);
      spinner.stop(`Protected: ${pc.green(branch)}`);
    } catch (error) {
      failedBranches.push(branch);
      spinner.stop(`Failed: ${pc.red(branch)}`);

      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      p.log.warn(
        pc.yellow(
          `Could not protect ${branch}: ${errorMsg.includes("Branch not found") ? "branch does not exist" : errorMsg}`
        )
      );
    }
  }

  // Show summary
  console.log();

  if (protectedBranches.length > 0) {
    p.log.success(
      pc.green(`Branch protection enabled for: ${pc.cyan(protectedBranches.join(", "))}`)
    );
  }

  if (failedBranches.length > 0) {
    p.log.warn(
      pc.yellow(
        `Could not protect: ${pc.red(failedBranches.join(", "))} (branches may not exist yet)`
      )
    );
    p.log.info(pc.dim("Create these branches first, then run this command again."));
  }

  if (protectedBranches.length > 0) {
    p.outro(pc.green("Setup complete!"));
  } else {
    p.outro(pc.yellow("No branches were protected."));
    process.exit(1);
  }
}
