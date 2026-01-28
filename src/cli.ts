import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runSetupProtection } from "./commands/setup-protection.js";
import { runMetrics } from "./commands/metrics.js";
import { runInstallCommands } from "./commands/install-commands.js";
import pkg from "../package.json" assert { type: "json" };

const program = new Command();

program
  .name("raftstack")
  .description(
    "CLI tool for setting up Git hooks, commit conventions, and GitHub integration"
  )
  .version(pkg.version);

program
  .command("init")
  .description("Initialize RaftStack configuration in your project")
  .action(async () => {
    await runInit(process.cwd());
  });

program
  .command("setup-protection")
  .description("Configure GitHub branch protection rules via API")
  .action(async () => {
    await runSetupProtection(process.cwd());
  });

program
  .command("metrics")
  .description("Analyze repository compliance with RaftStack conventions")
  .option("--git", "Only show Git metrics (commits, branches, authors)")
  .option("--code", "Only show codebase compliance metrics")
  .option("--ci", "CI mode: exit 1 if below threshold")
  .option(
    "--threshold <n>",
    "Minimum compliance percentage (default: 70)",
    "70"
  )
  .option("--days <n>", "Time period in days (default: 30 in CI mode)")
  .action(
    async (options: {
      git?: boolean;
      code?: boolean;
      ci?: boolean;
      threshold?: string;
      days?: string;
    }) => {
      await runMetrics(process.cwd(), {
        git: options.git,
        code: options.code,
        ci: options.ci,
        threshold: options.threshold ? parseInt(options.threshold, 10) : 70,
        days: options.days ? parseInt(options.days, 10) : undefined,
      });
    }
  );

program
  .command("install-commands")
  .description("Install or update Claude Code commands and skills")
  .action(async () => {
    await runInstallCommands(process.cwd());
  });

program.parse();
