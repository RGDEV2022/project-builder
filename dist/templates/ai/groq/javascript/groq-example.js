import { ChatGroq } from "@langchain/groq";
import { translateText, askLLM } from "../../common/javascript/ai-setup.js"; // ESM needs .js
import dotenv from "dotenv";

dotenv.config();

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  console.error(
    "GROQ_API_KEY not found. Please set it in your .env file or environment variables."
  );
  process.exit(1);
}

const model = new ChatGroq({
  apiKey: groqApiKey,
  model: "llama3-70b-8192", // Updated model name
  temperature: 0, // Updated temperature
});

async function main() {
  console.log("Running Groq examples...");

  const languageToTranslateTo = "German";
  const textToTranslate = "The weather is nice today.";
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

  const question = "What are the main features of the Llama3 model?";
  console.log(`\nAsking Groq: '${question}'...`);
  const answer = await askLLM(model, question);
  if (answer) {
    console.log(`Groq Answer: ${answer}`);
  } else {
    console.log("Groq interaction failed.");
  }
}

main().catch(console.error);
