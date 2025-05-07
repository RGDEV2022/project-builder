#!/usr/bin/env node
import inquirer from "inquirer";
// import fsExtra from "fs-extra"; // No longer needed here
import { join, dirname } from "path";
// import { chdir } from "process"; // No longer needed here
// import { execSync } from "child_process"; // No longer needed here
import { readFileSync } from "fs"; // writeFileSync, existsSync might be needed by other parts, check later
import { fileURLToPath } from "url";
import { Command } from "commander";
import chalk from "chalk";
import updateNotifier from "update-notifier";
// Import new command functions
import { init, questions } from "./commands/init.js"; // .js extension for ESM
import { addExpress } from "./commands/addExpress.js"; // .js extension for ESM
import { addAi } from "./commands/addAi.js"; // .js extension for ESM for the new AI command
import { addAiRag } from "./commands/addAiRag.js"; // .js extension for ESM for the new AI RAG command
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Read package.json for the notifier
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));
// Check for updates right after reading pkg
updateNotifier({ pkg }).notify();
// const { copySync } = fsExtra; // Moved to command files
// Types and questions array moved to init.ts
// init function moved to commands/init.ts
// addExpress function moved to commands/addExpress.ts
// Set up command-line interface
const program = new Command();
program
    .name("create-nodex")
    .description("CLI tool to create modern Node.js projects with TypeScript")
    .version(pkg.version)
    .argument("[project-name]", "Name of the project to create")
    .action(async (projectName) => {
    try {
        let options;
        if (projectName) {
            // Reconstruct options based on InitOptions
            options = {
                projectName,
                useTypeScript: true, // Defaulting, consider making these configurable or prompting
                hotReload: true,
                addTesting: true,
            };
        }
        else {
            options = (await inquirer.prompt(questions));
        }
        await init(options);
    }
    catch (error) {
        if (error.name === "ExitPromptError") {
            console.log(`\n${chalk.cyan("See you next time")} ${chalk.cyan.bold("👋")}`);
            process.exit(0);
        }
        console.error(`${chalk.bgRed.white(" ERROR ")} ${chalk.red(error)}`);
        process.exit(1);
    }
});
program
    .command("add")
    .argument("<feature>", "Feature to add (e.g., express, ai, ai-rag)")
    .description("Add features to an existing project")
    .action(async (feature) => {
    try {
        const lowerFeature = feature.toLowerCase();
        if (lowerFeature === "express") {
            await addExpress();
        }
        else if (lowerFeature === "ai") {
            await addAi();
        }
        else if (lowerFeature === "ai-rag") {
            await addAiRag();
        }
        else {
            console.error(`${chalk.bgRed.white(" ERROR ")} ${chalk.red(`Unknown feature '${feature}'. Available features: express, ai, ai-rag`)}`);
            process.exit(1);
        }
    }
    catch (error) {
        if (error.name === "ExitPromptError") {
            console.log(`\n${chalk.cyan("See you next time")} ${chalk.cyan.bold("👋")}`);
            process.exit(0);
        }
        console.error(`${chalk.bgRed.white(" ERROR ")} ${chalk.red(error)}`);
        process.exit(1);
    }
});
program.parse();
