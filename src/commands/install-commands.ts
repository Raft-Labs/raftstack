import * as p from "@clack/prompts";
import pc from "picocolors";
import { generateClaudeCommands } from "../generators/claude-commands.js";
import { generateClaudeSkills } from "../generators/claude-skills.js";

/**
 * Run the install-commands command
 *
 * This standalone command updates Claude Code commands and skills
 * without running the full init process. Useful for:
 * - Getting the latest commands after updating RaftStack
 * - Adding commands to a project that already has other RaftStack config
 */
export async function runInstallCommands(
  targetDir: string = process.cwd()
): Promise<void> {
  p.intro(pc.cyan("RaftStack: Install Claude Code commands and skills"));

  const spinner = p.spinner();
  spinner.start("Installing Claude Code commands and skills...");

  try {
    // Generate commands
    const commandsResult = await generateClaudeCommands(targetDir);

    // Also update skills (they work together)
    const skillsResult = await generateClaudeSkills(targetDir);

    spinner.stop("Claude Code commands and skills installed!");

    // Combine results
    const created = [...commandsResult.created, ...skillsResult.created];
    const backedUp = [...commandsResult.backedUp, ...skillsResult.backedUp];

    // Show summary
    console.log();

    if (created.length > 0) {
      p.log.success(pc.green("Installed files:"));
      for (const file of created) {
        console.log(`  ${pc.dim("+")} ${file}`);
      }
    }

    if (backedUp.length > 0) {
      console.log();
      p.log.info(pc.dim("Backed up existing files:"));
      for (const file of backedUp) {
        console.log(`  ${pc.dim("→")} ${file}.backup`);
      }
    }

    // Show available commands
    console.log();
    p.note(
      [
        `${pc.cyan("/raftstack/init-context")} - Analyze codebase, generate constitution`,
        `${pc.cyan("/raftstack/shape")} - Plan features with adaptive depth`,
        `${pc.cyan("/raftstack/discover")} - Extract patterns into standards`,
        `${pc.cyan("/raftstack/inject")} - Surface relevant context for tasks`,
        `${pc.cyan("/raftstack/index")} - Maintain standards registry`,
      ].join("\n"),
      "Available Commands"
    );

    p.outro(pc.green("Ready to use! Try /raftstack/init-context to get started."));
  } catch (error) {
    spinner.stop("Error installing commands");
    p.log.error(
      pc.red(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    );
    process.exit(1);
  }
}
