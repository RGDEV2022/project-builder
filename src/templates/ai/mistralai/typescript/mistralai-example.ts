import { ChatMistralAI } from "@langchain/mistralai";
import { translateText, askLLM } from "../../common/typescript/ai-setup.js";
import dotenv from "dotenv";

dotenv.config();

const mistralApiKey = process.env.MISTRAL_API_KEY;

if (!mistralApiKey) {
  console.error(
    "MISTRAL_API_KEY not found. Please set it in your .env file or environment variables."
  );
  process.exit(1);
}

const model = new ChatMistralAI({
  apiKey: mistralApiKey,
  model: "mistral-large-latest",
  temperature: 0,
});

async function main() {
  console.log("Running MistralAI examples...");

  const languageToTranslateTo = "Portuguese";
  const textToTranslate = "MistralAI offers powerful open-weight models.";
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

  const question = "What are the key advantages of MistralAI's models?";
  console.log(`\nAsking MistralAI: '${question}'...`);
  const answer = await askLLM(model, question);
  if (answer) {
    console.log(`MistralAI Answer: ${answer}`);
  } else {
    console.log("MistralAI interaction failed.");
  }
}

main().catch(console.error);
