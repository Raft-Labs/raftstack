import * as p from "@clack/prompts";
import pc from "picocolors";
import { execa } from "execa";
import { isGhCliAvailable, getGitHubRepoInfo } from "../utils/git.js";

/**
 * Branch protection settings
 */
interface BranchProtectionSettings {
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
 * Default branch protection settings
 */
function getDefaultSettings(): BranchProtectionSettings {
  return {
    branch: "main",
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

  // Get default settings
  const settings = getDefaultSettings();

  // Ask for branch name
  const branch = await p.text({
    message: "Which branch do you want to protect?",
    placeholder: "main",
    initialValue: "main",
    validate: (value) => {
      if (!value.trim()) return "Branch name is required";
      return undefined;
    },
  });

  if (p.isCancel(branch)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  settings.branch = branch;

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

  settings.requiredReviews = parseInt(reviews, 10);

  // Confirm settings
  console.log();
  p.note(
    [
      `${pc.cyan("Repository:")} ${repoInfo.owner}/${repoInfo.repo}`,
      `${pc.cyan("Branch:")} ${settings.branch}`,
      `${pc.cyan("Required reviews:")} ${settings.requiredReviews}`,
      `${pc.cyan("Dismiss stale reviews:")} Yes`,
      `${pc.cyan("Require code owners:")} Yes`,
      `${pc.cyan("Require status checks:")} Yes (check)`,
      `${pc.cyan("Block force pushes:")} Yes`,
      `${pc.cyan("Block deletions:")} Yes`,
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

  // Apply settings
  spinner.start("Applying branch protection rules...");

  try {
    await applyBranchProtection(repoInfo.owner, repoInfo.repo, settings);
    spinner.stop("Branch protection rules applied!");

    console.log();
    p.log.success(
      pc.green(`Branch protection enabled for ${pc.cyan(settings.branch)}`)
    );

    p.outro(pc.green("Setup complete!"));
  } catch (error) {
    spinner.stop("Failed to apply branch protection");

    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    p.log.error(pc.red(`Error: ${errorMsg}`));

    console.log();
    p.log.info(
      pc.dim(
        "You may need admin permissions on the repository, or the branch may not exist yet."
      )
    );
    p.log.info(
      pc.dim("See .github/BRANCH_PROTECTION_SETUP.md for manual instructions.")
    );

    process.exit(1);
  }
}
