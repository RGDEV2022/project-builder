#!/usr/bin/env node
import inquirer from "inquirer";
import fsExtra from "fs-extra";
import { join, dirname } from "path";
import { chdir } from "process";
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { copySync } = fsExtra;

type Options = {
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

const questions: Question[] = [
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

async function init() {
  const options = (await inquirer.prompt(questions as any)) as Options;

  // Create project directory
  const templateDir = join(
    dirname(fileURLToPath(import.meta.url)),
    `templates/${options.useTypeScript ? "typescript" : "javascript"}`
  );

  // Ensure target directory exists
  fsExtra.ensureDirSync(options.projectName);

  // Copy template files with filtering
  fsExtra.copySync(templateDir, options.projectName, {
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
  chdir(options.projectName);
  const pkgPath = join(process.cwd(), "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

  pkg.name = options.projectName;
  pkg.scripts = {
    ...(options.useTypeScript
      ? {
          start: "node dist/index.js",
          build: "tsc",
          dev: "nodemon --exec ts-node src/index.ts",
        }
      : {
          start: "node src/index.js",
          dev: "nodemon src/index.js",
        }),
    ...(options.addTesting && { test: "jest" }),
  };

  writeFileSync("package.json", JSON.stringify(pkg, null, 2));

  // Install dependencies
  const deps = [];
  if (options.useTypeScript) {
    deps.push("typescript", "@types/node", "ts-node");
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

  console.log(`\nProject ${options.projectName} created successfully!`);
  console.log(`\nTo get started:`);
  console.log(`  cd ${options.projectName}`);
  console.log(`  npm run dev`);
}

init();
