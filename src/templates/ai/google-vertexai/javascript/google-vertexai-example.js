import { ChatVertexAI } from "@langchain/google-vertexai";
import { translateText, askLLM } from "../../common/javascript/ai-setup.js"; // ESM needs .js
import dotenv from "dotenv";

dotenv.config(); // For other potential env vars, though GOOGLE_APPLICATION_CREDENTIALS is primary

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "GOOGLE_APPLICATION_CREDENTIALS not found. Please set this environment variable to the path of your credentials JSON file."
  );
  process.exit(1);
}

const model = new ChatVertexAI({
  model: "gemini-1.5-flash-001",
  temperature: 0,
});

async function main() {
  console.log("Running Google VertexAI examples...");

  const languageToTranslateTo = "Korean";
  const textToTranslate =
    "VertexAI allows access to Google's foundation models.";
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
    "What are the benefits of using Vertex AI for machine learning?";
  console.log(`\nAsking Google VertexAI: '${question}'...`);
  const answer = await askLLM(model, question);
  if (answer) {
    console.log(`Google VertexAI Answer: ${answer}`);
  } else {
    console.log("Google VertexAI interaction failed.");
  }
}

main().catch(console.error);
