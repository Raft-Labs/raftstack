import * as p from "@clack/prompts";
import pc from "picocolors";
import type {
  AIReviewTool,
  DetectionResult,
  ProjectType,
  RaftStackConfig,
} from "../types/config.js";
import {
  detectProjectType,
  getProjectTypeDescription,
  hasTypeScript,
  hasEslint,
  hasPrettier,
} from "../utils/detect-project.js";

/**
 * Show welcome banner
 */
export function showWelcome(): void {
  console.log();
  p.intro(pc.bgCyan(pc.black(" RaftStack ")));
  console.log(
    pc.dim("  Setting up Git hooks, commit conventions, and GitHub integration\n")
  );
}

/**
 * Prompt for project type confirmation
 */
export async function promptProjectType(
  detection: DetectionResult
): Promise<ProjectType> {
  const description = getProjectTypeDescription(detection.type);
  const confidenceText =
    detection.confidence === "high"
      ? pc.green("high confidence")
      : detection.confidence === "medium"
        ? pc.yellow("medium confidence")
        : pc.red("low confidence");

  const confirmed = await p.confirm({
    message: `Detected ${pc.cyan(description)} (${confidenceText}). Is this correct?`,
    initialValue: true,
  });

  if (p.isCancel(confirmed)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  if (confirmed) {
    return detection.type;
  }

  const selected = await p.select({
    message: "Select your project type:",
    options: [
      { value: "nx", label: "NX Monorepo" },
      { value: "turbo", label: "Turborepo" },
      { value: "pnpm-workspace", label: "pnpm Workspace" },
      { value: "single", label: "Single Package" },
    ],
  });

  if (p.isCancel(selected)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  return selected as ProjectType;
}

/**
 * Prompt for Asana configuration
 */
export async function promptAsanaConfig(): Promise<string | undefined> {
  const useAsana = await p.confirm({
    message: "Do you want to link commits to Asana tasks?",
    initialValue: true,
  });

  if (p.isCancel(useAsana)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  if (!useAsana) {
    return undefined;
  }

  const baseUrl = await p.text({
    message: "Enter your Asana workspace URL:",
    placeholder: "https://app.asana.com/0/workspace-id",
    validate: (value) => {
      if (!value) return "URL is required";
      if (!value.startsWith("https://app.asana.com/")) {
        return "URL must start with https://app.asana.com/";
      }
      return undefined;
    },
  });

  if (p.isCancel(baseUrl)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  return baseUrl;
}

/**
 * Prompt for AI review tool selection
 */
export async function promptAIReview(): Promise<AIReviewTool> {
  const selected = await p.select({
    message: "Select an AI code review tool (optional):",
    options: [
      {
        value: "none",
        label: "None",
        hint: "Skip AI review setup",
      },
      {
        value: "coderabbit",
        label: "CodeRabbit",
        hint: "AI-powered code review",
      },
      {
        value: "copilot",
        label: "GitHub Copilot",
        hint: "GitHub's AI code review",
      },
    ],
  });

  if (p.isCancel(selected)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  return selected as AIReviewTool;
}

/**
 * Prompt for CODEOWNERS
 */
export async function promptCodeowners(): Promise<string[]> {
  const addOwners = await p.confirm({
    message: "Do you want to set up CODEOWNERS for automatic PR reviewers?",
    initialValue: true,
  });

  if (p.isCancel(addOwners)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  if (!addOwners) {
    return [];
  }

  const owners = await p.text({
    message: "Enter GitHub usernames (comma-separated):",
    placeholder: "@username1, @username2",
    validate: (value) => {
      if (!value.trim()) return "At least one username is required";
      return undefined;
    },
  });

  if (p.isCancel(owners)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  return owners
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean)
    .map((u) => (u.startsWith("@") ? u : `@${u}`));
}

/**
 * Show summary before generating files
 */
export async function promptConfirmation(
  config: RaftStackConfig
): Promise<boolean> {
  console.log();
  p.note(
    [
      `${pc.cyan("Project Type:")} ${getProjectTypeDescription(config.projectType)}`,
      `${pc.cyan("TypeScript:")} ${config.usesTypeScript ? "Yes" : "No"}`,
      `${pc.cyan("ESLint:")} ${config.usesEslint ? "Yes" : "No"}`,
      `${pc.cyan("Prettier:")} ${config.usesPrettier ? "Yes" : "No"}`,
      `${pc.cyan("Asana Integration:")} ${config.asanaBaseUrl ? "Yes" : "No"}`,
      `${pc.cyan("AI Review:")} ${config.aiReviewTool === "none" ? "None" : config.aiReviewTool}`,
      `${pc.cyan("CODEOWNERS:")} ${config.codeowners.length > 0 ? config.codeowners.join(", ") : "None"}`,
    ].join("\n"),
    "Configuration Summary"
  );

  const confirmed = await p.confirm({
    message: "Generate configuration files?",
    initialValue: true,
  });

  if (p.isCancel(confirmed)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  return confirmed;
}

/**
 * Run full prompt flow and collect configuration
 */
export async function collectConfig(
  targetDir: string = process.cwd()
): Promise<RaftStackConfig | null> {
  showWelcome();

  // Detect project type
  const detection = await detectProjectType(targetDir);
  const projectType = await promptProjectType(detection);

  // Detect existing tooling
  const usesTypeScript = await hasTypeScript(targetDir);
  const usesEslint = await hasEslint(targetDir);
  const usesPrettier = await hasPrettier(targetDir);

  // Collect user preferences
  const asanaBaseUrl = await promptAsanaConfig();
  const aiReviewTool = await promptAIReview();
  const codeowners = await promptCodeowners();

  const config: RaftStackConfig = {
    projectType,
    asanaBaseUrl,
    aiReviewTool,
    codeowners,
    usesTypeScript,
    usesEslint,
    usesPrettier,
  };

  // Confirm before proceeding
  const confirmed = await promptConfirmation(config);

  if (!confirmed) {
    p.cancel("Setup cancelled.");
    return null;
  }

  return config;
}
