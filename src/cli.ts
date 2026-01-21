import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runSetupProtection } from "./commands/setup-protection.js";
import { runMetrics } from "./commands/metrics.js";
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
  .action(async () => {
    await runMetrics(process.cwd());
  });

program.parse();
