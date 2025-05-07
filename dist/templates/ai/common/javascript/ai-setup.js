import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
// import { ChatOpenAI } from "@langchain/openai"; // Default, user will change if needed

// This is a basic setup file for Langchain.
// You will need to configure the model and API keys based on your chosen provider.

// Example: Using OpenAI (remember to set your OPENAI_API_KEY environment variable)
// const model = new ChatOpenAI({
//   model: "gpt-4", // Or your preferred model
//   temperature: 0.7,
// });

/**
 * A simple function to demonstrate a chat completion.
 * @param {any} modelInstance An instance of a Langchain chat model.
 * @param {string} language The language to translate into.
 * @param {string} text The text to translate.
 * @returns {Promise<string | null>} The translated text.
 */
export async function translateText(modelInstance, language, text) {
  const systemTemplate =
    "Translate the following from English into {language}.";
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["user", "{text}"],
  ]);

  try {
    const chain = promptTemplate.pipe(modelInstance);
    const result = await chain.invoke({ language, text });
    return result?.content?.toString() || null;
  } catch (error) {
    console.error("Error during translation:", error);
    return null;
  }
}

/**
 * A simple function to send a message to the LLM and get a response.
 * @param {any} modelInstance An instance of a Langchain chat model.
 * @param {string} userMessage The message from the user.
 * @param {string} [systemContext] Optional system context to guide the LLM.
 * @returns {Promise<string | null>} The LLM's response.
 */
export async function askLLM(modelInstance, userMessage, systemContext) {
  const messages = [];
  if (systemContext) {
    messages.push(new SystemMessage(systemContext));
  }
  messages.push(new HumanMessage(userMessage));

  try {
    const response = await modelInstance.invoke(messages);
    return response?.content?.toString() || null;
  } catch (error) {
    console.error("Error interacting with LLM:", error);
    return null;
  }
}

console.log(
  "Langchain AI setup file loaded. You can import these functions into your project."
);
console.log(
  "Remember to initialize your chosen model and pass it to the functions."
);

// No default export, functions are named exports.
