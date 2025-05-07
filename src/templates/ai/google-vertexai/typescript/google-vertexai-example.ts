import { ChatVertexAI } from "@langchain/google-vertexai";
import { translateText, askLLM } from "../../common/typescript/ai-setup.js"; // ESM needs .js extension
import dotenv from "dotenv";

dotenv.config(); // For other potential env vars, though GOOGLE_APPLICATION_CREDENTIALS is primary

// Ensure GOOGLE_APPLICATION_CREDENTIALS is set in your environment
// This typically points to a JSON file with your service account key
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "GOOGLE_APPLICATION_CREDENTIALS not found. Please set this environment variable to the path of your credentials JSON file."
  );
  process.exit(1);
}

const model = new ChatVertexAI({
  // region: "us-central1", // Optional: if not default or in credentials
  model: "gemini-1.5-flash-001", // Updated model name (gemini-1.5-flash is a model family, -001 is a version)
  temperature: 0, // Updated temperature
  // maxOutputTokens: 2048, // Optional, can be added if needed
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
