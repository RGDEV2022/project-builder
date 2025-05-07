import inquirer from "inquirer";
import fsExtra from "fs-extra";
import { join, dirname } from "path";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { copySync, ensureDirSync } = fsExtra;

const availableModels = [
  {
    name: "OpenAI (e.g., GPT-4, GPT-3.5 Turbo)",
    value: "openai",
    packageName: "@langchain/openai",
    apiKeyEnv: "OPENAI_API_KEY",
  },
  {
    name: "Groq (e.g., Llama, Mixtral)",
    value: "groq",
    packageName: "@langchain/groq",
    apiKeyEnv: "GROQ_API_KEY",
  },
  {
    name: "Anthropic (e.g., Claude)",
    value: "anthropic",
    packageName: "@langchain/anthropic",
    apiKeyEnv: "ANTHROPIC_API_KEY",
  },
  {
    name: "Google Gemini",
    value: "google-gemini",
    packageName: "@langchain/google-genai",
    apiKeyEnv: "GOOGLE_API_KEY",
  },
  {
    name: "FireworksAI",
    value: "fireworks",
    packageName: "@langchain/community", // Changed package
    apiKeyEnv: "FIREWORKS_API_KEY",
  },
  {
    name: "MistralAI",
    value: "mistral",
    packageName: "@langchain/mistralai",
    apiKeyEnv: "MISTRAL_API_KEY",
  },
  {
    name: "Google VertexAI",
    value: "google-vertexai",
    packageName: "@langchain/google-vertexai",
    apiKeyEnv: "GOOGLE_APPLICATION_CREDENTIALS", // Special case, path to JSON
  },
];

async function addAi() {
  console.log(
    `${chalk.cyan.bold("Adding Langchain AI features to your project...")}`
  );

  const currentDir = process.cwd();
  const pkgPath = join(currentDir, "package.json");

  if (!existsSync(pkgPath)) {
    console.error(
      `${chalk.bgRed.white(" ERROR ")} ${chalk.red(
        "package.json not found. Make sure you're in a project directory."
      )}`
    );
    process.exit(1);
  }

  const pkgData = JSON.parse(readFileSync(pkgPath, "utf8"));
  const isTypeScript =
    (pkgData.devDependencies && pkgData.devDependencies.typescript) ||
    (pkgData.dependencies && pkgData.dependencies.typescript);

  console.log(
    `${chalk.blue("Detected")} ${chalk.blue.bold(
      isTypeScript ? "TypeScript" : "JavaScript"
    )} ${chalk.blue("project.")}`
  );

  const { selectedModel } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedModel",
      message: "Which AI model provider would you like to use with Langchain?",
      choices: availableModels.map((m) => ({ name: m.name, value: m.value })),
    },
  ]);

  const modelChoice = availableModels.find((m) => m.value === selectedModel);
  if (!modelChoice) {
    console.error(
      `${chalk.bgRed.white(" ERROR ")} ${chalk.red("Invalid model selection.")}`
    );
    process.exit(1);
  }

  console.log(`${chalk.cyan(`Setting up for ${modelChoice.name}...`)}`);

  const templateBaseDir = join(__dirname, "..", "templates", "ai");
  const commonTemplateDir = join(templateBaseDir, "common");
  const modelSpecificTemplateDir = join(templateBaseDir, modelChoice.value);
  const langDir = isTypeScript ? "typescript" : "javascript";

  // Create directory structure in user's project
  const srcDir = join(currentDir, "src");
  const aiDir = join(srcDir, "ai");
  const commonAiDir = join(aiDir, "common");

  ensureDirSync(srcDir);
  ensureDirSync(aiDir);
  ensureDirSync(commonAiDir);

  const commonAiSetupFile = `ai-setup.${isTypeScript ? "ts" : "js"}`;
  const commonTemplatePath = join(
    commonTemplateDir,
    langDir,
    commonAiSetupFile
  );
  const commonTargetPath = join(commonAiDir, commonAiSetupFile);

  if (existsSync(commonTemplatePath)) {
    if (existsSync(commonTargetPath)) {
      const { overwriteCommon } = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwriteCommon",
          message: `${chalk.yellow(
            "⚠️"
          )} ${commonAiSetupFile} already exists in src/ai/common/. Overwrite?`,
          default: false,
        },
      ]);
      if (!overwriteCommon) {
        console.log(`${chalk.yellow(`Skipping ${commonAiSetupFile}...`)}`);
      } else {
        copySync(commonTemplatePath, commonTargetPath);
        console.log(`${chalk.green(`✓ Copied ${commonAiSetupFile}`)}`);
      }
    } else {
      copySync(commonTemplatePath, commonTargetPath);
      console.log(`${chalk.green(`✓ Copied ${commonAiSetupFile}`)}`);
    }
  }

  const modelExampleFile = `${modelChoice.value}-example.${
    isTypeScript ? "ts" : "js"
  }`;
  const modelTemplatePath = join(
    modelSpecificTemplateDir,
    langDir,
    modelExampleFile
  );

  // Create model directory and modify the target path
  const modelDir = join(aiDir, modelChoice.value);
  ensureDirSync(modelDir);
  const modelTargetPath = join(modelDir, modelExampleFile);

  // We also need to update import paths in the example file before copying
  if (existsSync(modelTemplatePath)) {
    // Read the template file
    let modelFileContent = readFileSync(modelTemplatePath, "utf8");

    // Update the import path to reflect the new directory structure
    modelFileContent = modelFileContent.replace(
      /import \{ translateText, askLLM \} from "\.\.\/\.\.\/common\/.*\/ai-setup\.js";/,
      `import { translateText, askLLM } from "../common/ai-setup.js";`
    );

    if (existsSync(modelTargetPath)) {
      const { overwriteModel } = await inquirer.prompt([
        {
          type: "confirm",
          name: "overwriteModel",
          message: `${chalk.yellow(
            "⚠️"
          )} ${modelExampleFile} already exists in src/ai/${
            modelChoice.value
          }/. Overwrite?`,
          default: false,
        },
      ]);
      if (!overwriteModel) {
        console.log(`${chalk.yellow(`Skipping ${modelExampleFile}...`)}`);
      } else {
        // Write the modified content to the target file
        fsExtra.writeFileSync(modelTargetPath, modelFileContent);
        console.log(
          `${chalk.green(`✓ Copied and updated ${modelExampleFile}`)}`
        );
      }
    } else {
      // Write the modified content to the target file
      fsExtra.writeFileSync(modelTargetPath, modelFileContent);
      console.log(`${chalk.green(`✓ Copied and updated ${modelExampleFile}`)}`);
    }
  } else {
    console.log(
      `${chalk.yellow(
        `No specific example template found for ${modelChoice.name}. Skipping model-specific example.`
      )}`
    );
  }

  const depsToInstall = [
    "langchain",
    "@langchain/core",
    modelChoice.packageName,
  ];
  // Add dotenv if an API key environment variable is expected for the chosen model.
  if (modelChoice.apiKeyEnv) {
    depsToInstall.push("dotenv");
  }

  console.log(
    `\n${chalk.cyan("Installing Langchain dependencies:")} ${depsToInstall.join(
      ", "
    )}`
  );
  execSync(`npm install ${depsToInstall.join(" ")}`, { stdio: "inherit" });

  if (isTypeScript) {
    const devDepsToInstall = ["@types/node"];
    if (depsToInstall.includes("dotenv")) {
      // If dotenv is installed as a dependency, add its types for TS
      devDepsToInstall.push("@types/dotenv");
    }
    // Add other model-specific type dependencies if necessary in the future
    if (devDepsToInstall.length > 0) {
      console.log(
        `\n${chalk.cyan(
          "Installing TypeScript development dependencies:"
        )} ${devDepsToInstall.join(", ")}`
      );
      execSync(`npm install --save-dev ${devDepsToInstall.join(" ")}`, {
        stdio: "inherit",
      });
    }
  }

  console.log(
    `\n${chalk.bgGreen.black(" SUCCESS ")} ${chalk.green.bold(
      `Langchain with ${modelChoice.name} added successfully!`
    )} ${chalk.green("🚀")}`
  );
  console.log(`\n${chalk.cyan.bold("Next steps:")}`);
  if (existsSync(commonTargetPath)) {
    console.log(
      `  - Explore the common setup in ${chalk.yellow(
        `src/ai/common/${commonAiSetupFile}`
      )}.`
    );
  }
  if (existsSync(modelTargetPath)) {
    console.log(
      `  - Check out the example in ${chalk.yellow(
        `src/ai/${modelChoice.value}/${modelExampleFile}`
      )}.`
    );
    console.log(
      `  - You can run it with: ${chalk.yellow(
        isTypeScript
          ? `npx tsx src/ai/${modelChoice.value}/${modelExampleFile}`
          : `node src/ai/${modelChoice.value}/${modelExampleFile}` // This might need adjustment if JS files are ESM
      )}`
    );
  }

  if (modelChoice.apiKeyEnv) {
    const apiKeyMessage =
      modelChoice.value === "google-vertexai"
        ? `Make sure your ${chalk.yellow(
            modelChoice.apiKeyEnv
          )} file is correctly set up.`
        : `Make sure to set your ${chalk.yellow(
            modelChoice.apiKeyEnv
          )} environment variable. (e.g., create a .env file with ${
            modelChoice.apiKeyEnv
          }=your_key_here)`;
    console.log(`  - ${chalk.yellow.bold("IMPORTANT:")} ${apiKeyMessage}`);
  }
}

export { addAi };
