import inquirer from "inquirer";
import fsExtra from "fs-extra";
import { join, dirname } from "path";
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import chalk from "chalk";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { copySync } = fsExtra;
// Function to add Express to an existing project
export async function addExpress() {
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
    // Assuming 'templates' is in the parent directory of __dirname (i.e., 'src/../templates')
    const templatePath = join(__dirname, "..", // Go up one level from 'src/commands' to 'src'
    `templates/express/${isTypeScript ? "typescript" : "javascript"}/server.${isTypeScript ? "ts" : "js"}`);
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
    const expressAdditionsPath = join(__dirname, "..", // Go up one level from 'src/commands' to 'src'
    "templates/express/package-additions.json");
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
