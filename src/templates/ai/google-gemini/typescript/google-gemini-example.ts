import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { translateText, askLLM } from "../../common/typescript/ai-setup.js";
import dotenv from "dotenv";

dotenv.config();

const googleApiKey = process.env.GOOGLE_API_KEY;

if (!googleApiKey) {
  console.error(
    "GOOGLE_API_KEY not found. Please set it in your .env file or environment variables."
  );
  process.exit(1);
}

const model = new ChatGoogleGenerativeAI({
  apiKey: googleApiKey,
  model: "gemini-1.5-flash",
  temperature: 0,
  maxOutputTokens: 2048,
});

async function main() {
  console.log("Running Google Gemini examples...");

  const languageToTranslateTo = "Japanese";
  const textToTranslate = "Let's test the Gemini model.";
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

  const question = "What are some interesting capabilities of Google Gemini?";
  console.log(`\nAsking Google Gemini: '${question}'...`);
  const answer = await askLLM(model, question);
  if (answer) {
    console.log(`Google Gemini Answer: ${answer}`);
  } else {
    console.log("Google Gemini interaction failed.");
  }
}

main().catch(console.error);
