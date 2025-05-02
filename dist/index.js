#!/usr/bin/env node
import inquirer from "inquirer";
import fsExtra from "fs-extra";
import { join, dirname, resolve } from "path";
import { chdir } from "process";
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
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
async function init() {
    const options = (await inquirer.prompt(questions));
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
                dev: "nodemon src/index.js",
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
    console.log(`\nProject ${options.projectName} created successfully!`);
    console.log(`\nTo get started:`);
    console.log(`  cd ${options.projectName}`);
    console.log(`  npm run dev`);
}
init();
