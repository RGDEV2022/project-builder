import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { translateText, askLLM } from "../../common/javascript/ai-setup.js";
import dotenv from "dotenv";

dotenv.config();

const fireworksApiKey = process.env.FIREWORKS_API_KEY;

if (!fireworksApiKey) {
  console.error(
    "FIREWORKS_API_KEY not found. Please set it in your .env file or environment variables."
  );
  process.exit(1);
}

const model = new ChatFireworks({
  apiKey: fireworksApiKey,
  model: "accounts/fireworks/models/llama-v3p1-70b-instruct",
  temperature: 0,
});

async function main() {
  console.log("Running FireworksAI examples...");

  const languageToTranslateTo = "Italian";
  const textToTranslate =
    "FireworksAI provides access to many open source models.";
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

  const question =
    "How can I use function calling with FireworksAI models via Langchain?";
  console.log(`\nAsking FireworksAI: '${question}'...`);
  const answer = await askLLM(model, question);
  if (answer) {
    console.log(`FireworksAI Answer: ${answer}`);
  } else {
    console.log("FireworksAI interaction failed.");
  }
}

main().catch(console.error);
