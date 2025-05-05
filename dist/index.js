#!/usr/bin/env node
import inquirer from "inquirer";
import fsExtra from "fs-extra";
import { join, dirname, resolve } from "path";
import { chdir } from "process";
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { Command } from "commander";
import chalk from "chalk";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { copySync } = fsExtra;
const questions = [
    {
        type: "input",
        name: "projectName",
        message: "Project name:",
        validate: (input) => /^[a-z\-]+$/.test(input),
    },
    {
        type: "confirm",
        name: "useTypeScript",
        message: "Use TypeScript?",
        default: true,
    },
    {
        type: "confirm",
        name: "hotReload",
        message: "Enable hot reload?",
        default: true,
    },
    {
        type: "confirm",
        name: "addTesting",
        message: "Add Jest testing?",
        default: true,
    },
];
async function init(options) {
    // Add signal handlers for graceful shutdown
    process.on("SIGINT", () => {
        console.log("\nExiting gracefully...");
        process.exit(0);
    });
    process.on("SIGTERM", () => {
        console.log("\nExiting gracefully...");
        process.exit(0);
    });
    // Get current working directory before changing
    const currentDir = process.cwd();
    // Create project directory with absolute path
    const targetDir = resolve(currentDir, options.projectName);
    // Get template dir with absolute path from package location
    const templateDir = join(__dirname, `templates/${options.useTypeScript ? "typescript" : "javascript"}`);
    // Ensure target directory exists
    fsExtra.ensureDirSync(targetDir);
    // Copy template files with filtering
    fsExtra.copySync(templateDir, targetDir, {
        filter: (src) => {
            // Don't copy index.js to TypeScript projects
            if (options.useTypeScript && src.endsWith("index.js")) {
                return false;
            }
            // Don't copy index.ts to JavaScript projects
            if (!options.useTypeScript && src.endsWith("index.ts")) {
                return false;
            }
            return true;
        },
    });
    // Update package.json
    chdir(targetDir);
    const pkgPath = join(targetDir, "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    pkg.name = options.projectName;
    pkg.scripts = {
        ...(options.useTypeScript
            ? {
                start: "node dist/index.js",
                build: "tsc",
                dev: "nodemon",
            }
            : {
                start: "node src/index.js",
                dev: "nodemon",
            }),
        ...(options.addTesting && { test: "jest" }),
    };
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    // Install dependencies
    const deps = [];
    if (options.useTypeScript) {
        deps.push("typescript", "@types/node", "tsx");
    }
    if (options.hotReload) {
        deps.push("nodemon");
    }
    if (options.addTesting) {
        deps.push("jest");
        if (options.useTypeScript) {
            deps.push("@types/jest", "ts-jest");
        }
    }
    console.log("Installing dependencies...");
    execSync(`npm install --save-dev ${deps.join(" ")}`, { stdio: "inherit" });
    // Create nodemon.json if hot reload is enabled
    if (options.hotReload) {
        const nodemonConfig = options.useTypeScript
            ? {
                watch: ["src"],
                ext: "ts",
                ignore: ["dist"],
                exec: "npx tsx src/index.ts",
            }
            : {
                watch: ["src"],
                ext: "js",
                ignore: ["node_modules"],
                exec: "node src/index.js",
            };
        writeFileSync(join(targetDir, "nodemon.json"), JSON.stringify(nodemonConfig, null, 2));
    }
    console.log(`\n${chalk.bgGreen.black(" SUCCESS ")} ${chalk.green.bold(`Project ${options.projectName} created successfully`)} ${chalk.green("🚀🚀🚀")}`);
    console.log(`\n${chalk.cyan.bold("To get started:")}`);
    console.log(`  ${chalk.yellow("cd")} ${chalk.yellow.bold(options.projectName)}`);
    console.log(`  ${chalk.yellow("npm run dev")}`);
}
// Function to add Express to an existing project
async function addExpress() {
    console.log(`${chalk.cyan.bold("Adding Express server to your project...")}`);
    // Detect if we're in a create-nodex project
    const currentDir = process.cwd();
    const pkgPath = join(currentDir, "package.json");
    if (!existsSync(pkgPath)) {
        console.error(`${chalk.bgRed.white(" ERROR ")} ${chalk.red("package.json not found. Make sure you're in a project directory.")}`);
        process.exit(1);
    }
    // Check if we're in a TypeScript project
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const isTypeScript = pkg.devDependencies &&
        (pkg.devDependencies.typescript ||
            (pkg.dependencies && pkg.dependencies.typescript));
    console.log(`${chalk.blue("Detected")} ${chalk.blue.bold(isTypeScript ? "TypeScript" : "JavaScript")} ${chalk.blue("project.")}`);
    // Copy the appropriate Express template
    const templatePath = join(__dirname, `templates/express/${isTypeScript ? "typescript" : "javascript"}/server.${isTypeScript ? "ts" : "js"}`);
    const targetPath = join(currentDir, "src", `server.${isTypeScript ? "ts" : "js"}`);
    if (existsSync(targetPath)) {
        const overwrite = await inquirer.prompt([
            {
                type: "confirm",
                name: "overwrite",
                message: `${chalk.yellow("⚠️")} server file already exists. Overwrite?`,
                default: false,
            },
        ]);
        if (!overwrite.overwrite) {
            console.log(`${chalk.yellow("Express server installation cancelled.")}`);
            return;
        }
    }
    // Copy the server file
    copySync(templatePath, targetPath);
    // Update package.json with Express dependencies
    const expressAdditionsPath = join(__dirname, "templates/express/package-additions.json");
    const expressAdditions = JSON.parse(readFileSync(expressAdditionsPath, "utf8"));
    // Merge dependencies
    pkg.dependencies = {
        ...(pkg.dependencies || {}),
        ...(expressAdditions.dependencies || {}),
    };
    // Only add TypeScript-related devDependencies if it's a TypeScript project
    if (isTypeScript) {
        pkg.devDependencies = {
            ...(pkg.devDependencies || {}),
            ...(expressAdditions.devDependencies || {}),
        };
    }
    // Merge scripts - adapt for TypeScript if needed
    if (isTypeScript) {
        pkg.scripts = {
            ...(pkg.scripts || {}),
            "start:server": "node dist/server.js",
            "dev:server": "nodemon --exec tsx src/server.ts",
        };
    }
    else {
        pkg.scripts = {
            ...(pkg.scripts || {}),
            "start:server": "node src/server.js",
            "dev:server": "nodemon src/server.js",
        };
    }
    // Save updated package.json
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    // Install dependencies
    console.log(`\n${chalk.cyan("Installing Express dependencies...")}`);
    execSync("npm install", { stdio: "inherit" });
    console.log(`\n${chalk.bgGreen.black(" SUCCESS ")} ${chalk.green.bold("Express server added successfully!")} ${chalk.green("🚀")}`);
    console.log(`\n${chalk.cyan.bold("To start the server:")}`);
    console.log(`  ${chalk.yellow("npm run dev:server")}`);
    console.log(`\n${chalk.cyan.bold("Available endpoints:")}`);
    console.log(`  ${chalk.green("GET")}  ${chalk.blue("http://localhost:3000/")} - ${chalk.gray("Welcome message")}`);
    console.log(`  ${chalk.yellow("POST")} ${chalk.blue("http://localhost:3000/api/data")} - ${chalk.gray("Data endpoint")}`);
}
// Set up command-line interface
const program = new Command();
program
    .name("create-nodex")
    .description("CLI tool to create modern Node.js projects with TypeScript")
    .version("1.0.0");
// Command to create a new project
program
    .command("create")
    .argument("[project-name]", "Name of the project to create")
    .description("Create a new Node.js project")
    .action(async (projectName) => {
    try {
        // If projectName is provided as argument, use it, otherwise prompt for it
        if (projectName) {
            await init({
                projectName,
                useTypeScript: true,
                hotReload: true,
                addTesting: true,
            });
        }
        else {
            const options = (await inquirer.prompt(questions));
            await init(options);
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
// Command to add Express to an existing project
program
    .command("add")
    .argument("<feature>", "Feature to add (e.g., express)")
    .description("Add features to an existing project")
    .action(async (feature) => {
    try {
        if (feature.toLowerCase() === "express") {
            await addExpress();
        }
        else {
            console.error(`${chalk.bgRed.white(" ERROR ")} ${chalk.red(`Unknown feature '${feature}'. Available features: express`)}`);
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
// When no command is specified, default to the create command
if (process.argv.length <= 2) {
    program.parse([...process.argv, "create"]);
}
else {
    program.parse();
}
