import { Command } from "commander";
import { runInit } from "./commands/init.js";
import { runSetupProtection } from "./commands/setup-protection.js";

const program = new Command();

program
  .name("raftstack")
  .description(
    "CLI tool for setting up Git hooks, commit conventions, and GitHub integration"
  )
  .version("1.0.0");

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

program.parse();
