import { ChatAnthropic } from "@langchain/anthropic";
import { translateText, askLLM } from "../../common/typescript/ai-setup.js";
import dotenv from "dotenv";

dotenv.config();

const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

if (!anthropicApiKey) {
  console.error(
    "ANTHROPIC_API_KEY not found. Please set it in your .env file or environment variables."
  );
  process.exit(1);
}

const model = new ChatAnthropic({
  apiKey: anthropicApiKey,
  model: "claude-3-5-sonnet-20240620",
  temperature: 0,
});

async function main() {
  console.log("Running Anthropic examples...");

  const languageToTranslateTo = "French";
  const textToTranslate = "This is a test for Anthropic model.";
  console.log(
    `\nTranslating '${textToTranslate}' to ${languageToTranslateTo}...`
  );
  const translation = await translateText(
    model,
    languageToTranslateTo,
    textToTranslate
  );
  if (translation) {
    console.log(`Translation: ${translation}`);
  } else {
    console.log("Translation failed.");
  }

  const question = "What is Anthropic's approach to AI safety?";
  console.log(`\nAsking Anthropic: '${question}'...`);
  const answer = await askLLM(model, question);
  if (answer) {
    console.log(`Anthropic Answer: ${answer}`);
  } else {
    console.log("Anthropic interaction failed.");
  }
}

main().catch(console.error);
