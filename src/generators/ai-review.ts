import { join } from "node:path";
import type { AIReviewTool, GeneratorResult } from "../types/config.js";
import { ensureDir, writeFileSafe } from "../utils/file-system.js";

/**
 * Get CodeRabbit configuration
 */
function getCodeRabbitConfig(): string {
  return `# CodeRabbit Configuration
# Learn more: https://docs.coderabbit.ai/guides/configure-coderabbit

language: "en-US"

reviews:
  request_changes_workflow: true
  high_level_summary: true
  poem: false
  review_status: true
  collapse_walkthrough: false
  auto_review:
    enabled: true
    drafts: false

chat:
  auto_reply: true
`;
}

/**
 * Get GitHub Copilot PR review workflow
 */
function getCopilotWorkflow(): string {
  return `name: Copilot Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    name: Copilot Review
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # Note: GitHub Copilot code review is automatically enabled
      # when you have Copilot Enterprise. This workflow is a placeholder
      # for any additional AI review configuration you might need.

      - name: Add review comment
        uses: actions/github-script@v7
        with:
          script: |
            // GitHub Copilot will automatically review PRs if enabled
            // This is a placeholder for additional review logic
            console.log('Copilot review enabled for this repository');
`;
}

/**
 * Generate AI review configuration
 */
export async function generateAIReview(
  targetDir: string,
  tool: AIReviewTool
): Promise<GeneratorResult> {
  const result: GeneratorResult = {
    created: [],
    modified: [],
    skipped: [],
    backedUp: [],
  };

  if (tool === "none") {
    return result;
  }

  if (tool === "coderabbit") {
    const configPath = join(targetDir, ".coderabbit.yaml");
    const writeResult = await writeFileSafe(configPath, getCodeRabbitConfig(), {
      backup: true,
    });

    if (writeResult.created) {
      result.created.push(".coderabbit.yaml");
      if (writeResult.backedUp) {
        result.backedUp.push(writeResult.backedUp);
      }
    }
  }

  if (tool === "copilot") {
    const workflowsDir = join(targetDir, ".github", "workflows");
    await ensureDir(workflowsDir);

    const workflowPath = join(workflowsDir, "copilot-review.yml");
    const writeResult = await writeFileSafe(workflowPath, getCopilotWorkflow(), {
      backup: true,
    });

    if (writeResult.created) {
      result.created.push(".github/workflows/copilot-review.yml");
      if (writeResult.backedUp) {
        result.backedUp.push(writeResult.backedUp);
      }
    }
  }

  return result;
}
