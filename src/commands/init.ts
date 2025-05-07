#!/usr/bin/env node
import fsExtra from "fs-extra";
import { join, dirname, resolve } from "path";
import { chdir } from "process";
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type Options = {
  projectName: string;
  useTypeScript: boolean;
  hotReload: boolean;
  addTesting: boolean;
};

type Question = {
  type: string;
  name: keyof Options;
  message: string;
  default?: boolean;
  validate?: (input: string) => boolean;
};

export const questions: Question[] = [
  {
    type: "input",
    name: "projectName",
    message: "Project name:",
    validate: (input: string) => /^[a-z\-]+$/.test(input),
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

export async function init(options: Options) {
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
  // Assuming 'templates' is in the parent directory of __dirname (i.e., 'src/../templates')
  const templateDir = join(
    __dirname,
    "..", // Go up one level from 'src/commands' to 'src'
    "templates",
    options.useTypeScript ? "typescript" : "javascript"
  );

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

  if (deps.length > 0) {
    console.log("Installing dependencies...");
    execSync(`npm install --save-dev ${deps.join(" ")}`, { stdio: "inherit" });
  }

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

    writeFileSync(
      join(targetDir, "nodemon.json"),
      JSON.stringify(nodemonConfig, null, 2)
    );
  }

  console.log(
    `\n${chalk.bgGreen.black(" SUCCESS ")} ${chalk.green.bold(
      `Project ${options.projectName} created successfully`
    )} ${chalk.green("🚀🚀🚀")}`
  );
  console.log(`\n${chalk.cyan.bold("To get started:")}`);
  console.log(
    `  ${chalk.yellow("cd")} ${chalk.yellow.bold(options.projectName)}`
  );
  console.log(`  ${chalk.yellow("npm run dev")}`);
}
