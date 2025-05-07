import inquirer from "inquirer";
import fsExtra from "fs-extra";
import { join, dirname } from "path";
import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import chalk from "chalk";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { copySync, ensureDirSync, writeFileSync } = fsExtra;
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
        packageName: "@langchain/community",
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
        apiKeyEnv: "GOOGLE_APPLICATION_CREDENTIALS",
    },
];
const availableEmbeddings = [
    {
        name: "OpenAI",
        value: "openai",
        packageName: "@langchain/openai",
        apiKeyEnv: "OPENAI_API_KEY",
        className: "OpenAIEmbeddings",
        importPath: "@langchain/openai",
        modelName: "text-embedding-3-large",
    },
    {
        name: "Azure OpenAI",
        value: "azure",
        packageName: "@langchain/openai",
        apiKeyEnv: "AZURE_OPENAI_API_KEY",
        className: "AzureOpenAIEmbeddings",
        importPath: "@langchain/openai",
        modelName: "text-embedding-ada-002",
        additionalEnvVars: [
            "AZURE_OPENAI_API_INSTANCE_NAME",
            "AZURE_OPENAI_API_VERSION",
        ],
    },
    {
        name: "AWS Bedrock",
        value: "aws",
        packageName: "@langchain/aws",
        apiKeyEnv: "BEDROCK_AWS_REGION",
        className: "BedrockEmbeddings",
        importPath: "@langchain/aws",
        modelName: "amazon.titan-embed-text-v1",
    },
    {
        name: "Google VertexAI",
        value: "vertexai",
        packageName: "@langchain/google-vertexai",
        apiKeyEnv: "GOOGLE_APPLICATION_CREDENTIALS",
        className: "VertexAIEmbeddings",
        importPath: "@langchain/google-vertexai",
        modelName: "text-embedding-004",
    },
    {
        name: "Cohere",
        value: "cohere",
        packageName: "@langchain/cohere",
        apiKeyEnv: "COHERE_API_KEY",
        className: "CohereEmbeddings",
        importPath: "@langchain/cohere",
        modelName: "embed-english-v3.0",
    },
    {
        name: "MistralAI",
        value: "mistral",
        packageName: "@langchain/mistralai",
        apiKeyEnv: "MISTRAL_API_KEY",
        className: "MistralAIEmbeddings",
        importPath: "@langchain/mistralai",
        modelName: "mistral-embed",
    },
];
const availableVectorStores = [
    {
        name: "Memory (In-memory, no persistence)",
        value: "memory",
        packageName: "langchain",
        className: "MemoryVectorStore",
        importPath: "langchain/vectorstores/memory",
        requiresApiKey: false,
    },
    {
        name: "Chroma",
        value: "chroma",
        packageName: "chromadb",
        className: "Chroma",
        importPath: "@langchain/community/vectorstores/chroma",
        requiresApiKey: false,
    },
    {
        name: "FAISS",
        value: "faiss",
        packageName: "@langchain/community",
        className: "FaissStore",
        importPath: "@langchain/community/vectorstores/faiss",
        requiresApiKey: false,
    },
    {
        name: "MongoDB Atlas",
        value: "mongodb",
        packageName: "@langchain/mongodb",
        className: "MongoDBAtlasVectorSearch",
        importPath: "@langchain/mongodb",
        requiresApiKey: true,
        apiKeyEnv: "MONGODB_ATLAS_URI",
        additionalEnvVars: [
            "MONGODB_ATLAS_DB_NAME",
            "MONGODB_ATLAS_COLLECTION_NAME",
        ],
    },
    {
        name: "PGVector (PostgreSQL)",
        value: "pgvector",
        packageName: "@langchain/community",
        className: "PGVectorStore",
        importPath: "@langchain/community/vectorstores/pgvector",
        requiresApiKey: true,
        apiKeyEnv: "PG_CONNECTION_STRING",
    },
    {
        name: "Pinecone",
        value: "pinecone",
        packageName: "@pinecone-database/pinecone",
        className: "PineconeStore",
        importPath: "@langchain/pinecone",
        apiKeyEnv: "PINECONE_API_KEY",
        requiresApiKey: true,
        additionalEnvVars: ["PINECONE_INDEX", "PINECONE_ENVIRONMENT"],
    },
    {
        name: "Qdrant",
        value: "qdrant",
        packageName: "@langchain/qdrant",
        className: "QdrantVectorStore",
        importPath: "@langchain/qdrant",
        requiresApiKey: false,
        additionalEnvVars: ["QDRANT_URL"],
    },
];
async function addAiRag() {
    console.log(`${chalk.cyan.bold("Adding Langchain RAG features to your project...")}`);
    const currentDir = process.cwd();
    const pkgPath = join(currentDir, "package.json");
    if (!existsSync(pkgPath)) {
        console.error(`${chalk.bgRed.white(" ERROR ")} ${chalk.red("package.json not found. Make sure you're in a project directory.")}`);
        process.exit(1);
    }
    const pkgData = JSON.parse(readFileSync(pkgPath, "utf8"));
    const isTypeScript = (pkgData.devDependencies && pkgData.devDependencies.typescript) ||
        (pkgData.dependencies && pkgData.dependencies.typescript);
    console.log(`${chalk.blue("Detected")} ${chalk.blue.bold(isTypeScript ? "TypeScript" : "JavaScript")} ${chalk.blue("project.")}`);
    // Model selection
    const { selectedModel } = await inquirer.prompt([
        {
            type: "list",
            name: "selectedModel",
            message: "Which chat model would you like to use with RAG?",
            choices: availableModels.map((m) => ({ name: m.name, value: m.value })),
        },
    ]);
    const modelChoice = availableModels.find((m) => m.value === selectedModel);
    if (!modelChoice) {
        console.error(`${chalk.bgRed.white(" ERROR ")} ${chalk.red("Invalid model selection.")}`);
        process.exit(1);
    }
    // Embeddings selection
    const { selectedEmbedding } = await inquirer.prompt([
        {
            type: "list",
            name: "selectedEmbedding",
            message: "Which embedding model would you like to use?",
            choices: availableEmbeddings.map((e) => ({
                name: e.name,
                value: e.value,
            })),
        },
    ]);
    const embeddingChoice = availableEmbeddings.find((e) => e.value === selectedEmbedding);
    if (!embeddingChoice) {
        console.error(`${chalk.bgRed.white(" ERROR ")} ${chalk.red("Invalid embedding model selection.")}`);
        process.exit(1);
    }
    // Vector store selection
    const { selectedVectorStore } = await inquirer.prompt([
        {
            type: "list",
            name: "selectedVectorStore",
            message: "Which vector store would you like to use?",
            choices: availableVectorStores.map((vs) => ({
                name: vs.name,
                value: vs.value,
            })),
        },
    ]);
    const vectorStoreChoice = availableVectorStores.find((vs) => vs.value === selectedVectorStore);
    if (!vectorStoreChoice) {
        console.error(`${chalk.bgRed.white(" ERROR ")} ${chalk.red("Invalid vector store selection.")}`);
        process.exit(1);
    }
    console.log(`${chalk.cyan(`Setting up RAG with ${modelChoice.name}, ${embeddingChoice.name} embeddings, and ${vectorStoreChoice.name}...`)}`);
    // Create directory structure in user's project
    const srcDir = join(currentDir, "src");
    const aiDir = join(srcDir, "ai");
    const ragDir = join(aiDir, "rag");
    ensureDirSync(srcDir);
    ensureDirSync(aiDir);
    ensureDirSync(ragDir);
    // Generate RAG example file
    const ragExampleFile = `rag-example.${isTypeScript ? "ts" : "js"}`;
    const ragExamplePath = join(ragDir, ragExampleFile);
    // Create RAG example content
    let ragExampleContent = createRagExample(isTypeScript, modelChoice, embeddingChoice, vectorStoreChoice);
    if (existsSync(ragExamplePath)) {
        const { overwriteRag } = await inquirer.prompt([
            {
                type: "confirm",
                name: "overwriteRag",
                message: `${chalk.yellow("⚠️")} ${ragExampleFile} already exists in src/ai/rag/. Overwrite?`,
                default: false,
            },
        ]);
        if (!overwriteRag) {
            console.log(`${chalk.yellow(`Skipping ${ragExampleFile}...`)}`);
        }
        else {
            writeFileSync(ragExamplePath, ragExampleContent);
            console.log(`${chalk.green(`✓ Created ${ragExampleFile}`)}`);
        }
    }
    else {
        writeFileSync(ragExamplePath, ragExampleContent);
        console.log(`${chalk.green(`✓ Created ${ragExampleFile}`)}`);
    }
    // Collect all required dependencies
    const depsToInstall = [
        "langchain",
        "@langchain/core",
        modelChoice.packageName,
        embeddingChoice.packageName,
    ];
    // Add vector store package
    if (vectorStoreChoice.packageName !== "langchain") {
        depsToInstall.push(vectorStoreChoice.packageName);
    }
    // Add text splitter and document loader
    depsToInstall.push("@langchain/textsplitters", "@langchain/community");
    // Add dotenv for API keys
    depsToInstall.push("dotenv");
    // Deduplicate dependencies
    const uniqueDeps = [...new Set(depsToInstall)];
    console.log(`\n${chalk.cyan("Installing Langchain RAG dependencies:")} ${uniqueDeps.join(", ")}`);
    execSync(`npm install ${uniqueDeps.join(" ")}`, { stdio: "inherit" });
    if (isTypeScript) {
        const devDepsToInstall = ["@types/node"];
        // Add types for dotenv
        devDepsToInstall.push("@types/dotenv");
        console.log(`\n${chalk.cyan("Installing TypeScript development dependencies:")} ${devDepsToInstall.join(", ")}`);
        execSync(`npm install --save-dev ${devDepsToInstall.join(" ")}`, {
            stdio: "inherit",
        });
    }
    console.log(`\n${chalk.bgGreen.black(" SUCCESS ")} ${chalk.green.bold(`Langchain RAG with ${modelChoice.name}, ${embeddingChoice.name} embeddings, and ${vectorStoreChoice.name} added successfully!`)} ${chalk.green("🚀")}`);
    console.log(`\n${chalk.cyan.bold("Next steps:")}`);
    if (existsSync(ragExamplePath)) {
        console.log(`  - Explore the RAG example in ${chalk.yellow(`src/ai/rag/${ragExampleFile}`)}.`);
        console.log(`  - You can run it with: ${chalk.yellow(isTypeScript
            ? `npx tsx src/ai/rag/${ragExampleFile}`
            : `node src/ai/rag/${ragExampleFile}`)}`);
    }
    // Collect all API keys needed
    const requiredEnvVars = new Set();
    if (modelChoice.apiKeyEnv) {
        requiredEnvVars.add(modelChoice.apiKeyEnv);
    }
    if (embeddingChoice.apiKeyEnv) {
        requiredEnvVars.add(embeddingChoice.apiKeyEnv);
    }
    if (vectorStoreChoice.requiresApiKey && vectorStoreChoice.apiKeyEnv) {
        requiredEnvVars.add(vectorStoreChoice.apiKeyEnv);
        // Add additional env vars if any
        if (vectorStoreChoice.additionalEnvVars) {
            vectorStoreChoice.additionalEnvVars.forEach((env) => requiredEnvVars.add(env));
        }
    }
    if (requiredEnvVars.size > 0) {
        console.log(`\n${chalk.yellow.bold("IMPORTANT:")} Set these environment variables:`);
        requiredEnvVars.forEach((envVar) => {
            console.log(`  - ${chalk.yellow(envVar)}=${envVar.includes("KEY") ? "your-api-key" : "your-value"}`);
        });
        console.log(`  Create a ${chalk.yellow(".env")} file with these variables in your project root.`);
    }
}
function createRagExample(isTypeScript, modelChoice, embeddingChoice, vectorStoreChoice) {
    const extension = isTypeScript ? "ts" : "js";
    const typeAnnotations = isTypeScript ? ": string" : "";
    return `${isTypeScript
        ? "// RAG Example with Langchain\n"
        : "// RAG Example with Langchain\n"}
import dotenv from "dotenv";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
${createImports(modelChoice, embeddingChoice, vectorStoreChoice)}

dotenv.config();

async function main() {
  console.log("Initializing RAG system...");

  // Check for required API keys
  ${createApiKeyChecks(modelChoice, embeddingChoice, vectorStoreChoice)}

  // Initialize models
  const llm = ${createLlmInitialization(modelChoice)};
  const embeddings = ${createEmbeddingsInitialization(embeddingChoice)};

  // Initialize vector store
  ${createVectorStoreInitialization(vectorStoreChoice)}

  // Sample document data for testing
  const sampleDocs = [
    new Document({
      pageContent: "LangChain is a framework for developing applications powered by language models.",
      metadata: { source: "langchain-docs" }
    }),
    new Document({
      pageContent: "RAG stands for Retrieval Augmented Generation. It's a pattern that combines search with LLM generation.",
      metadata: { source: "rag-explanation" }
    }),
    new Document({
      pageContent: "Vector databases store embeddings and enable semantic search based on similarity.",
      metadata: { source: "vector-db-docs" }
    }),
    new Document({
      pageContent: "Embedding models convert text into vector representations that capture semantic meaning.",
      metadata: { source: "embedding-explanation" }
    }),
  ];

  // Split documents into chunks for better embedding
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  });
  const splitDocs = await textSplitter.splitDocuments(sampleDocs);

  console.log(\`Adding \${splitDocs.length} document chunks to vector store...\`);
  await vectorStore.addDocuments(splitDocs);
  
  // Create RAG prompt template
  const promptTemplate = ChatPromptTemplate.fromTemplate(\`
    Answer the question based ONLY on the following context:
    
    {context}
    
    Question: {question}
    
    Answer:\`
  );

  // Define the RAG pipeline
  const retrievalChain = async (query${typeAnnotations}) => {
    // Retrieve relevant documents
    console.log(\`Searching for documents relevant to: "\${query}"\`);
    const retrievedDocs = await vectorStore.similaritySearch(query);
    
    const context = retrievedDocs.map(doc => doc.pageContent).join("\\n\\n");
    
    // Format the prompt with context and query
    console.log("Generating answer based on retrieved context...");
    const messages = await promptTemplate.invoke({
      context,
      question: query
    });
    
    // Generate an answer
    const answer = await llm.invoke(messages);
    return answer.content;
  };

  // Test the RAG pipeline with a sample question
  const testQuestion = "What is RAG and how does it work?";
  const answer = await retrievalChain(testQuestion);
  
  console.log("\\n====== RAG RESULT ======");
  console.log(\`Question: \${testQuestion}\`);
  console.log(\`Answer: \${answer}\`);
}

main().catch(console.error);
`;
}
// Helper functions for generating different parts of the example
function createImports(modelChoice, embeddingChoice, vectorStoreChoice) {
    const imports = [
        `import { ${getModelClassName(modelChoice)} } from "${modelChoice.packageName}";`,
        `import { ${embeddingChoice.className} } from "${embeddingChoice.importPath}";`,
    ];
    switch (vectorStoreChoice.value) {
        case "memory":
            imports.push(`import { ${vectorStoreChoice.className} } from "${vectorStoreChoice.importPath}";`);
            break;
        case "pinecone":
            imports.push(`import { Pinecone } from "@pinecone-database/pinecone";`);
            imports.push(`import { ${vectorStoreChoice.className} } from "${vectorStoreChoice.importPath}";`);
            break;
        case "mongodb":
            imports.push(`import { MongoClient } from "mongodb";`);
            imports.push(`import { ${vectorStoreChoice.className} } from "${vectorStoreChoice.importPath}";`);
            break;
        default:
            imports.push(`import { ${vectorStoreChoice.className} } from "${vectorStoreChoice.importPath}";`);
            break;
    }
    return imports.join("\n");
}
function getModelClassName(modelChoice) {
    switch (modelChoice.value) {
        case "openai":
            return "ChatOpenAI";
        case "anthropic":
            return "ChatAnthropic";
        case "groq":
            return "ChatGroq";
        case "google-gemini":
            return "ChatGoogleGenerativeAI";
        case "fireworks":
            return "ChatFireworks";
        case "mistral":
            return "ChatMistralAI";
        case "google-vertexai":
            return "ChatVertexAI";
        default:
            return "ChatOpenAI";
    }
}
function createApiKeyChecks(modelChoice, embeddingChoice, vectorStoreChoice) {
    const checks = [];
    // Add model API key check
    if (modelChoice.apiKeyEnv) {
        checks.push(`
  const ${modelChoice.apiKeyEnv.toLowerCase()} = process.env.${modelChoice.apiKeyEnv};
  if (!${modelChoice.apiKeyEnv.toLowerCase()}) {
    console.error("${modelChoice.apiKeyEnv} not found. Please set it in your .env file.");
    process.exit(1);
  }`);
    }
    // Add embedding API key check if different from model
    if (embeddingChoice.apiKeyEnv &&
        embeddingChoice.apiKeyEnv !== modelChoice.apiKeyEnv) {
        checks.push(`
  const ${embeddingChoice.apiKeyEnv.toLowerCase()} = process.env.${embeddingChoice.apiKeyEnv};
  if (!${embeddingChoice.apiKeyEnv.toLowerCase()}) {
    console.error("${embeddingChoice.apiKeyEnv} not found. Please set it in your .env file.");
    process.exit(1);
  }`);
        // Add checks for additional embedding environment variables
        if (embeddingChoice.additionalEnvVars) {
            embeddingChoice.additionalEnvVars.forEach((envVar) => {
                checks.push(`
  const ${envVar.toLowerCase()} = process.env.${envVar};
  if (!${envVar.toLowerCase()}) {
    console.error("${envVar} not found. Please set it in your .env file.");
    process.exit(1);
  }`);
            });
        }
    }
    // Add vector store API key check if needed
    if (vectorStoreChoice.requiresApiKey && vectorStoreChoice.apiKeyEnv) {
        checks.push(`
  const ${vectorStoreChoice.apiKeyEnv.toLowerCase()} = process.env.${vectorStoreChoice.apiKeyEnv};
  if (!${vectorStoreChoice.apiKeyEnv.toLowerCase()}) {
    console.error("${vectorStoreChoice.apiKeyEnv} not found. Please set it in your .env file.");
    process.exit(1);
  }`);
        // Add additional checks for vector store requirements
        if (vectorStoreChoice.additionalEnvVars) {
            vectorStoreChoice.additionalEnvVars.forEach((envVar) => {
                checks.push(`
  const ${envVar.toLowerCase()} = process.env.${envVar};
  if (!${envVar.toLowerCase()}) {
    console.error("${envVar} not found. Please set it in your .env file.");
    process.exit(1);
  }`);
            });
        }
    }
    return checks.join("\n");
}
function createLlmInitialization(modelChoice) {
    const className = getModelClassName(modelChoice);
    switch (modelChoice.value) {
        case "openai":
            return `new ${className}({
    apiKey: process.env.${modelChoice.apiKeyEnv},
    model: "gpt-3.5-turbo",
    temperature: 0
  })`;
        case "anthropic":
            return `new ${className}({
    apiKey: process.env.${modelChoice.apiKeyEnv},
    model: "claude-3-opus-20240229",
    temperature: 0
  })`;
        case "groq":
            return `new ${className}({
    apiKey: process.env.${modelChoice.apiKeyEnv},
    model: "llama3-8b-8192",
    temperature: 0
  })`;
        case "mistral":
            return `new ${className}({
    apiKey: process.env.${modelChoice.apiKeyEnv},
    model: "mistral-large-latest",
    temperature: 0
  })`;
        case "google-gemini":
            return `new ${className}({
    apiKey: process.env.${modelChoice.apiKeyEnv},
    model: "gemini-pro",
    temperature: 0
  })`;
        case "fireworks":
            return `new ${className}({
    apiKey: process.env.${modelChoice.apiKeyEnv},
    model: "accounts/fireworks/models/mixtral-8x7b-instruct",
    temperature: 0
  })`;
        case "google-vertexai":
            return `new ${className}({
    model: "gemini-pro",
    temperature: 0
  })`;
        default:
            return `new ${className}({
    apiKey: process.env.${modelChoice.apiKeyEnv},
    temperature: 0
  })`;
    }
}
function createEmbeddingsInitialization(embeddingChoice) {
    // Special handling for specific embedding models
    switch (embeddingChoice.value) {
        case "azure":
            return `new ${embeddingChoice.className}({
    azureOpenAIApiKey: process.env.${embeddingChoice.apiKeyEnv},
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    azureOpenAIApiEmbeddingsDeploymentName: "${embeddingChoice.modelName}"
  })`;
        case "aws":
            return `new ${embeddingChoice.className}({
    region: process.env.${embeddingChoice.apiKeyEnv},
    model: "${embeddingChoice.modelName}"
  })`;
        case "vertexai":
            return `new ${embeddingChoice.className}({
    model: "${embeddingChoice.modelName}"
  })`;
        default:
            return `new ${embeddingChoice.className}({
    apiKey: process.env.${embeddingChoice.apiKeyEnv},
    model: "${embeddingChoice.modelName}"
  })`;
    }
}
function createVectorStoreInitialization(vectorStoreChoice) {
    switch (vectorStoreChoice.value) {
        case "memory":
            return `const vectorStore = await ${vectorStoreChoice.className}.fromDocuments([], embeddings);`;
        case "chroma":
            return `const vectorStore = new ${vectorStoreChoice.className}(embeddings, {
    collectionName: "langchain-rag-collection"
  });`;
        case "faiss":
            return `const vectorStore = new ${vectorStoreChoice.className}(embeddings, {});`;
        case "mongodb":
            return `import { MongoClient } from "mongodb";

  const client = new MongoClient(process.env.${vectorStoreChoice.apiKeyEnv} || "");
  const collection = client
    .db(process.env.MONGODB_ATLAS_DB_NAME)
    .collection(process.env.MONGODB_ATLAS_COLLECTION_NAME);

  const vectorStore = new ${vectorStoreChoice.className}(embeddings, {
    collection: collection,
    indexName: "vector_index",
    textKey: "text",
    embeddingKey: "embedding"
  });`;
        case "pgvector":
            return `const vectorStore = await ${vectorStoreChoice.className}.initialize(embeddings, {
    connectionString: process.env.PG_CONNECTION_STRING
  });`;
        case "pinecone":
            return `const pinecone = new Pinecone({
    apiKey: process.env.${vectorStoreChoice.apiKeyEnv}
  });

  const indexName = process.env.PINECONE_INDEX || "langchain-rag-index";
  
  // Check if index exists, create if not
  const indexList = await pinecone.listIndexes();
  let pineconeIndex;
  
  if (!indexList.indexes?.some(idx => idx.name === indexName)) {
    console.log(\`Creating new Pinecone index: \${indexName}\`);
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536, // OpenAI embedding dimension (adjust if using different embeddings)
      metric: "cosine",
    });
  }
  
  pineconeIndex = pinecone.index(indexName);
  const vectorStore = new ${vectorStoreChoice.className}(embeddings, {
    pineconeIndex,
    maxConcurrency: 5
  });`;
        case "qdrant":
            return `const vectorStore = await ${vectorStoreChoice.className}.fromExistingCollection(
    embeddings,
    {
      url: process.env.QDRANT_URL || "http://localhost:6333",
      collectionName: "langchain-rag-collection",
    }
  );`;
        default:
            return `const vectorStore = await ${vectorStoreChoice.className}.fromDocuments([], embeddings);`;
    }
}
export { addAiRag };
