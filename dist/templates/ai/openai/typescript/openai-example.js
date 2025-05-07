import { ChatOpenAI } from "@langchain/openai";
import { translateText, askLLM } from "../../common/typescript/ai-setup.js"; // ESM needs .js extension
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file
// Initialize the OpenAI model
// Make sure your OPENAI_API_KEY is set in your .env file or environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
    console.error("OPENAI_API_KEY not found. Please set it in your .env file or environment variables.");
    process.exit(1);
}
const model = new ChatOpenAI({
    apiKey: openaiApiKey,
    model: "gpt-3.5-turbo", // Or your preferred model like "gpt-4"
    temperature: 0, // Updated temperature
});
async function main() {
    console.log("Running OpenAI examples...");
    // Example 1: Translate text
    const languageToTranslateTo = "Spanish";
    const textToTranslate = "Hello, how are you doing today?";
    console.log(`\nTranslating '${textToTranslate}' to ${languageToTranslateTo}...`);
    const translation = await translateText(model, languageToTranslateTo, textToTranslate);
    if (translation) {
        console.log(`Translation: ${translation}`);
    }
    else {
        console.log("Translation failed.");
    }
    // Example 2: Ask the LLM a question
    const question = "What is the capital of France?";
    console.log(`\nAsking the LLM: '${question}'...`);
    const answer = await askLLM(model, question);
    if (answer) {
        console.log(`LLM Answer: ${answer}`);
    }
    else {
        console.log("LLM interaction failed.");
    }
    // Example 3: Ask with system context
    const systemContext = "You are a helpful assistant that speaks like a pirate.";
    const pirateQuestion = "Tell me a joke.";
    console.log(`\nAsking the LLM (as a pirate): '${pirateQuestion}'...`);
    const pirateAnswer = await askLLM(model, pirateQuestion, systemContext);
    if (pirateAnswer) {
        console.log(`Pirate LLM Answer: ${pirateAnswer}`);
    }
    else {
        console.log("Pirate LLM interaction failed.");
    }
}
main().catch(console.error);
